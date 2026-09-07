import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import {
  FOLLOWUP_OUTPUT_SCHEMA,
  SYSTEM_PROMPT_VERSION,
} from "@/lib/ai/config";
import { buildFollowupPrompt } from "@/lib/ai/prompts/followup";
import { getServerEnv } from "@/lib/config/server-env";
import type { FollowupContext } from "@/types/ai";
import type { ServerEnv } from "@/lib/config/server-env";

const generatedFollowupSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

export type GeneratedFollowup = {
  message: string;
  model: string;
  promptVersion: string;
  requestId: string;
  latencyMs: number;
};

export class FollowupProviderError extends Error {
  constructor(
    public readonly code: "PROVIDER_ERROR" | "INVALID_RESPONSE",
    message: string,
  ) {
    super(message);
    this.name = "FollowupProviderError";
  }
}

type OpenAIEnvironment = Pick<ServerEnv, "OPENAI_API_KEY" | "OPENAI_MODEL">;

type OpenAIResponse = {
  output_text?: string | null;
};

export type OpenAIResponsesClient = {
  responses: {
    create: (parameters: {
      model: string;
      instructions: string;
      input: string;
      store: boolean;
      metadata: Record<string, string>;
      text: {
        format: {
          type: "json_schema";
          name: string;
          strict: true;
          schema: typeof FOLLOWUP_OUTPUT_SCHEMA;
        };
        verbosity: "low";
      };
    }) => Promise<OpenAIResponse>;
  };
};

export type OpenAIClientDependencies = {
  getEnvironment?: () => OpenAIEnvironment;
  getClient?: (apiKey: string) => OpenAIResponsesClient;
  now?: () => number;
  createRequestId?: () => string;
};

function createDefaultClient(apiKey: string): OpenAIResponsesClient {
  return new OpenAI({ apiKey }) as unknown as OpenAIResponsesClient;
}

function parseGeneratedMessage(outputText: string | null | undefined) {
  if (!outputText) {
    throw new FollowupProviderError(
      "INVALID_RESPONSE",
      "OpenAI no devolvió un mensaje estructurado.",
    );
  }

  let json: unknown;

  try {
    json = JSON.parse(outputText);
  } catch {
    throw new FollowupProviderError(
      "INVALID_RESPONSE",
      "La respuesta de OpenAI no tiene un formato válido.",
    );
  }

  const parsed = generatedFollowupSchema.safeParse(json);

  if (!parsed.success) {
    throw new FollowupProviderError(
      "INVALID_RESPONSE",
      "La respuesta de OpenAI no contiene un mensaje válido.",
    );
  }

  return parsed.data.message;
}

/** Calls Responses API from server-only code and validates its structured output. */
export async function requestFollowupMessage(
  context: FollowupContext,
  dependencies: OpenAIClientDependencies = {},
): Promise<GeneratedFollowup> {
  const environment = (dependencies.getEnvironment ?? getServerEnv)();
  const client = (dependencies.getClient ?? createDefaultClient)(
    environment.OPENAI_API_KEY,
  );
  const prompt = buildFollowupPrompt(context);
  const requestId = dependencies.createRequestId
    ? dependencies.createRequestId()
    : crypto.randomUUID();
  const now = dependencies.now ?? Date.now;
  const startedAt = now();

  let response: OpenAIResponse;

  try {
    response = await client.responses.create({
      model: environment.OPENAI_MODEL,
      instructions: prompt.instructions,
      input: prompt.input,
      store: false,
      metadata: { request_id: requestId },
      text: {
        format: {
          type: "json_schema",
          name: "follow_up_message",
          strict: true,
          schema: FOLLOWUP_OUTPUT_SCHEMA,
        },
        verbosity: "low",
      },
    });
  } catch (error) {
    if (error instanceof FollowupProviderError) {
      throw error;
    }

    throw new FollowupProviderError(
      "PROVIDER_ERROR",
      "No se pudo generar el mensaje de seguimiento.",
    );
  }

  return {
    message: parseGeneratedMessage(response.output_text),
    model: environment.OPENAI_MODEL,
    promptVersion: SYSTEM_PROMPT_VERSION,
    requestId,
    latencyMs: Math.max(0, Math.round(now() - startedAt)),
  };
}

export { generatedFollowupSchema, parseGeneratedMessage };
