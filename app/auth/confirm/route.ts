import { NextRequest, NextResponse } from "next/server";

import { hasPublicEnv } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedOtpTypes = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

function getSafeRedirect(nextValue: string | null) {
  if (!nextValue || !nextValue.startsWith("/")) {
    return "/login";
  }

  return nextValue;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = getSafeRedirect(url.searchParams.get("next"));

  if (!hasPublicEnv() || !tokenHash || !type) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const otpType = allowedOtpTypes.find((allowedType) => allowedType === type);

  if (!otpType) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: otpType,
    token_hash: tokenHash,
  });

  if (error) {
    const encodedMessage = encodeURIComponent(error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${encodedMessage}`, url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
