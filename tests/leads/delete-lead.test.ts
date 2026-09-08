import { describe, expect, it, vi } from "vitest";

import { deleteLead } from "@/lib/leads/delete-lead";

const leadId = "33333333-3333-4333-8333-333333333333";
const clinicId = "11111111-1111-4111-8111-111111111111";

function supabaseStub() {
  const currentQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: { id: leadId, clinic_id: clinicId, deleted_at: null },
      error: null,
    }),
  };
  const rpc = vi.fn().mockResolvedValue({
    data: { id: leadId, deleted_at: "2026-09-07T12:31:00.000Z" },
    error: null,
  });

  return {
    from: vi.fn().mockReturnValueOnce(currentQuery),
    rpc,
    currentQuery,
  };
}

describe("deleteLead", () => {
  it("rejects malformed ids before touching the database", async () => {
    const getSupabase = vi.fn();

    await expect(deleteLead("not-a-uuid", { getSupabase })).resolves.toMatchObject({
      ok: false,
      code: "VALIDATION_ERROR",
    });
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("marks the row with deletion metadata and never hard-deletes it", async () => {
    const supabase = supabaseStub();
    const createAuditEntry = vi.fn().mockResolvedValue({ ok: true, entry: {} });
    const result = await deleteLead(leadId, {
      getSupabase: vi.fn().mockResolvedValue(supabase),
      authorize: vi.fn().mockResolvedValue({ id: "user-id" }) as never,
      createAuditEntry,
    });

    expect(result).toEqual({ ok: true, leadId });
    expect(createAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ action: "LEAD_DELETED", entityId: leadId }),
    );
    expect(supabase.rpc).toHaveBeenCalledWith("soft_delete_lead", {
      p_lead_id: leadId,
      p_actor_user_id: "user-id",
    });
  });
});
