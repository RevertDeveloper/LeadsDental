import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { findDuplicateLeads, type LeadDuplicateCandidate } from "@/lib/leads/find-duplicates";
import { normalizePhone } from "@/lib/leads/normalize-phone";
import { requireClinicAccess } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { leadCreateSchema } from "@/lib/validation/lead-schemas";
import type { LeadRecord } from "@/types/leads";

export type LeadFieldErrors = Record<string, string[]>;

export type CreateLeadResult =
  | { ok: true; lead: LeadRecord }
  | {
      ok: false;
      code: "VALIDATION_ERROR";
      fieldErrors: LeadFieldErrors;
    }
  | {
      ok: false;
      code: "DUPLICATE_FOUND";
      duplicates: LeadDuplicateCandidate[];
    }
  | {
      ok: false;
      code: "DUPLICATE_CONFIRMATION_INVALID";
      fieldErrors: LeadFieldErrors;
    }
  | { ok: false; code: "DATABASE_ERROR"; message: string };

type CreateLeadDependencies = {
  authorize?: typeof requireClinicAccess;
  getSupabase?: () => Promise<SupabaseClient>;
};

function issueMap(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.reduce<LeadFieldErrors>((errors, issue) => {
    const field = String(issue.path[0] ?? "form");
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

/** Creates a lead through the authenticated Supabase client and RLS. */
export async function createLead(
  input: unknown,
  dependencies: CreateLeadDependencies = {},
): Promise<CreateLeadResult> {
  const parsed = leadCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      fieldErrors: issueMap(parsed.error.issues),
    };
  }

  const authorize = dependencies.authorize ?? requireClinicAccess;
  const user = await authorize(parsed.data.clinic_id);
  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const duplicates = await findDuplicateLeads(
    supabase,
    parsed.data.phone,
  );
  const duplicateId = parsed.data.duplicate_of;

  if (duplicates.length > 0 && !duplicateId) {
    return { ok: false, code: "DUPLICATE_FOUND", duplicates };
  }

  if (
    duplicateId &&
    !duplicates.some((duplicate) => duplicate.id === duplicateId)
  ) {
    return {
      ok: false,
      code: "DUPLICATE_CONFIRMATION_INVALID",
      fieldErrors: {
        phone: [
          "El posible duplicado ya no está disponible. Vuelve a comprobar el teléfono.",
        ],
      },
    };
  }

  const leadFields = { ...parsed.data };
  delete leadFields.duplicate_of;
  const { data, error } = await supabase
    .from("leads")
    .insert({
      ...leadFields,
      phone_normalized: normalizePhone(parsed.data.phone),
      original_clinic_id: parsed.data.clinic_id,
      duplicate_of: duplicateId ?? null,
      created_by: user.id,
      updated_by: user.id,
    })
    .select(
      "id, name, phone, phone_normalized, clinic_id, original_clinic_id, treatment, source, status, duplicate_of, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by",
    )
    .single();

  if (error || !data) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo crear el lead. Inténtalo de nuevo.",
    };
  }

  return { ok: true, lead: data as LeadRecord };
}
