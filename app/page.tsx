const stack = ["Next.js", "TypeScript", "Supabase", "Zod", "Vitest"];

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#f8fafc] px-6 py-16 text-[#0f172a] sm:px-10">
      <div className="absolute -right-32 -top-32 -z-10 size-[28rem] rounded-full bg-[#dbeafe] blur-3xl" />
      <div className="absolute -bottom-48 -left-24 -z-10 size-[24rem] rounded-full bg-[#d1fae5] blur-3xl" />

      <section className="mx-auto w-full max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-white/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d4ed8] shadow-sm backdrop-blur">
              <span className="size-1.5 rounded-full bg-[#059669]" aria-hidden="true" />
              UI Foundation · Fase 3
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
              Clínica Dental <span className="text-[#2563eb]">Vitalis</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#64748b]">
              El espacio de trabajo del CRM está preparado. El producto se
              construye por fases, con trazabilidad y sin datos ficticios.
            </p>
          </div>

          <aside className="rounded-2xl border border-[#e2e8f0] bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-sm font-medium text-[#64748b]">Stack inicial</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item}
                  className="rounded-lg bg-[#f1f5f9] px-3 py-2 text-sm font-medium text-[#334155]"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 border-t border-[#e2e8f0] pt-5 text-sm leading-6 text-[#64748b]">
              Siguiente hito: dominio y operaciones de leads.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
