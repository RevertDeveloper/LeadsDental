"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { hasPublicEnv } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Introduce tu correo electrónico.")
    .max(254, "El correo electrónico no es válido.")
    .email("Introduce un correo electrónico válido."),
  password: z
    .string()
    .min(1, "Introduce tu contraseña.")
    .max(128, "La contraseña no es válida."),
});

export type LoginState = {
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

function getLoginErrors(error: z.ZodError): LoginState {
  const fieldErrors = error.flatten().fieldErrors as {
    email?: string[];
    password?: string[];
  };

  return {
    fieldErrors: {
      email: fieldErrors.email?.[0],
      password: fieldErrors.password?.[0],
    },
  };
}

export async function login(
  _previousState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return getLoginErrors(parsed.error);
  }

  if (!hasPublicEnv()) {
    return {
      message: "La autenticación todavía no está configurada en este entorno.",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { message: "El correo o la contraseña no son correctos." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { message: "No se pudo validar la sesión. Inténtalo de nuevo." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.active) {
      await supabase.auth.signOut();
      return { message: "Tu cuenta no tiene acceso activo a Vitalis." };
    }
  } catch {
    return { message: "No se pudo iniciar sesión. Inténtalo de nuevo." };
  }

  redirect("/dashboard");
}

export async function logout() {
  if (hasPublicEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
