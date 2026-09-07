import { describe, expect, it, vi } from "vitest";

import { createLead } from "@/lib/leads/create-lead";

const clinicId = "11111111-1111-4111-8111-111111111111";
const duplicateId = "22222222-2222-4222-8222-222222222222";

const input = {
  name: "Ana García",
  phone: "+34 612 345 678",
  clinic_id: clinicId,
  treatment: "implantes",
  source: "web",
  status: "nuevo",
};

const duplicate = {
  id: duplicateId,
  name: "Ana García",
  phone: "612345678",
  phone_normalized: "612345678",
  clinic_id: clinicId,
  treatment: "implantes",
  source: "web",
  status: "nuevo",
  created_at: "2026-09-07T12:00:00.000Z",
};

function supabaseStub(result: { data: unknown; error: null | Error }) {
  const duplicateQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [duplicate], error: null }),
  };
  const insertQuery = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };

  return {
    from: vi
      .fn()
      .mockReturnValueOnce(duplicateQuery)
      .mockReturnValueOnce(insertQuery),
    query: insertQuery,
  };
}

describe("createLead", () => {
  it("returns a duplicate warning before inserting", async () => {
    const supabase = supabaseStub({ data: null, error: null });

    const result = await createLead(input, {
      authorize: vi.fn().mockResolvedValue({ id: "user-id" }) as never,
      getSupabase: vi.fn().mockResolvedValue(supabase),
    });

    expect(result).toMatchObject({ code: "DUPLICATE_FOUND" });
  });

  it("persists the normalized phone and confirmed duplicate", async () => {
    const lead = {
      ...input,
      id: "33333333-3333-4333-8333-333333333333",
      phone_normalized: "612345678",
      original_clinic_id: clinicId,
      duplicate_of: duplicateId,
    };
    const supabase = supabaseStub({ data: lead, error: null });

    const createAuditEntry = vi.fn().mockResolvedValue({ ok: true, entry: {} });
    const result = await createLead(
      { ...input, duplicate_of: duplicateId },
      {
        authorize: vi.fn().mockResolvedValue({ id: "user-id" }) as never,
        getSupabase: vi.fn().mockResolvedValue(supabase),
        createAuditEntry,
      },
    );

    expect(result.ok).toBe(true);
    expect(createAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LEAD_CREATED",
        entityType: "lead",
        entityId: lead.id,
      }),
    );
    expect(supabase.query.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        phone_normalized: "612345678",
        original_clinic_id: clinicId,
        duplicate_of: duplicateId,
        created_by: "user-id",
      }),
    );
  });

  it("does not audit a lead when the insert fails", async () => {
    const supabase = supabaseStub({ data: null, error: new Error("insert failed") });
    const createAuditEntry = vi.fn();

    const result = await createLead(
      { ...input, duplicate_of: duplicateId },
      {
        authorize: vi.fn().mockResolvedValue({ id: "user-id" }) as never,
        getSupabase: vi.fn().mockResolvedValue(supabase),
        createAuditEntry,
      },
    );

    expect(result).toMatchObject({ ok: false, code: "DATABASE_ERROR" });
    expect(createAuditEntry).not.toHaveBeenCalled();
  });
});
