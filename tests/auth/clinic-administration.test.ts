import { describe, expect, it } from "vitest";

import { hasRequiredRole } from "@/lib/permissions";

describe("clinic administration", () => {
  it("reserves clinic configuration for administrators", () => {
    expect(hasRequiredRole({ role: "ADMIN" }, "ADMIN")).toBe(true);
    expect(hasRequiredRole({ role: "CLINIC_MANAGER" }, "ADMIN")).toBe(false);
    expect(hasRequiredRole({ role: "RECEPTIONIST" }, "ADMIN")).toBe(false);
  });
});
