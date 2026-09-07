import { afterEach, describe, expect, it } from "vitest";

import {
  AI_GENERATION_LIMIT,
  checkAiGenerationRateLimit,
  resetAiGenerationRateLimit,
} from "@/lib/ai/rate-limit";

const userId = "11111111-1111-4111-8111-111111111111";

describe("AI generation rate limit", () => {
  afterEach(() => resetAiGenerationRateLimit());

  it("allows ten attempts per user and rejects the next one", () => {
    for (let attempt = 0; attempt < AI_GENERATION_LIMIT; attempt += 1) {
      expect(checkAiGenerationRateLimit(userId, 1_000)).toMatchObject({
        allowed: true,
      });
    }

    expect(checkAiGenerationRateLimit(userId, 1_000)).toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });

  it("keeps identities isolated and expires attempts after one minute", () => {
    expect(checkAiGenerationRateLimit(userId, 1_000)).toMatchObject({ allowed: true });
    expect(
      checkAiGenerationRateLimit("22222222-2222-4222-8222-222222222222", 1_000),
    ).toMatchObject({ allowed: true });
    expect(checkAiGenerationRateLimit(userId, 61_001)).toMatchObject({
      allowed: true,
      remaining: AI_GENERATION_LIMIT - 1,
    });
  });
});
