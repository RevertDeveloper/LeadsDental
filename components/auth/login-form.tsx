"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";

const initialState: LoginState = {};

function SubmitButton() {
  return (
    <button
      type="submit"
      className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_12px_24px_-14px_rgba(37,99,235,0.8)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      Entrar al CRM
    </button>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
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

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
        {state.fieldErrors?.password ? (
          <p id="password-error" className="mt-2 text-xs text-destructive">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <ActionFeedback variant="error" className="text-red-700">
          {state.message}
        </ActionFeedback>
      ) : null}

      <div className="pt-1 text-right">
        <Link
          href="/reset-password"
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          He olvidado mi contraseña
        </Link>
      </div>

      <div aria-live="polite">
        {pending ? (
          <button
            type="submit"
            disabled
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground opacity-60"
          >
            Comprobando acceso…
          </button>
        ) : (
          <SubmitButton />
        )}
      </div>
    </form>
  );
}
