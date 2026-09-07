import { describe, expect, it } from "vitest";

import {
  canAccessClinic,
  hasRequiredRole,
} from "@/lib/permissions";
import { AuthorizationError } from "@/lib/permissions/errors";
import type { CurrentUser } from "@/types/auth";

const madrid = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Clínica Dental Vitalis Madrid",
  city: "Madrid",
  slug: "madrid",
  color: "#2563EB",
  active: true,
};

const valencia = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Clínica Dental Vitalis Valencia",
  city: "Valencia",
  slug: "valencia",
  color: "#059669",
  active: true,
};

function user(
  role: CurrentUser["role"],
  clinics: CurrentUser["clinics"],
): Pick<CurrentUser, "role" | "clinics"> {
  return { role, clinics };
}

describe("server-side authorization matrix", () => {
  it("allows ADMIN across every clinic", () => {
    const admin = user("ADMIN", []);

    expect(canAccessClinic(admin, valencia.id)).toBe(true);
    expect(hasRequiredRole(admin, ["ADMIN", "CLINIC_MANAGER"])).toBe(true);
  });

  it("limits managers to their assigned clinics", () => {
    const manager = user("CLINIC_MANAGER", [madrid]);

    expect(canAccessClinic(manager, madrid.id)).toBe(true);
    expect(canAccessClinic(manager, valencia.id)).toBe(false);
    expect(hasRequiredRole(manager, "RECEPTIONIST")).toBe(false);
  });

  it("does not grant a manager access through an unrelated clinic assignment", () => {
    const manager = user("CLINIC_MANAGER", [madrid]);

    expect(canAccessClinic(manager, "33333333-3333-3333-3333-333333333333")).toBe(false);
    expect(hasRequiredRole(manager, ["ADMIN", "CLINIC_MANAGER"])).toBe(true);
  });

  it("limits receptionists to their assigned clinic", () => {
    const receptionist = user("RECEPTIONIST", [madrid]);

    expect(canAccessClinic(receptionist, madrid.id)).toBe(true);
    expect(canAccessClinic(receptionist, valencia.id)).toBe(false);
  });

  it("uses typed authorization errors", () => {
    const error = new AuthorizationError("INACTIVE_USER");

    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error.code).toBe("INACTIVE_USER");
    expect(error.status).toBe(403);
  });
});
