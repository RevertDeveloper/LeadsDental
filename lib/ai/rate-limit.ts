import "server-only";

export const AI_GENERATION_LIMIT = 10;
export const AI_GENERATION_WINDOW_MS = 60_000;

type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

const attemptsByUser = new Map<string, number[]>();

/**
 * Applies a per-user sliding-window limit in the current server instance.
 * Authentication supplies the identity; the browser cannot choose it.
 */
export function checkAiGenerationRateLimit(
  userId: string,
  now = Date.now(),
): RateLimitResult {
  const windowStart = now - AI_GENERATION_WINDOW_MS;
  const recentAttempts = (attemptsByUser.get(userId) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recentAttempts.length >= AI_GENERATION_LIMIT) {
    const oldestAttempt = recentAttempts[0] ?? now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((oldestAttempt + AI_GENERATION_WINDOW_MS - now) / 1000),
      ),
    };
  }

  recentAttempts.push(now);
  attemptsByUser.set(userId, recentAttempts);

  return {
    allowed: true,
    remaining: AI_GENERATION_LIMIT - recentAttempts.length,
  };
}

/** Clears module state for deterministic unit tests. */
export function resetAiGenerationRateLimit() {
  attemptsByUser.clear();
}
