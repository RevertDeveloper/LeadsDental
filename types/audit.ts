import { z } from "zod";

export const auditActionSchema = z.enum([
  "LEAD_CREATED",
  "LEAD_UPDATED",
  "LEAD_DELETED",
  "NOTE_CREATED",
  "LEAD_STATUS_CHANGED",
  "LEAD_CLINIC_CHANGED",
  "AI_FOLLOWUP_REQUESTED",
  "AI_FOLLOWUP_GENERATED",
  "AI_FOLLOWUP_FAILED",
  "USER_CREATED",
  "USER_DEACTIVATED",
  "USER_REACTIVATED",
  "USER_DELETED",
]);

export type AuditAction = z.infer<typeof auditActionSchema>;

export const auditEntityTypeSchema = z.enum([
  "lead",
  "note",
  "user",
  "ai_followup",
]);

export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>;

const auditJsonObjectSchema = z.record(z.string(), z.json()).default({});

export const auditEntryInputSchema = z.object({
  actorUserId: z.string().uuid(),
  action: auditActionSchema,
  entityType: auditEntityTypeSchema,
  entityId: z.string().uuid(),
  oldValues: auditJsonObjectSchema,
  newValues: auditJsonObjectSchema,
  metadata: auditJsonObjectSchema,
});

export type AuditEntryInput = z.input<typeof auditEntryInputSchema>;
export type ParsedAuditEntryInput = z.infer<typeof auditEntryInputSchema>;

export type AuditLogRecord = {
  id: string;
  actor_user_id: string | null;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
};
