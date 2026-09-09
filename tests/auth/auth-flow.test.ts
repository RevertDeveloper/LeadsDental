import { describe, expect, it } from "vitest";

import {
  buildInvitationRedirectUrl,
  buildResetPasswordRedirectUrl,
  getRedirectPathFromSupabaseHash,
} from "@/lib/auth/flow";

describe("authentication flow helpers", () => {
  it("creates a dedicated invitation redirect url for the app confirm handler", () => {
    expect(buildInvitationRedirectUrl("https://crm.example.com")).toBe(
      "https://crm.example.com/auth/confirm?next=%2Fset-password&mode=invite",
    );
  });

  it("creates a dedicated recovery redirect url for the app confirm handler", () => {
    expect(buildResetPasswordRedirectUrl("https://crm.example.com")).toBe(
      "https://crm.example.com/auth/confirm?next=%2Fset-password&mode=recovery",
    );
  });

  it("detects invitation hash tokens and redirects to the password setup page", () => {
    const hash =
      "#access_token=token123&refresh_token=refresh123&expires_in=3600&expires_at=1788970355&token_type=bearer&type=invite";

    expect(getRedirectPathFromSupabaseHash(hash)).toBe("/set-password");
  });
});
