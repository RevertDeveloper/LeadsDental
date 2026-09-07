import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAuthenticatedUser } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadStatus, Treatment } from "@/types/leads";
import type {
  DashboardClinicMetric,
  DashboardStats,
  DashboardStatusMetric,
  DashboardTreatmentMetric,
} from "@/types/dashboard";

const statusOrder: LeadStatus[] = [
  "nuevo",
  "contactado",
  "cita_agendada",
  "no_interesado",
  "cliente",
];

const treatmentOrder: Treatment[] = [
  "implantes",
  "ortodoncia",
  "estetica",
  "revision",
];

type DashboardLeadRow = {
  clinic_id: string;
  status: LeadStatus;
  treatment: Treatment;
};

type DashboardStatsDependencies = {
  authorize?: typeof requireAuthenticatedUser;
  getSupabase?: () => Promise<SupabaseClient>;
};

function countBy<T extends string>(rows: DashboardLeadRow[], selector: (row: DashboardLeadRow) => T) {
  const counts = new Map<T, number>();

  for (const row of rows) {
    counts.set(selector(row), (counts.get(selector(row)) ?? 0) + 1);
  }

  return counts;
}

function buildStatusDistribution(
  rows: DashboardLeadRow[],
): DashboardStatusMetric[] {
  const counts = countBy(rows, (row) => row.status);

  return statusOrder.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

function buildTreatmentDistribution(
  rows: DashboardLeadRow[],
): DashboardTreatmentMetric[] {
  const counts = countBy(rows, (row) => row.treatment);

  return treatmentOrder.map((treatment) => ({
    treatment,
    count: counts.get(treatment) ?? 0,
  }));
}

/**
 * Returns operational lead metrics from the current user's RLS-scoped view.
 * Soft-deleted leads are excluded both explicitly and by the database policy.
 */
export async function getDashboardStats(
  dependencies: DashboardStatsDependencies = {},
): Promise<DashboardStats> {
  const user = await (dependencies.authorize ?? requireAuthenticatedUser)();
  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("clinic_id, status, treatment")
    .is("deleted_at", null);

  if (error) {
    throw new Error("No se pudieron cargar las métricas del dashboard.");
  }

  const rows = (data ?? []) as DashboardLeadRow[];
  const clinicCounts = countBy(rows, (row) => row.clinic_id);
  const clinicDistribution: DashboardClinicMetric[] = user.clinics.map((clinic) => ({
    clinicId: clinic.id,
    clinicName: clinic.name,
    city: clinic.city,
    color: clinic.color,
    count: clinicCounts.get(clinic.id) ?? 0,
  }));

  return {
    totalLeads: rows.length,
    newLeads: rows.filter((row) => row.status === "nuevo").length,
    scheduledAppointments: rows.filter((row) => row.status === "cita_agendada").length,
    implantLeads: rows.filter((row) => row.treatment === "implantes").length,
    statusDistribution: buildStatusDistribution(rows),
    clinicDistribution,
    treatmentDistribution: buildTreatmentDistribution(rows),
  };
}
