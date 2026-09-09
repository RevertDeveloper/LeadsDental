"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getRedirectPathFromSupabaseHash } from "@/lib/auth/flow";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SupabaseAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const redirectPath = getRedirectPathFromSupabaseHash(hash);

    if (!redirectPath) {
      return;
    }

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      router.replace(redirectPath);
      return;
    }

    void (async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        router.replace("/login");
        return;
      }

      router.replace(redirectPath);
    })();
  }, [router]);

  return null;
}
