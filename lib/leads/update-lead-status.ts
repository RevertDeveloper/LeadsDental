import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit/create-audit-entry";
import { requireClinicAccess } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { leadStatusSchema } from "@/lib/validation/lead-schemas";
import { clinicIdSchema } from "@/types/auth";
import type { LeadRecord, LeadStatus } from "@/types/leads";

const leadStatusInputSchema = z.object({
  lead_id: clinicIdSchema,
  status: leadStatusSchema,
});

const leadFields =
  "id, name, phone, phone_normalized, clinic_id, original_clinic_id, treatment, source, status, duplicate_of, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by";

export type UpdateLeadStatusResult =
  | { ok: true; lead: LeadRecord }
  | { ok: false; code: "VALIDATION_ERROR"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "AUDIT_ERROR"; message: string }
  | { ok: false; code: "DATABASE_ERROR"; message: string };

type UpdateLeadStatusDependencies = {
  authorize?: typeof requireClinicAccess;
  getSupabase?: () => Promise<SupabaseClient>;
  createAuditEntry?: typeof createAuditEntry;
};

/** Updates only the pipeline status after re-reading the lead under RLS. */
export async function updateLeadStatus(
  input: unknown,
  dependencies: UpdateLeadStatusDependencies = {},
): Promise<UpdateLeadStatusResult> {
  const parsed = leadStatusInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "El estado del lead no es válido.",
    };
  }

  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const { data: currentData, error: currentError } = await supabase
    .from("leads")
    .select(leadFields)
    .eq("id", parsed.data.lead_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo cargar el lead para actualizar su estado.",
    };
  }

  if (!currentData) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "El lead no existe o ya no está disponible.",
    };
  }

  const current = currentData as LeadRecord;
  const authorize = dependencies.authorize ?? requireClinicAccess;
  const user = await authorize(current.clinic_id);

  if (current.status === parsed.data.status) {
    return { ok: true, lead: current };
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      status: parsed.data.status,
      updated_by: user.id,
    })
    .eq("id", current.id)
    .eq("status", current.status)
    .is("deleted_at", null)
    .select(leadFields)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo actualizar el estado. Inténtalo de nuevo.",
    };
  }

  if (!data) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "El lead cambió mientras lo actualizabas. Recarga la ficha.",
    };
  }

  const lead = data as LeadRecord;
  const audit = dependencies.createAuditEntry ?? createAuditEntry;
  const auditResult = await audit({
    actorUserId: user.id,
    action: "LEAD_STATUS_CHANGED",
    entityType: "lead",
    entityId: lead.id,
    oldValues: { status: current.status },
    newValues: { status: lead.status },
    metadata: {
      source: "crm",
      transition: `${current.status}->${lead.status}`,
    },
  });

  if (!auditResult.ok) {
    return {
      ok: false,
      code: "AUDIT_ERROR",
      message: "El estado se actualizó, pero no se pudo registrar la auditoría.",
    };
  }

  return { ok: true, lead };
}

export type { LeadStatus };
