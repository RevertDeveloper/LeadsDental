import "server-only";

import { cache } from "react";

import { hasPublicEnv } from "@/lib/config/env";
import { AuthorizationError } from "@/lib/permissions/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  userRoleSchema,
  type AuthClinic,
  type CurrentUser,
} from "@/types/auth";

type ProfileRow = {
  id: string;
  full_name: string;
  role: string;
  active: boolean;
};

type ClinicRow = AuthClinic;

function authorizationUnavailable(): never {
  throw new AuthorizationError("AUTHORIZATION_UNAVAILABLE");
}

async function getAssignedClinics(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  role: CurrentUser["role"],
) {
  if (role === "ADMIN") {
    const { data, error } = await supabase
      .from("clinics")
      .select("id, name, city, slug, color, active")
      .eq("active", true)
      .order("name");

    if (error) {
      authorizationUnavailable();
    }

    return (data ?? []) as ClinicRow[];
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("user_clinics")
    .select("clinic_id")
    .eq("user_id", userId);

  if (assignmentsError) {
    authorizationUnavailable();
  }

  const clinicIds = (assignments ?? [])
    .map((assignment) => assignment.clinic_id)
    .filter((clinicId): clinicId is string => typeof clinicId === "string");

  if (clinicIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("clinics")
    .select("id, name, city, slug, color, active")
    .in("id", clinicIds)
    .eq("active", true)
    .order("name");

  if (error) {
    authorizationUnavailable();
  }

  return (data ?? []) as ClinicRow[];
}

/** Resolves identity and authorization data from Supabase, never client metadata. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasPublicEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    // Supabase reports a missing cookie as AuthSessionMissingError. That is
    // the normal state for the public login page, not an authorization outage.
    if (authError.name === "AuthSessionMissingError") {
      return null;
    }

    authorizationUnavailable();
  }

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    authorizationUnavailable();
  }

  if (!profile) {
    throw new AuthorizationError("FORBIDDEN");
  }

  const parsedRole = userRoleSchema.safeParse((profile as ProfileRow).role);

  if (!parsedRole.success) {
    authorizationUnavailable();
  }

  const profileRow = profile as ProfileRow;

  if (!profileRow.active) {
    throw new AuthorizationError("INACTIVE_USER");
  }

  const clinics = await getAssignedClinics(supabase, user.id, parsedRole.data);

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profileRow.full_name,
    role: parsedRole.data,
    active: true,
    clinics,
  };
});
