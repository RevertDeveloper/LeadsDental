import { describe, expect, it, vi } from "vitest";

import { updateLeadStatus } from "@/lib/leads/update-lead-status";

const userId = "11111111-1111-4111-8111-111111111111";
const leadId = "22222222-2222-4222-8222-222222222222";
const clinicId = "33333333-3333-4333-8333-333333333333";

const currentLead = {
  id: leadId,
  name: "Ana García",
  phone: "+34 612 345 678",
  phone_normalized: "612345678",
  clinic_id: clinicId,
  original_clinic_id: clinicId,
  treatment: "implantes" as const,
  source: "web" as const,
  status: "nuevo" as const,
  duplicate_of: null,
  created_at: "2026-09-07T12:00:00.000Z",
  updated_at: "2026-09-07T12:00:00.000Z",
  created_by: userId,
  updated_by: userId,
  deleted_at: null,
  deleted_by: null,
};

const updatedLead = {
  ...currentLead,
  status: "contactado" as const,
  updated_at: "2026-09-07T12:05:00.000Z",
};

function supabaseStub() {
  const currentQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: currentLead, error: null }),
  };
  const updateQuery = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: updatedLead, error: null }),
  };

  return {
    from: vi.fn().mockReturnValueOnce(currentQuery).mockReturnValueOnce(updateQuery),
    updateQuery,
  };
}

describe("updateLeadStatus", () => {
  it("validates the input before opening the database", async () => {
    const getSupabase = vi.fn();

    await expect(
      updateLeadStatus({ lead_id: "not-a-uuid", status: "contactado" }, { getSupabase }),
    ).resolves.toEqual({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "El estado del lead no es válido.",
    });
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("updates the status through the lead clinic scope and audits old/new values", async () => {
    const supabase = supabaseStub();
    const authorize = vi.fn().mockResolvedValue({
      id: userId,
      role: "RECEPTIONIST",
      clinics: [{ id: clinicId }],
    });
    const createAuditEntry = vi.fn().mockResolvedValue({ ok: true, entry: {} });

    const result = await updateLeadStatus(
      { lead_id: leadId, status: "contactado" },
      {
        authorize: authorize as never,
        getSupabase: vi.fn().mockResolvedValue(supabase),
        createAuditEntry,
      },
    );

    expect(result).toMatchObject({ ok: true, lead: updatedLead });
    expect(authorize).toHaveBeenCalledWith(clinicId);
    expect(supabase.updateQuery.update).toHaveBeenCalledWith({
      status: "contactado",
      updated_by: userId,
    });
    expect(createAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LEAD_STATUS_CHANGED",
        oldValues: { status: "nuevo" },
        newValues: { status: "contactado" },
      }),
    );
  });

  it("does not create audit noise for a no-op transition", async () => {
    const supabase = supabaseStub();
    const createAuditEntry = vi.fn();

    const result = await updateLeadStatus(
      { lead_id: leadId, status: "nuevo" },
      {
        authorize: vi.fn().mockResolvedValue({ id: userId, role: "ADMIN", clinics: [] }) as never,
        getSupabase: vi.fn().mockResolvedValue(supabase),
        createAuditEntry,
      },
    );

    expect(result).toMatchObject({ ok: true, lead: currentLead });
    expect(createAuditEntry).not.toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});
