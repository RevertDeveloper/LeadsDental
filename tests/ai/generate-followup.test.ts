import { describe, expect, it, vi } from "vitest";

import { generateAndPersistFollowup } from "@/lib/ai/generate-followup";

const userId = "11111111-1111-4111-8111-111111111111";
const clinicId = "22222222-2222-4222-8222-222222222222";
const leadId = "33333333-3333-4333-8333-333333333333";
const requestId = "44444444-4444-4444-8444-444444444444";

const lead = {
  id: leadId,
  name: "Ana García",
  phone: "+34 612 345 678",
  phone_normalized: "34612345678",
  clinic_id: clinicId,
  original_clinic_id: clinicId,
  treatment: "implantes" as const,
  source: "web" as const,
  status: "contactado" as const,
  duplicate_of: null,
  created_at: "2026-09-07T12:00:00.000Z",
  updated_at: "2026-09-07T12:00:00.000Z",
  created_by: userId,
  updated_by: userId,
  deleted_at: null,
  deleted_by: null,
  clinic: {
    id: clinicId,
    name: "Vitalis Madrid",
    city: "Madrid",
    slug: "madrid",
    color: "#2563EB",
    active: true,
  },
};

const note = {
  id: "55555555-5555-4555-8555-555555555555",
  lead_id: leadId,
  text: "Prefiere que le escribamos por la tarde.",
  type: "mensaje" as const,
  created_at: "2026-09-07T12:00:00.000Z",
  created_by: userId,
  metadata: {},
};

function dependencies(overrides: Record<string, unknown> = {}) {
  const audit = vi.fn().mockResolvedValue({ ok: true, entry: {} });
  const rpc = vi.fn().mockResolvedValue({
    data: { ...note, type: "mensaje_generado_ia" },
    error: null,
  });

  return {
    getLead: vi.fn().mockResolvedValue(lead),
    listNotes: vi.fn().mockResolvedValue([note]),
    authorize: vi.fn().mockResolvedValue({ id: userId }),
    createAuditEntry: audit,
    generate: vi.fn().mockResolvedValue({
      message: "Hola, Ana. ¿Te ayudamos con tu próxima visita?",
      model: "gpt-5.6-luna",
      promptVersion: "1.0",
      requestId,
      latencyMs: 250,
    }),
    getSupabase: vi.fn().mockResolvedValue({ rpc }),
    createRequestId: () => requestId,
    now: () => 1_757_240_000_000,
    ...overrides,
    audit,
    rpc,
  };
}

describe("generateAndPersistFollowup", () => {
  it("audits the request and persists the note through the atomic RPC", async () => {
    const deps = dependencies();

    const result = await generateAndPersistFollowup(leadId, deps);

    expect(result).toMatchObject({ ok: true, generation: { requestId } });
    expect(deps.authorize).toHaveBeenCalledWith(clinicId);
    expect(deps.audit).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        action: "AI_FOLLOWUP_REQUESTED",
        entityId: leadId,
        metadata: expect.objectContaining({ request_id: requestId }),
      }),
    );
    expect(deps.rpc).toHaveBeenCalledWith(
      "persist_ai_followup",
      expect.objectContaining({
        p_lead_id: leadId,
        p_text: "Hola, Ana. ¿Te ayudamos con tu próxima visita?",
        p_request_id: requestId,
        p_actor_user_id: userId,
      }),
    );
    expect(deps.audit).toHaveBeenCalledTimes(1);
  });

  it("audits failure and never creates a note when the provider fails", async () => {
    const deps = dependencies({
      generate: vi.fn().mockRejectedValue(new Error("provider failure")),
    });

    const result = await generateAndPersistFollowup(leadId, deps);

    expect(result).toMatchObject({ ok: false, code: "GENERATION_FAILED" });
    expect(deps.audit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        action: "AI_FOLLOWUP_FAILED",
        metadata: expect.objectContaining({ reason: "provider_error" }),
      }),
    );
    expect(deps.rpc).not.toHaveBeenCalled();
  });

  it("rejects malformed lead ids before any dependency is called", async () => {
    const deps = dependencies();

    await expect(generateAndPersistFollowup("invalid", deps)).resolves.toEqual({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "El identificador del lead no es válido.",
    });
    expect(deps.getLead).not.toHaveBeenCalled();
    expect(deps.audit).not.toHaveBeenCalled();
  });

  it("rejects a user over the limit before reading notes or calling OpenAI", async () => {
    const deps = dependencies({
      checkRateLimit: vi.fn().mockReturnValue({
        allowed: false,
        retryAfterSeconds: 12,
      }),
    });

    await expect(generateAndPersistFollowup(leadId, deps)).resolves.toMatchObject({
      ok: false,
      code: "RATE_LIMITED",
      message: "Has alcanzado el límite de generaciones. Vuelve a intentarlo en 12 s.",
    });
    expect(deps.listNotes).not.toHaveBeenCalled();
    expect(deps.generate).not.toHaveBeenCalled();
    expect(deps.audit).not.toHaveBeenCalled();
  });
});
