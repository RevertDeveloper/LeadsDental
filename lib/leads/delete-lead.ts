import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireClinicAccess } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadRecord } from "@/types/leads";

export type DeleteLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; code: "VALIDATION_ERROR"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "DATABASE_ERROR"; message: string };

type DeleteLeadDependencies = {
  authorize?: typeof requireClinicAccess;
  getSupabase?: () => Promise<SupabaseClient>;
};

/** Marks a lead as deleted while preserving its row and related notes. */
export async function deleteLead(
  input: unknown,
  dependencies: DeleteLeadDependencies = {},
): Promise<DeleteLeadResult> {
  const parsed = z.string().uuid().safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "El identificador del lead no es válido.",
    };
  }

  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const { data: currentData, error: currentError } = await supabase
    .from("leads")
    .select("id, clinic_id, deleted_at")
    .eq("id", parsed.data)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo cargar el lead para eliminarlo.",
    };
  }

  if (!currentData) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "El lead no existe o ya ha sido eliminado.",
    };
  }

  const authorize = dependencies.authorize ?? requireClinicAccess;
  const user = await authorize((currentData as Pick<LeadRecord, "clinic_id">).clinic_id);
  const deletedAt = new Date().toISOString();
  const { error } = await supabase
    .from("leads")
    .update({
      deleted_at: deletedAt,
      deleted_by: user.id,
      updated_by: user.id,
    })
    .eq("id", parsed.data)
    .is("deleted_at", null);

  if (error) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo eliminar el lead. Inténtalo de nuevo.",
    };
  }

  return { ok: true, leadId: parsed.data };
}
