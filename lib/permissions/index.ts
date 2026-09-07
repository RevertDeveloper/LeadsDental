import { hasPublicEnv } from "@/lib/config/env";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { clinicIdSchema, type CurrentUser, type UserRole } from "@/types/auth";
import { AuthorizationError } from "@/lib/permissions/errors";

export function hasRequiredRole(
  user: Pick<CurrentUser, "role">,
  allowedRoles: UserRole | readonly UserRole[],
) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

export function canAccessClinic(
  user: Pick<CurrentUser, "role" | "clinics">,
  clinicId: string,
) {
  return (
    user.role === "ADMIN" || user.clinics.some((clinic) => clinic.id === clinicId)
  );
}

/** Requires an authenticated and active profile for server-side operations. */
export async function requireAuthenticatedUser() {
  if (!hasPublicEnv()) {
    throw new AuthorizationError("UNAUTHENTICATED");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError("UNAUTHENTICATED");
  }

  return user;
}

export async function requireRole(
  allowedRoles: UserRole | readonly UserRole[],
) {
  const user = await requireAuthenticatedUser();

  if (!hasRequiredRole(user, allowedRoles)) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return user;
}

export async function requireClinicAccess(clinicId: string) {
  const user = await requireAuthenticatedUser();

  if (!clinicIdSchema.safeParse(clinicId).success) {
    throw new AuthorizationError("FORBIDDEN");
  }

  if (!canAccessClinic(user, clinicId)) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return user;
}

export { AuthorizationError } from "@/lib/permissions/errors";
