import { describe, expect, it, vi } from "vitest";

import {
  FollowupProviderError,
  parseGeneratedMessage,
  requestFollowupMessage,
} from "@/lib/ai/openai-client";

const context = {
  name: "Ana García",
  clinicName: "Vitalis Madrid",
  treatment: "implantes" as const,
  status: "contactado" as const,
  lastInteraction: "Prefiere WhatsApp.",
  recentNotes: [
    {
      type: "mensaje" as const,
      text: "Prefiere WhatsApp.",
      createdAt: "2026-09-07T12:00:00.000Z",
    },
  ],
};

const environment = {
  OPENAI_API_KEY: "server-only-key",
  OPENAI_MODEL: "gpt-5.6-luna",
};

describe("requestFollowupMessage", () => {
  it("parses and trims only a valid structured message", () => {
    expect(parseGeneratedMessage('{"message":"  Hola, Ana.  "}')).toBe("Hola, Ana.");
    expect(() => parseGeneratedMessage(null)).toThrowError(FollowupProviderError);
    expect(() => parseGeneratedMessage('{"message":""}')).toThrowError(
      FollowupProviderError,
    );
  });

  it("calls Responses API with private credentials and structured output", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: JSON.stringify({ message: "Hola, Ana. ¿Seguimos en contacto?" }),
    });
    const now = vi
      .fn()
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1125);

    const result = await requestFollowupMessage(context, {
      getEnvironment: () => environment,
      getClient: () => ({ responses: { create } }),
      now,
      createRequestId: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });

    expect(result).toEqual({
      message: "Hola, Ana. ¿Seguimos en contacto?",
      model: "gpt-5.6-luna",
      promptVersion: "1.0",
      requestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      latencyMs: 125,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.6-luna",
        store: false,
        metadata: { request_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
        text: {
          format: expect.objectContaining({
            type: "json_schema",
            name: "follow_up_message",
            strict: true,
          }),
          verbosity: "low",
        },
      }),
    );
    expect(create.mock.calls[0][0].instructions).toContain("No hagas diagnósticos");
    expect(create.mock.calls[0][0].input).toContain("Ana García");
  });

  it("rejects malformed provider output", async () => {
    await expect(
      requestFollowupMessage(context, {
        getEnvironment: () => environment,
        getClient: () => ({
          responses: {
            create: vi.fn().mockResolvedValue({ output_text: '{"message": 42}' }),
          },
        }),
      }),
    ).rejects.toMatchObject<Partial<FollowupProviderError>>({
      code: "INVALID_RESPONSE",
    });
  });

  it("does not expose provider internals", async () => {
    await expect(
      requestFollowupMessage(context, {
        getEnvironment: () => environment,
        getClient: () => ({
          responses: {
            create: vi.fn().mockRejectedValue(new Error("provider secret details")),
          },
        }),
      }),
    ).rejects.toMatchObject({
      code: "PROVIDER_ERROR",
      message: "No se pudo generar el mensaje de seguimiento.",
    });
  });
});
