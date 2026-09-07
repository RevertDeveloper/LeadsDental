import { describe, expect, it } from "vitest";

import { canDeactivateUser, userAdminInputSchema } from "@/lib/users";

describe("user administration", () => {
  it("never allows an administrator to deactivate their own account", () => {
    expect(canDeactivateUser("same-id", "same-id")).toBe(false);
    expect(canDeactivateUser("admin-id", "other-id")).toBe(true);
  });

  it("requires a valid email, role and at least one clinic", () => {
    expect(userAdminInputSchema.safeParse({
      email: "invalid",
      fullName: "A",
      role: "UNKNOWN",
      clinicIds: [],
    }).success).toBe(false);

    expect(userAdminInputSchema.safeParse({
      email: "persona@vitalis.test",
      fullName: "Persona Vitalis",
      role: "RECEPTIONIST",
      clinicIds: ["00000000-0000-4000-8000-000000000001"],
    }).success).toBe(true);
  });
});
