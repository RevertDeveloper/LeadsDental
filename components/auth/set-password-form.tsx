"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ActionFeedback } from "@/components/ui/action-feedback";
import { setPasswordAction, type SetPasswordState } from "@/app/set-password/actions";

const initialState: SetPasswordState = {};

export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
        {state.fieldErrors?.password ? (
          <p id="password-error" className="mt-2 text-xs text-destructive">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={state.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
        {state.fieldErrors?.confirmPassword ? (
          <p id="confirm-password-error" className="mt-2 text-xs text-destructive">
            {state.fieldErrors.confirmPassword}
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
        {pending ? "Guardando contraseña…" : "Guardar contraseña"}
      </button>

      <div className="pt-1 text-center text-sm">
        <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
