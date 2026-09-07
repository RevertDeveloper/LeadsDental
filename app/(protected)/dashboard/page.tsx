import { FeedbackState } from "@/components/ui/feedback-state";

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

      <FeedbackState
        variant="empty"
        title="El resumen aparecerá aquí"
        description="Los datos reales del pipeline se incorporarán cuando el dominio de leads esté disponible."
      />
    </div>
  );
}
