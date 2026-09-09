"use server";

import { z } from "zod";

import { hasPublicEnv } from "@/lib/config/env";
import { buildResetPasswordRedirectUrl } from "@/lib/auth/flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Introduce tu correo electrónico.")
    .max(254, "El correo electrónico no es válido.")
    .email("Introduce un correo electrónico válido."),
});

export type ResetPasswordState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    email?: string;
  };
};

export async function resetPasswordAction(
  _previousState: ResetPasswordState | undefined,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as {
      email?: string[];
    };

    return {
      fieldErrors: {
        email: fieldErrors.email?.[0],
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
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: buildResetPasswordRedirectUrl(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    });

    if (error) {
      return {
        message: "No se pudo enviar el enlace de recuperación. Inténtalo de nuevo.",
      };
    }

    return {
      success: true,
      message:
        "Si el correo existe en Vitalis, recibirás un enlace para establecer una nueva contraseña.",
    };
  } catch {
    return {
      message: "No se pudo procesar la solicitud. Inténtalo de nuevo.",
    };
  }
}
