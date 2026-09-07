import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicEnv, hasPublicEnv } from "@/lib/config/env";

/** Refreshes Supabase auth cookies without granting service-role privileges. */
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Fase 0 remains runnable before a Supabase project is configured. Once
  // Auth is enabled, the clients will require the complete public contract.
  if (!hasPublicEnv()) {
    return response;
  }

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Calling getUser validates and refreshes the auth session through Supabase.
  // Route authorization remains a server-side responsibility in later phases.
  await supabase.auth.getUser();

  return response;
}
