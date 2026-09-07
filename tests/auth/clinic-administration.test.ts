import { describe, expect, it } from "vitest";

import { hasRequiredRole } from "@/lib/permissions";
import { redactAuditValues } from "@/lib/audit/list-audit-log";

describe("clinic administration", () => {
  it("reserves clinic configuration for administrators", () => {
    expect(hasRequiredRole({ role: "ADMIN" }, "ADMIN")).toBe(true);
    expect(hasRequiredRole({ role: "CLINIC_MANAGER" }, "ADMIN")).toBe(false);
    expect(hasRequiredRole({ role: "RECEPTIONIST" }, "ADMIN")).toBe(false);
  });

  it("redacts sensitive audit keys before rendering details", () => {
    expect(redactAuditValues({ request_id: "req-1", prompt: "private", api_key: "secret" })).toEqual({ request_id: "req-1" });
  });
});
