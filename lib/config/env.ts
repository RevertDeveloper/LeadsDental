import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type EnvironmentSource = Record<string, string | undefined>;

/** Returns whether the public Supabase contract is available for this process. */
export function hasPublicEnv(source: EnvironmentSource = process.env): boolean {
  return Boolean(
    source.NEXT_PUBLIC_SUPABASE_URL &&
      source.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      source.NEXT_PUBLIC_APP_URL,
  );
}

/** Validates values that may be used by browser and server Supabase clients. */
export function getPublicEnv(
  source: EnvironmentSource = process.env,
): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: source.NEXT_PUBLIC_APP_URL,
  });
}
