import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  auditEntryInputSchema,
  type AuditEntryInput,
  type AuditLogRecord,
} from "@/types/audit";
import type { LeadRecord } from "@/types/leads";

const auditFields =
  "id, actor_user_id, action, entity_type, entity_id, old_values, new_values, metadata, created_at";

export type CreateAuditEntryResult =
  | { ok: true; entry: AuditLogRecord }
  | {
      ok: false;
      code: "VALIDATION_ERROR" | "DATABASE_ERROR";
      message: string;
    };

type CreateAuditEntryDependencies = {
  getSupabase?: () => Promise<SupabaseClient>;
};

/**
 * Creates one append-only audit entry through the authenticated Supabase
 * client. The actor is supplied by server-side authorization, never by UI
 * metadata.
 */
export async function createAuditEntry(
  input: AuditEntryInput,
  dependencies: CreateAuditEntryDependencies = {},
): Promise<CreateAuditEntryResult> {
  const parsed = auditEntryInputSchema.safeParse({
    oldValues: {},
    newValues: {},
    metadata: {},
    ...input,
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Los datos de auditoría no son válidos.",
    };
  }

  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_log")
    .insert({
      actor_user_id: parsed.data.actorUserId,
      action: parsed.data.action,
      entity_type: parsed.data.entityType,
      entity_id: parsed.data.entityId,
      old_values: parsed.data.oldValues,
      new_values: parsed.data.newValues,
      metadata: parsed.data.metadata,
    })
    .select(auditFields)
    .single();

  if (error || !data) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo registrar la auditoría.",
    };
  }

  return { ok: true, entry: data as AuditLogRecord };
}

type AuditableLead = Pick<
  LeadRecord,
  | "id"
  | "name"
  | "phone"
  | "clinic_id"
  | "original_clinic_id"
  | "treatment"
  | "source"
  | "status"
  | "duplicate_of"
>;

/** Returns the non-PII lead fields useful for an audit snapshot. */
export function getLeadAuditValues(lead: AuditableLead) {
  return {
    clinic_id: lead.clinic_id,
    original_clinic_id: lead.original_clinic_id,
    treatment: lead.treatment,
    source: lead.source,
    status: lead.status,
    duplicate_of: lead.duplicate_of,
  };
}

/** Lists changed business fields without copying PII into the audit log. */
export function getLeadChangedFields(
  previous: AuditableLead,
  next: AuditableLead,
) {
  return (['name', 'phone', 'clinic_id', 'treatment', 'source', 'status', 'duplicate_of'] as const).filter(
    (field) => previous[field] !== next[field],
  );
}
