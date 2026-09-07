import { describe, expect, it, vi } from "vitest";

import { createNote } from "@/lib/notes/create-note";
import { noteCreateSchema } from "@/lib/validation/note-schemas";

const leadId = "33333333-3333-4333-8333-333333333333";
const clinicId = "11111111-1111-4111-8111-111111111111";

function supabaseStub({
  lead = { id: leadId, clinic_id: clinicId } as { id: string; clinic_id: string } | null,
  insertResult = {} as Record<string, unknown>,
}: {
  lead?: { id: string; clinic_id: string } | null;
  insertResult?: Record<string, unknown>;
} = {}) {
  const leadQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: lead, error: null }),
  };
  const insertQuery = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: insertResult, error: null }),
  };

  return {
    from: vi
      .fn()
      .mockReturnValueOnce(leadQuery)
      .mockReturnValueOnce(insertQuery),
    leadQuery,
    insertQuery,
  };
}

const validInput = {
  lead_id: leadId,
  text: "Ha confirmado que prefiere una llamada por la tarde.",
  type: "llamada",
  metadata: { channel: "phone" },
};

describe("noteCreateSchema", () => {
  it("normalizes text and defaults metadata to an object", () => {
    expect(
      noteCreateSchema.parse({ ...validInput, text: `  ${validInput.text}  ` }),
    ).toEqual({ ...validInput, text: validInput.text });
  });

  it("rejects invalid ids, types and empty text", () => {
    expect(() => noteCreateSchema.parse({ ...validInput, lead_id: "lead" })).toThrow();
    expect(() => noteCreateSchema.parse({ ...validInput, type: "email" })).toThrow();
    expect(() => noteCreateSchema.parse({ ...validInput, text: "   " })).toThrow();
  });
});

describe("createNote", () => {
  it("rejects malformed input before creating a Supabase client", async () => {
    const getSupabase = vi.fn();

    await expect(
      createNote({ ...validInput, lead_id: "not-a-uuid" }, { getSupabase }),
    ).resolves.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("checks the lead scope and stores the author and metadata", async () => {
    const note = {
      id: "44444444-4444-4444-8444-444444444444",
      ...validInput,
      created_at: "2026-09-07T12:00:00.000Z",
      created_by: "user-id",
    };
    const supabase = supabaseStub({ insertResult: note });
    const authorize = vi.fn().mockResolvedValue({ id: "user-id" }) as never;

    const result = await createNote(validInput, {
      authorize,
      getSupabase: vi.fn().mockResolvedValue(supabase),
    });

    expect(result).toEqual({ ok: true, note });
    expect(authorize).toHaveBeenCalledWith(clinicId);
    expect(supabase.insertQuery.insert).toHaveBeenCalledWith({
      lead_id: leadId,
      text: validInput.text,
      type: validInput.type,
      metadata: validInput.metadata,
      created_by: "user-id",
    });
  });

  it("does not insert when the lead is outside the visible scope", async () => {
    const supabase = supabaseStub({ lead: null });

    const result = await createNote(validInput, {
      authorize: vi.fn() as never,
      getSupabase: vi.fn().mockResolvedValue(supabase),
    });

    expect(result).toMatchObject({ code: "LEAD_NOT_FOUND" });
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});
