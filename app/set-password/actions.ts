"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { hasPublicEnv } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(128, "La contraseña no es válida."),
    confirmPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(128, "La contraseña no es válida."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type SetPasswordState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    password?: string;
    confirmPassword?: string;
  };
};

export async function setPasswordAction(
  _previousState: SetPasswordState | undefined,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as {
      password?: string[];
      confirmPassword?: string[];
    };

    return {
      fieldErrors: {
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  if (!hasPublicEnv()) {
    return {
      message: "La autenticación todavía no está configurada en este entorno.",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return {
        message: error.message || "No se pudo guardar la contraseña.",
      };
    }

    redirect("/login");
  } catch {
    return {
      message: "No se pudo guardar la contraseña. Inténtalo de nuevo.",
    };
  }
}
