import "server-only";

import { z } from "zod";

import { canAccessClinic, requireAuthenticatedUser } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  leadSourceSchema,
  leadStatusSchema,
  treatmentSchema,
} from "@/lib/validation/lead-schemas";
import type { LeadWithClinic } from "@/types/leads";

const leadSortSchema = z.enum(["recent", "activity", "oldest"]);

export const leadFilterSchema = z.object({
  search: z.string().trim().max(120).optional(),
  clinic_id: z.string().uuid().optional(),
  status: leadStatusSchema.optional(),
  treatment: treatmentSchema.optional(),
  source: leadSourceSchema.optional(),
  sort: leadSortSchema.default("recent"),
});

export type LeadFilters = z.infer<typeof leadFilterSchema>;
export type LeadSort = z.infer<typeof leadSortSchema>;

const leadFields =
  "id, name, phone, phone_normalized, clinic_id, original_clinic_id, treatment, source, status, duplicate_of, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by";

function valueFromSearchParams(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseLeadFilters(
  searchParams: Record<string, string | string[] | undefined>,
): LeadFilters {
  const parsed = leadFilterSchema.safeParse({
    search: valueFromSearchParams(searchParams.search),
    clinic_id: valueFromSearchParams(searchParams.clinic_id),
    status: valueFromSearchParams(searchParams.status),
    treatment: valueFromSearchParams(searchParams.treatment),
    source: valueFromSearchParams(searchParams.source),
    sort: valueFromSearchParams(searchParams.sort),
  });

  return parsed.success ? parsed.data : { sort: "recent" };
}

/** Lists only active leads visible to the authenticated user's RLS scope. */
export async function listLeads(
  input: LeadFilters | Record<string, string | string[] | undefined> = {},
): Promise<LeadWithClinic[]> {
  const filters =
    "sort" in input
      ? leadFilterSchema.parse(input)
      : parseLeadFilters(input);
  const user = await requireAuthenticatedUser();

  if (filters.clinic_id && !canAccessClinic(user, filters.clinic_id)) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select(leadFields)
    .is("deleted_at", null);

  if (filters.clinic_id) {
    query = query.eq("clinic_id", filters.clinic_id);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.treatment) {
    query = query.eq("treatment", filters.treatment);
  }
  if (filters.source) {
    query = query.eq("source", filters.source);
  }

  const orderColumn = filters.sort === "activity" ? "updated_at" : "created_at";
  const ascending = filters.sort === "oldest";
  const { data, error } = await query.order(orderColumn, { ascending });

  if (error) {
    throw new Error("No se pudo cargar el listado de leads.");
  }

  const clinicsById = new Map(user.clinics.map((clinic) => [clinic.id, clinic]));
  const search = filters.search?.toLocaleLowerCase("es-ES");

  return ((data ?? []) as LeadWithClinic[]).filter((lead) => {
    const clinic = clinicsById.get(lead.clinic_id);

    if (!clinic) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [lead.name, lead.phone, clinic.name, clinic.city].some((value) =>
      value.toLocaleLowerCase("es-ES").includes(search),
    );
  }).map((lead) => ({
    ...lead,
    clinic: clinicsById.get(lead.clinic_id)!,
  }));
}
