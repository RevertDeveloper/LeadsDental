import "server-only";

import { z } from "zod";

import { createAuditEntry } from "@/lib/audit/create-audit-entry";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { userRoleSchema, type AuthClinic, type UserRole } from "@/types/auth";

export const userAdminInputSchema = z.object({
  email: z.string().trim().email("Introduce un email válido."),
  fullName: z.string().trim().min(2, "El nombre es obligatorio.").max(120),
  role: userRoleSchema,
  clinicIds: z.array(z.string().uuid()).min(1, "Selecciona al menos una clínica."),
});

export type UserAdminInput = z.infer<typeof userAdminInputSchema>;

export type AdminUserRecord = {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  active: boolean;
  clinics: Pick<AuthClinic, "id" | "name" | "color">[];
  created_at: string;
};

export type UserAdminResult =
  | { ok: true; user?: AdminUserRecord }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const profileFields = "id, full_name, role, active, created_at";

function databaseError(message: string): UserAdminResult {
  return { ok: false, message };
}

export function canDeactivateUser(actorId: string, targetId: string) {
  return actorId !== targetId;
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  const supabase = createSupabaseAdminClient();
  const [{ data: authUsers, error: authError }, { data: profiles, error: profileError }, { data: assignments, error: assignmentError }, { data: clinics, error: clinicError }] =
    await Promise.all([
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from("profiles").select(profileFields).order("created_at", { ascending: false }),
      supabase.from("user_clinics").select("user_id, clinic_id"),
      supabase.from("clinics").select("id, name, color").order("name"),
    ]);

  if (authError || profileError || assignmentError || clinicError) {
    throw new Error("No se pudieron cargar los usuarios.");
  }

  const emails = new Map((authUsers?.users ?? []).map((user) => [user.id, user.email ?? null]));
  const clinicsById = new Map((clinics ?? []).map((clinic) => [clinic.id, clinic]));
  const clinicIdsByUser = new Map<string, string[]>();

  for (const assignment of assignments ?? []) {
    const current = clinicIdsByUser.get(assignment.user_id) ?? [];
    current.push(assignment.clinic_id);
    clinicIdsByUser.set(assignment.user_id, current);
  }

  return (profiles ?? []).flatMap((profile) => {
    const parsedRole = userRoleSchema.safeParse(profile.role);
    if (!parsedRole.success) return [];

    return [{
      id: profile.id,
      email: emails.get(profile.id) ?? null,
      full_name: profile.full_name,
      role: parsedRole.data,
      active: profile.active,
      clinics: (clinicIdsByUser.get(profile.id) ?? []).flatMap((clinicId) => {
        const clinic = clinicsById.get(clinicId);
        return clinic ? [clinic] : [];
      }),
      created_at: profile.created_at,
    }];
  });
}

export async function createAdminUser(
  actorId: string,
  input: unknown,
): Promise<UserAdminResult> {
  const parsed = userAdminInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos del usuario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: clinics, error: clinicsError } = await supabase
    .from("clinics")
    .select("id")
    .in("id", parsed.data.clinicIds)
    .eq("active", true);

  if (clinicsError || (clinics?.length ?? 0) !== new Set(parsed.data.clinicIds).size) {
    return databaseError("Selecciona únicamente clínicas activas válidas.");
  }

  const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { redirectTo: process.env.NEXT_PUBLIC_APP_URL },
  );

  if (inviteError || !invited.user) {
    return databaseError("No se pudo enviar la invitación. Comprueba si el email ya existe.");
  }

  const userId = invited.user.id;
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: parsed.data.fullName,
    role: parsed.data.role,
    active: true,
  });

  const { error: assignmentsError } = profileError
    ? { error: profileError }
    : await supabase.from("user_clinics").insert(
        parsed.data.clinicIds.map((clinicId) => ({ user_id: userId, clinic_id: clinicId })),
      );

  if (profileError || assignmentsError) {
    await supabase.auth.admin.deleteUser(userId);
    return databaseError("No se pudo completar la configuración del usuario.");
  }

  const audit = await createAuditEntry(
    {
      actorUserId: actorId,
      action: "USER_CREATED",
      entityType: "user",
      entityId: userId,
      newValues: { role: parsed.data.role, clinic_ids: parsed.data.clinicIds },
      metadata: { email: parsed.data.email },
    },
    { getSupabase: async () => supabase },
  );

  if (!audit.ok) return databaseError("El usuario se creó, pero no se pudo registrar la auditoría.");
  return { ok: true };
}

export async function deactivateAdminUser(
  actorId: string,
  targetId: unknown,
): Promise<UserAdminResult> {
  const parsedId = z.string().uuid().safeParse(targetId);
  if (!parsedId.success || !canDeactivateUser(actorId, parsedId.data)) {
    return databaseError("No puedes desactivar este usuario.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, full_name, role, active")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (targetError || !target) return databaseError("No se encontró el usuario.");
  if (!target.active) return { ok: true };

  const { error } = await supabase
    .from("profiles")
    .update({ active: false })
    .eq("id", parsedId.data);

  if (error) return databaseError("No se pudo desactivar el usuario.");

  const audit = await createAuditEntry(
    {
      actorUserId: actorId,
      action: "USER_DEACTIVATED",
      entityType: "user",
      entityId: parsedId.data,
      oldValues: { active: true },
      newValues: { active: false },
    },
    { getSupabase: async () => supabase },
  );

  if (!audit.ok) return databaseError("El usuario se desactivó, pero no se pudo registrar la auditoría.");
  return { ok: true };
}
