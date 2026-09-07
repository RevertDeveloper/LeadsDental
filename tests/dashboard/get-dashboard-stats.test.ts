import { describe, expect, it, vi } from "vitest";

import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import type { CurrentUser } from "@/types/auth";

const madrid = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Clínica Dental Vitalis Madrid",
  city: "Madrid",
  slug: "madrid",
  color: "#2563EB",
  active: true,
};

const valencia = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Clínica Dental Vitalis Valencia",
  city: "Valencia",
  slug: "valencia",
  color: "#059669",
  active: true,
};

const rows = [
  { clinic_id: madrid.id, status: "nuevo", treatment: "implantes" },
  { clinic_id: madrid.id, status: "cita_agendada", treatment: "ortodoncia" },
  { clinic_id: valencia.id, status: "cliente", treatment: "implantes" },
  { clinic_id: madrid.id, status: "nuevo", treatment: "revision" },
] as const;

function userFor(
  role: CurrentUser["role"],
  clinics: readonly CurrentUser["clinics"][number][],
): CurrentUser {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    email: `${role.toLowerCase()}@vitalis.test`,
    fullName: role,
    role,
    active: true,
    clinics: [...clinics],
  };
}

function supabaseStub() {
  const query = {
    select: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue({ data: rows, error: null }),
  };

  return {
    from: vi.fn().mockReturnValue(query),
    query,
  };
}

describe("getDashboardStats", () => {
  it.each([
    ["ADMIN", [madrid, valencia]],
    ["CLINIC_MANAGER", [madrid]],
    ["RECEPTIONIST", [madrid]],
  ] as const)("returns scoped metrics for %s", async (role, clinics) => {
    const supabase = supabaseStub();
    const authorize = vi.fn().mockResolvedValue(userFor(role, clinics));

    const result = await getDashboardStats({
      authorize: authorize as never,
      getSupabase: vi.fn().mockResolvedValue(supabase),
    });

    expect(authorize).toHaveBeenCalledOnce();
    expect(supabase.from).toHaveBeenCalledWith("leads");
    expect(supabase.query.select).toHaveBeenCalledWith(
      "clinic_id, status, treatment",
    );
    expect(supabase.query.is).toHaveBeenCalledWith("deleted_at", null);
    expect(result).toMatchObject({
      totalLeads: 4,
      newLeads: 2,
      scheduledAppointments: 1,
      implantLeads: 2,
    });
    expect(result.clinicDistribution).toHaveLength(clinics.length);
  });

  it("keeps zero-value categories so the dashboard contract stays stable", async () => {
    const result = await getDashboardStats({
      authorize: vi.fn().mockResolvedValue(userFor("RECEPTIONIST", [madrid])) as never,
      getSupabase: vi.fn().mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          is: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }) as never,
    });

    expect(result.statusDistribution).toHaveLength(5);
    expect(result.treatmentDistribution).toHaveLength(4);
    expect(result.statusDistribution.every((metric) => metric.count === 0)).toBe(true);
    expect(result.clinicDistribution[0]).toMatchObject({
      clinicId: madrid.id,
      count: 0,
    });
  });
});
