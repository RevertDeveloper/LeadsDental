import { describe, expect, it, vi } from "vitest";

import { updateLead } from "@/lib/leads/update-lead";

const userId = "11111111-1111-4111-8111-111111111111";
const leadId = "22222222-2222-4222-8222-222222222222";
const firstClinicId = "33333333-3333-4333-8333-333333333333";
const secondClinicId = "44444444-4444-4444-8444-444444444444";

const input = {
  id: leadId,
  name: "Ana García",
  phone: "+34 612 345 678",
  clinic_id: secondClinicId,
  treatment: "implantes" as const,
  source: "web" as const,
  status: "contactado" as const,
};

const currentLead = {
  id: leadId,
  name: "Ana García",
  phone: "+34 612 345 678",
  phone_normalized: "612345678",
  clinic_id: firstClinicId,
  original_clinic_id: firstClinicId,
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
  clinic_id: secondClinicId,
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
  const duplicateQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    neq: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  const updateQuery = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: updatedLead, error: null }),
  };

  return {
    from: vi
      .fn()
      .mockReturnValueOnce(currentQuery)
      .mockReturnValueOnce(duplicateQuery)
      .mockReturnValueOnce(updateQuery),
    updateQuery,
  };
}

describe("updateLead audit integration", () => {
  it("records the update and specific status and clinic transitions", async () => {
    const supabase = supabaseStub();
    const createAuditEntry = vi.fn().mockResolvedValue({ ok: true, entry: {} });
    const authorize = vi.fn().mockResolvedValue({
      id: userId,
      role: "ADMIN",
      clinics: [],
    });

    const result = await updateLead(input, {
      authorize: authorize as never,
      getSupabase: vi.fn().mockResolvedValue(supabase),
      createAuditEntry,
    });

    expect(result).toMatchObject({ ok: true, lead: updatedLead });
    expect(createAuditEntry).toHaveBeenCalledTimes(3);
    expect(createAuditEntry.mock.calls.map(([entry]) => entry.action)).toEqual([
      "LEAD_UPDATED",
      "LEAD_STATUS_CHANGED",
      "LEAD_CLINIC_CHANGED",
    ]);
    expect(createAuditEntry.mock.calls[1][0]).toMatchObject({
      oldValues: { status: "nuevo" },
      newValues: { status: "contactado" },
    });
    expect(createAuditEntry.mock.calls[2][0]).toMatchObject({
      oldValues: { clinic_id: firstClinicId },
      newValues: { clinic_id: secondClinicId },
    });
  });
});
