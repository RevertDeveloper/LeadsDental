import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthorizationError } from "@/lib/permissions/errors";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let user = null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    if (
      !(error instanceof AuthorizationError) ||
      !["INACTIVE_USER", "FORBIDDEN"].includes(error.code)
    ) {
      throw error;
    }
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(#cbd5e1 0.8px, transparent 0.8px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute -left-40 -top-40 -z-10 size-[32rem] rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute -bottom-48 -right-28 -z-10 size-[30rem] rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.8fr] lg:gap-24 lg:px-16">
        <div className="hidden lg:block">
          <div className="mb-10 flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-lg text-primary-foreground shadow-lg shadow-blue-900/15">
              V
            </span>
            Vitalis / CRM interno
          </div>
          <p className="max-w-xl text-6xl leading-[0.98] font-semibold tracking-[-0.06em] text-foreground">
            Cada conversación cuenta.
          </p>
          <p className="mt-8 max-w-md text-lg leading-8 text-muted-foreground">
            Centraliza tus leads, entiende el momento de cada paciente y ayuda
            a tu equipo a dar el siguiente paso.
          </p>
          <div className="mt-14 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
            Espacio privado para el equipo Vitalis
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Vitalis / CRM interno
            </p>
          </div>
          <div className="rounded-[2rem] border border-border/80 bg-card/95 p-7 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.25)] backdrop-blur sm:p-10">
            <div className="mb-9">
              <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Bienvenido de nuevo
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                Accede a tu espacio
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Usa las credenciales internas de tu equipo para continuar.
              </p>
            </div>
            <LoginForm />
            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
              Acceso exclusivo para personal autorizado de Clínica Dental
              Vitalis.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
