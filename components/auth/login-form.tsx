"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

function SubmitButton() {
  return (
    <button
      type="submit"
      className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#173b36] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(23,59,54,0.8)] transition hover:bg-[#21554d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b36] disabled:cursor-not-allowed disabled:opacity-60"
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
          className="mb-2 block text-sm font-medium text-[#243b36]"
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
          className="h-12 w-full rounded-xl border border-[#d7e2dd] bg-white px-4 text-sm text-[#173b36] outline-none transition placeholder:text-[#91a39c] focus:border-[#4e8d7e] focus:ring-4 focus:ring-[#dceee8]"
        />
        {state.fieldErrors?.email ? (
          <p id="email-error" className="mt-2 text-xs text-[#b42318]">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-[#243b36]"
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
          className="h-12 w-full rounded-xl border border-[#d7e2dd] bg-white px-4 text-sm text-[#173b36] outline-none transition placeholder:text-[#91a39c] focus:border-[#4e8d7e] focus:ring-4 focus:ring-[#dceee8]"
        />
        {state.fieldErrors?.password ? (
          <p id="password-error" className="mt-2 text-xs text-[#b42318]">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-[#f0c9c5] bg-[#fff7f6] px-4 py-3 text-sm leading-6 text-[#9b2c24]"
        >
          {state.message}
        </p>
      ) : null}

      <div aria-live="polite">
        {pending ? (
          <button
            type="submit"
            disabled
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#173b36] px-5 text-sm font-semibold text-white opacity-60"
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
