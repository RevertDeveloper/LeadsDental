import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("security headers", () => {
  it("defines a global baseline compatible with the CRM runtime", async () => {
    const rules = await nextConfig.headers?.();
    const globalRule = rules?.find((rule) => rule.source === "/:path*");
    const headers = new Map(globalRule?.headers.map((header) => [header.key, header.value]));

    expect(headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("microphone=()");
    expect(headers.get("Content-Security-Policy")).toContain("connect-src 'self' https://*.supabase.co");
  });
});
