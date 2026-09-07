import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicEnv, hasPublicEnv } from "@/lib/config/env";

const privateRoutePrefixes = ["/dashboard", "/leads", "/settings"];

function isPrivateRoute(pathname: string) {
  return (
    pathname === "/" ||
    privateRoutePrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (isPrivateRoute(pathname) && !user) {
    return copyCookies(
      response,
      NextResponse.redirect(new URL("/login", request.url)),
    );
  }

  return response;
}
