import { redirect } from "next/navigation";

import { logout } from "@/app/login/actions";
import { getAuthenticatedAuthUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthenticatedAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-10 text-[#0f172a] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-6 border-b border-[#e2e8f0] pb-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#2563eb] uppercase">
              Clínica Dental Vitalis
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Tu espacio de trabajo
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition hover:border-[#94a3b8] hover:bg-[#f8fafc]"
            >
              Cerrar sesión
            </button>
          </form>
        </header>
        <section className="mt-8 rounded-2xl border border-[#dbeafe] bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)]">
          <p className="text-sm font-medium text-[#2563eb]">Sesión activa</p>
          <h2 className="mt-2 text-2xl font-semibold">Acceso confirmado</h2>
          <p className="mt-3 max-w-xl leading-7 text-[#64748b]">
            El shell privado está preparado. El pipeline de leads y el resto de
            la operación CRM se incorporarán en las siguientes fases.
          </p>
          <p className="mt-6 rounded-lg bg-[#f8fafc] px-4 py-3 font-mono text-xs break-all text-[#475569]">
            {user.email}
          </p>
        </section>
      </div>
    </main>
  );
}
