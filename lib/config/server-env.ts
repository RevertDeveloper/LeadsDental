import "server-only";

import { z } from "zod";

import type { EnvironmentSource } from "@/lib/config/env";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.6-luna"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates server-only credentials at the point where an operation needs them.
 * The `server-only` guard prevents importing this module into client bundles.
 */
export function getServerEnv(
  source: EnvironmentSource = process.env,
): ServerEnv {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: source.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: source.OPENAI_API_KEY,
    OPENAI_MODEL: source.OPENAI_MODEL,
  });
}
