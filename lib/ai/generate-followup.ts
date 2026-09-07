import "server-only";

import {
  requestFollowupMessage,
  type GeneratedFollowup,
  type OpenAIClientDependencies,
  type OpenAIResponsesClient,
} from "@/lib/ai/openai-client";
import type { FollowupContext } from "@/types/ai";

type GenerateFollowupDependencies = {
  getEnvironment?: OpenAIClientDependencies["getEnvironment"];
  getClient?: (apiKey: string) => OpenAIResponsesClient;
  now?: () => number;
  createRequestId?: () => string;
};

/** Provider-facing generation primitive. Persistence is handled by the domain flow. */
export function generateFollowupMessage(
  context: FollowupContext,
  dependencies: GenerateFollowupDependencies = {},
): Promise<GeneratedFollowup> {
  return requestFollowupMessage(context, dependencies);
}
