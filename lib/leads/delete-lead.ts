import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  createAuditEntry,
  getLeadAuditValues,
} from "@/lib/audit/create-audit-entry";
import { requireClinicAccess } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadRecord } from "@/types/leads";

export type DeleteLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; code: "VALIDATION_ERROR"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "AUDIT_ERROR"; message: string }
  | { ok: false; code: "DATABASE_ERROR"; message: string };

type DeleteLeadDependencies = {
  authorize?: typeof requireClinicAccess;
  getSupabase?: () => Promise<SupabaseClient>;
  createAuditEntry?: typeof createAuditEntry;
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
    .select(
      "id, name, phone, clinic_id, original_clinic_id, treatment, source, status, duplicate_of, deleted_at",
    )
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

  const lead = currentData as LeadRecord;
  const audit = dependencies.createAuditEntry ?? createAuditEntry;
  const auditResult = await audit({
    actorUserId: user.id,
    action: "LEAD_DELETED",
    entityType: "lead",
    entityId: lead.id,
    oldValues: getLeadAuditValues(lead),
    newValues: { ...getLeadAuditValues(lead), deleted_at: deletedAt },
    metadata: { soft_delete: true, source: "crm" },
  });

  if (!auditResult.ok) {
    return {
      ok: false,
      code: "AUDIT_ERROR",
      message: "El lead se eliminó, pero no se pudo registrar la auditoría.",
    };
  }

  return { ok: true, leadId: parsed.data };
}
