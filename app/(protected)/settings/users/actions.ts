"use server";

import { revalidatePath } from "next/cache";

import { createAdminUser, deactivateAdminUser, deleteAdminUser, reactivateAdminUser } from "@/lib/users";
import { AuthorizationError, requireRole } from "@/lib/permissions";

export type UserAdminState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createUserAction(_previousState: UserAdminState, formData: FormData): Promise<UserAdminState> {
  try {
    const actor = await requireRole("ADMIN");
    const result = await createAdminUser(actor.id, {
      email: formData.get("email"),
      fullName: formData.get("full_name"),
      role: formData.get("role"),
      clinicIds: formData.getAll("clinic_id"),
    });
    if (!result.ok) return result;
    revalidatePath("/settings/users");
    return { success: true, message: "Invitación enviada correctamente." };
  } catch (error) {
    if (error instanceof AuthorizationError) return { message: error.message };
    return { message: "No se pudo crear el usuario. Inténtalo de nuevo." };
  }
}

export async function deactivateUserAction(_previousState: UserAdminState, formData: FormData): Promise<UserAdminState> {
  try {
    const actor = await requireRole("ADMIN");
    const result = await deactivateAdminUser(actor.id, formData.get("user_id"));
    if (!result.ok) return result;
    revalidatePath("/settings/users");
    return { success: true, message: "Usuario desactivado." };
  } catch (error) {
    if (error instanceof AuthorizationError) return { message: error.message };
    return { message: "No se pudo desactivar el usuario. Inténtalo de nuevo." };
  }
}

export async function reactivateUserAction(_previousState: UserAdminState, formData: FormData): Promise<UserAdminState> {
  try {
    const actor = await requireRole("ADMIN");
    const result = await reactivateAdminUser(actor.id, formData.get("user_id"));
    if (!result.ok) return result;
    revalidatePath("/settings/users");
    return { success: true, message: "Usuario reactivado." };
  } catch (error) {
    if (error instanceof AuthorizationError) return { message: error.message };
    return { message: "No se pudo reactivar el usuario. Inténtalo de nuevo." };
  }
}

export async function deleteUserAction(_previousState: UserAdminState, formData: FormData): Promise<UserAdminState> {
  try {
    const actor = await requireRole("ADMIN");
    const result = await deleteAdminUser(actor.id, formData.get("user_id"));
    if (!result.ok) return result;
    revalidatePath("/settings/users");
    return { success: true, message: "Usuario eliminado." };
  } catch (error) {
    if (error instanceof AuthorizationError) return { message: error.message };
    return { message: "No se pudo eliminar el usuario. Inténtalo de nuevo." };
  }
}
