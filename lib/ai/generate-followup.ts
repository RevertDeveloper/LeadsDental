import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAuditEntry } from "@/lib/audit/create-audit-entry";
import { buildFollowupContext } from "@/lib/ai/build-followup-context";
import {
  FollowupProviderError,
  requestFollowupMessage,
  type GeneratedFollowup,
  type OpenAIClientDependencies,
  type OpenAIResponsesClient,
} from "@/lib/ai/openai-client";
import { checkAiGenerationRateLimit } from "@/lib/ai/rate-limit";
import { getLeadById } from "@/lib/leads/get-lead";
import { listLeadNotes } from "@/lib/notes/list-notes";
import { requireClinicAccess } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clinicIdSchema } from "@/types/auth";
import type { AuditEntryInput } from "@/types/audit";
import type { FollowupContext } from "@/types/ai";
import type { NoteRecord } from "@/types/notes";

export type GenerateFollowupDependencies = {
  getEnvironment?: OpenAIClientDependencies["getEnvironment"];
  getClient?: (apiKey: string) => OpenAIResponsesClient;
  now?: () => number;
  createRequestId?: () => string;
};

export type GenerateAndPersistFollowupDependencies =
  GenerateFollowupDependencies & {
    getLead?: typeof getLeadById;
    listNotes?: typeof listLeadNotes;
    authorize?: typeof requireClinicAccess;
    getSupabase?: () => Promise<SupabaseClient>;
    createAuditEntry?: typeof createAuditEntry;
    generate?: typeof generateFollowupMessage;
    checkRateLimit?: typeof checkAiGenerationRateLimit;
  };

export type GenerateAndPersistFollowupResult =
  | { ok: true; note: NoteRecord; generation: GeneratedFollowup }
  | {
      ok: false;
      code:
        | "VALIDATION_ERROR"
        | "LEAD_NOT_FOUND"
        | "AUDIT_ERROR"
        | "GENERATION_FAILED"
        | "RATE_LIMITED"
        | "DATABASE_ERROR";
      message: string;
    };

/** Provider-facing generation primitive. Persistence is handled by the domain flow. */
export function generateFollowupMessage(
  context: FollowupContext,
  dependencies: GenerateFollowupDependencies = {},
): Promise<GeneratedFollowup> {
  return requestFollowupMessage(context, dependencies);
}

const auditDefaults: Pick<AuditEntryInput, "oldValues" | "newValues"> = {
  oldValues: {},
  newValues: {},
};

function auditMetadata(requestId: string, source = "crm") {
  return { request_id: requestId, source };
}

async function recordFailure(
  actorUserId: string,
  leadId: string,
  requestId: string,
  reason: "provider_error" | "invalid_response" | "persistence_error",
  audit: typeof createAuditEntry,
) {
  return audit({
    ...auditDefaults,
    actorUserId,
    action: "AI_FOLLOWUP_FAILED",
    entityType: "ai_followup",
    entityId: leadId,
    metadata: { ...auditMetadata(requestId), reason },
  });
}

/** Generates a supervised draft and atomically persists its note and audit. */
export async function generateAndPersistFollowup(
  leadId: unknown,
  dependencies: GenerateAndPersistFollowupDependencies = {},
): Promise<GenerateAndPersistFollowupResult> {
  const parsedLeadId = clinicIdSchema.safeParse(leadId);

  if (!parsedLeadId.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "El identificador del lead no es válido.",
    };
  }

  const getLead = dependencies.getLead ?? getLeadById;
  const lead = await getLead(parsedLeadId.data);

  if (!lead) {
    return {
      ok: false,
      code: "LEAD_NOT_FOUND",
      message: "No se encontró el lead o no tienes acceso a él.",
    };
  }

  const authorize = dependencies.authorize ?? requireClinicAccess;
  const user = await authorize(lead.clinic_id);
  const checkRateLimit = dependencies.checkRateLimit ?? checkAiGenerationRateLimit;
  const rateLimit = checkRateLimit(user.id, (dependencies.now ?? Date.now)());

  if (!rateLimit.allowed) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: `Has alcanzado el límite de generaciones. Vuelve a intentarlo en ${rateLimit.retryAfterSeconds} s.`,
    };
  }

  const getNotes = dependencies.listNotes ?? listLeadNotes;
  const notes = await getNotes(lead.id);
  const context = buildFollowupContext(lead, notes);
  const requestId = dependencies.createRequestId
    ? dependencies.createRequestId()
    : crypto.randomUUID();
  const audit = dependencies.createAuditEntry ?? createAuditEntry;

  const requestedAudit = await audit({
    ...auditDefaults,
    actorUserId: user.id,
    action: "AI_FOLLOWUP_REQUESTED",
    entityType: "ai_followup",
    entityId: lead.id,
    metadata: {
      ...auditMetadata(requestId),
      prompt_version: "1.0",
    },
  });

  if (!requestedAudit.ok) {
    return {
      ok: false,
      code: "AUDIT_ERROR",
      message: "No se pudo registrar la solicitud de IA.",
    };
  }

  let generation: GeneratedFollowup;

  try {
    const generate = dependencies.generate ?? generateFollowupMessage;
    generation = await generate(context, {
      getEnvironment: dependencies.getEnvironment,
      getClient: dependencies.getClient,
      now: dependencies.now,
      createRequestId: () => requestId,
    });
  } catch (error) {
    const reason =
      error instanceof FollowupProviderError && error.code === "INVALID_RESPONSE"
        ? "invalid_response"
        : "provider_error";
    await recordFailure(user.id, lead.id, requestId, reason, audit);
    return {
      ok: false,
      code: "GENERATION_FAILED",
      message: "No se pudo generar el mensaje de seguimiento. Inténtalo de nuevo.",
    };
  }

  const generatedAt = new Date((dependencies.now ?? Date.now)()).toISOString();
  const metadata = {
    model: generation.model,
    prompt_version: generation.promptVersion,
    request_id: generation.requestId,
    generated_at: generatedAt,
    latency_ms: generation.latencyMs,
  };
  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("persist_ai_followup", {
    p_lead_id: lead.id,
    p_text: generation.message,
    p_metadata: metadata,
    p_request_id: generation.requestId,
    p_actor_user_id: user.id,
  });

  if (error || !data) {
    await recordFailure(user.id, lead.id, generation.requestId, "persistence_error", audit);
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo guardar el borrador generado.",
    };
  }

  return {
    ok: true,
    note: data as NoteRecord,
    generation,
  };
}
