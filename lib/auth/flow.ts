export function buildInvitationRedirectUrl(baseUrl: string): string {
  const url = new URL(baseUrl);

  url.pathname = "/auth/confirm";
  url.searchParams.set("next", "/set-password");
  url.searchParams.set("mode", "invite");

  return url.toString();
}

export function buildResetPasswordRedirectUrl(baseUrl: string): string {
  const url = new URL(baseUrl);

  url.pathname = "/auth/confirm";
  url.searchParams.set("next", "/set-password");
  url.searchParams.set("mode", "recovery");

  return url.toString();
}

export function getRedirectPathFromSupabaseHash(hash: string): string | null {
  if (!hash) {
    return null;
  }

  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");

  if (!accessToken) {
    return null;
  }

  const next = params.get("next");
  if (next && next.startsWith("/")) {
    return next;
  }

  const type = params.get("type");

  if (type === "invite" || type === "recovery") {
    return "/set-password";
  }

  return "/dashboard";
}
