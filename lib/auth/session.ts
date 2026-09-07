import "server-only";

import { hasPublicEnv } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Returns the authenticated Supabase user, or null without a configured project. */
export async function getAuthenticatedAuthUser() {
  if (!hasPublicEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
