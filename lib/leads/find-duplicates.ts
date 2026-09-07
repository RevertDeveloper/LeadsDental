import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizePhone } from "@/lib/leads/normalize-phone";
import type { LeadRecord } from "@/types/leads";

export type LeadDuplicateCandidate = Pick<
  LeadRecord,
  | "id"
  | "name"
  | "phone"
  | "phone_normalized"
  | "clinic_id"
  | "treatment"
  | "source"
  | "status"
  | "created_at"
>;

type LeadQueryRow = LeadDuplicateCandidate;

const duplicateFields =
  "id, name, phone, phone_normalized, clinic_id, treatment, source, status, created_at";

/** Finds active leads with the same normalized phone without merging records. */
export async function findDuplicateLeads(
  supabase: SupabaseClient,
  phone: string,
  excludeLeadId?: string,
): Promise<LeadDuplicateCandidate[]> {
  const normalizedPhone = normalizePhone(phone);
  let query = supabase
    .from("leads")
    .select(duplicateFields)
    .eq("phone_normalized", normalizedPhone)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  if (excludeLeadId) {
    query = query.neq("id", excludeLeadId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("No se pudieron comprobar los posibles duplicados.");
  }

  return (data ?? []) as LeadQueryRow[];
}
