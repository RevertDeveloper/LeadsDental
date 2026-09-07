import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createAuditEntry,
  getLeadAuditValues,
  getLeadChangedFields,
} from "@/lib/audit/create-audit-entry";
import { findDuplicateLeads, type LeadDuplicateCandidate } from "@/lib/leads/find-duplicates";
import { normalizePhone } from "@/lib/leads/normalize-phone";
import { canAccessClinic, requireClinicAccess } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { leadUpdateSchema } from "@/lib/validation/lead-schemas";
import type { LeadRecord } from "@/types/leads";
import type { LeadFieldErrors } from "@/lib/leads/create-lead";

export type UpdateLeadResult =
  | { ok: true; lead: LeadRecord }
  | { ok: false; code: "VALIDATION_ERROR"; fieldErrors: LeadFieldErrors }
  | { ok: false; code: "DUPLICATE_FOUND"; duplicates: LeadDuplicateCandidate[] }
  | {
      ok: false;
      code: "DUPLICATE_CONFIRMATION_INVALID";
      fieldErrors: LeadFieldErrors;
    }
  | { ok: false; code: "AUDIT_ERROR"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "DATABASE_ERROR"; message: string };

type UpdateLeadDependencies = {
  authorize?: typeof requireClinicAccess;
  getSupabase?: () => Promise<SupabaseClient>;
  createAuditEntry?: typeof createAuditEntry;
};

function issueMap(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.reduce<LeadFieldErrors>((errors, issue) => {
    const field = String(issue.path[0] ?? "form");
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

/** Updates an active lead while preserving its first assigned clinic. */
export async function updateLead(
  input: unknown,
  dependencies: UpdateLeadDependencies = {},
): Promise<UpdateLeadResult> {
  const parsed = leadUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      fieldErrors: issueMap(parsed.error.issues),
    };
  }

  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const authorize = dependencies.authorize ?? requireClinicAccess;
  const user = await authorize(parsed.data.clinic_id);
  const { data: currentData, error: currentError } = await supabase
    .from("leads")
    .select(
      "id, name, phone, phone_normalized, clinic_id, original_clinic_id, treatment, source, status, duplicate_of, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by",
    )
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo cargar el lead para editarlo.",
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

  if (!canAccessClinic(user, current.clinic_id)) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "El lead no existe o ya no está disponible.",
    };
  }

  if (parsed.data.clinic_id !== current.clinic_id) {
    await authorize(parsed.data.clinic_id);
  }

  const duplicates = await findDuplicateLeads(
    supabase,
    parsed.data.phone,
    parsed.data.id,
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

  const leadFields = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    clinic_id: parsed.data.clinic_id,
    treatment: parsed.data.treatment,
    source: parsed.data.source,
    status: parsed.data.status,
  };
  const { data, error } = await supabase
    .from("leads")
    .update({
      ...leadFields,
      phone_normalized: normalizePhone(parsed.data.phone),
      original_clinic_id: current.original_clinic_id ?? current.clinic_id,
      duplicate_of: duplicateId ?? current.duplicate_of ?? null,
      updated_by: user.id,
    })
    .eq("id", parsed.data.id)
    .select(
      "id, name, phone, phone_normalized, clinic_id, original_clinic_id, treatment, source, status, duplicate_of, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by",
    )
    .single();

  if (error || !data) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo actualizar el lead. Inténtalo de nuevo.",
    };
  }

  const lead = data as LeadRecord;
  const audit = dependencies.createAuditEntry ?? createAuditEntry;
  const changedFields = getLeadChangedFields(current, lead);
  const auditContext = {
    actorUserId: user.id,
    entityType: "lead" as const,
    entityId: lead.id,
  };
  const updateAudit = await audit({
    ...auditContext,
    action: "LEAD_UPDATED",
    oldValues: getLeadAuditValues(current),
    newValues: getLeadAuditValues(lead),
    metadata: { changed_fields: changedFields, source: "crm" },
  });

  if (!updateAudit.ok) {
    return {
      ok: false,
      code: "AUDIT_ERROR",
      message: "El lead se actualizó, pero no se pudo registrar la auditoría.",
    };
  }

  if (current.status !== lead.status) {
    const statusAudit = await audit({
      ...auditContext,
      action: "LEAD_STATUS_CHANGED",
      oldValues: { status: current.status },
      newValues: { status: lead.status },
      metadata: { source: "crm" },
    });

    if (!statusAudit.ok) {
      return {
        ok: false,
        code: "AUDIT_ERROR",
        message: "El lead se actualizó, pero no se pudo registrar la auditoría.",
      };
    }
  }

  if (current.clinic_id !== lead.clinic_id) {
    const clinicAudit = await audit({
      ...auditContext,
      action: "LEAD_CLINIC_CHANGED",
      oldValues: { clinic_id: current.clinic_id },
      newValues: { clinic_id: lead.clinic_id },
      metadata: { source: "crm" },
    });

    if (!clinicAudit.ok) {
      return {
        ok: false,
        code: "AUDIT_ERROR",
        message: "El lead se actualizó, pero no se pudo registrar la auditoría.",
      };
    }
  }

  return { ok: true, lead };
}
