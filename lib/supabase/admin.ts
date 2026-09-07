import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/config/server-env";

/**
 * Server-only client for tightly scoped administrative workflows.
 * Never import this module from a Client Component.
 */
export function createSupabaseAdminClient() {
  const env = getServerEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
