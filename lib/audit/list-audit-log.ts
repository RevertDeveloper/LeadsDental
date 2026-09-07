import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuditAction, AuditEntityType } from "@/types/audit";

export type AuditLogListRecord = {
  id: string;
  actor_user_id: string | null;
  actor_name: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
};

const auditFields = "id, actor_user_id, action, entity_type, entity_id, old_values, new_values, metadata, created_at";
const blockedKeys = /password|secret|token|api.?key|prompt|content|message/i;

/** Keeps the ADMIN audit view useful without exposing sensitive payloads. */
export function redactAuditValues(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !blockedKeys.test(key))
      .map(([key, entry]) => [
        key,
        typeof entry === "string" && entry.length > 160 ? `${entry.slice(0, 157)}…` : entry,
      ]),
  );
}

export async function listAuditLog(limit = 100): Promise<AuditLogListRecord[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: entries, error: entriesError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase.from("audit_log").select(auditFields).order("created_at", { ascending: false }).limit(limit),
    supabase.from("profiles").select("id, full_name"),
  ]);

  if (entriesError || profilesError) throw new Error("No se pudo cargar la auditoría.");

  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return (entries ?? []).map((entry) => ({
    id: entry.id,
    actor_user_id: entry.actor_user_id,
    actor_name: entry.actor_user_id ? names.get(entry.actor_user_id) ?? "Usuario interno" : "Sistema",
    action: entry.action as AuditAction,
    entity_type: entry.entity_type as AuditEntityType,
    entity_id: entry.entity_id,
    old_values: redactAuditValues(entry.old_values),
    new_values: redactAuditValues(entry.new_values),
    metadata: redactAuditValues(entry.metadata),
    created_at: entry.created_at,
  }));
}
