"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ActionFeedback } from "@/components/ui/action-feedback";
import { resetPasswordAction, type ResetPasswordState } from "@/app/reset-password/actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@vitalis.demo"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
        {state.fieldErrors?.email ? (
          <p id="email-error" className="mt-2 text-xs text-destructive">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <ActionFeedback
          variant={state.success ? "success" : "error"}
          className={state.success ? "text-emerald-700" : "text-red-700"}
        >
          {state.message}
        </ActionFeedback>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_12px_24px_-14px_rgba(37,99,235,0.8)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando enlace…" : "Enviar enlace de recuperación"}
      </button>

      <div className="pt-1 text-center text-sm">
        <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
