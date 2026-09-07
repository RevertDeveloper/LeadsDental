import "server-only";

import { requireAuthenticatedUser } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clinicIdSchema } from "@/types/auth";
import type { LeadWithClinic } from "@/types/leads";

const leadFields =
  "id, name, phone, phone_normalized, clinic_id, original_clinic_id, treatment, source, status, duplicate_of, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by";

/** Loads one active lead inside the current user's RLS and clinic scope. */
export async function getLeadById(id: string): Promise<LeadWithClinic | null> {
  if (!clinicIdSchema.safeParse(id).success) {
    return null;
  }

  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select(leadFields)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar el lead.");
  }

  if (!data) {
    return null;
  }

  const lead = data as LeadWithClinic;
  const clinic = user.clinics.find((candidate) => candidate.id === lead.clinic_id);

  return clinic ? { ...lead, clinic } : null;
}
