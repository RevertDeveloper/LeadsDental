export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.4)] sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 size-64 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Resumen operativo
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">
            Tu espacio de trabajo
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            El shell del CRM está listo para centralizar la actividad comercial
            de Clínica Dental Vitalis. En la siguiente fase aparecerán aquí tus
            leads y prioridades reales.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground">Leads activos</p>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground">—</p>
          <p className="mt-1 text-xs text-muted-foreground">Disponible en Fase 4</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground">Citas pendientes</p>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground">—</p>
          <p className="mt-1 text-xs text-muted-foreground">Disponible en Fase 4</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground">Actividad reciente</p>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground">—</p>
          <p className="mt-1 text-xs text-muted-foreground">Disponible en Fase 5</p>
        </div>
      </section>
    </div>
  );
}
