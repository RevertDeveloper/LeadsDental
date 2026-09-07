import Link from "next/link";
import { CalendarCheck2, Layers3, ScanFace, Sparkles } from "lucide-react";

import { RecentLeads } from "@/components/dashboard/recent-leads";
import { StatsCard } from "@/components/dashboard/stats-card";
import { FeedbackState } from "@/components/ui/feedback-state";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import { requiresAttention } from "@/lib/leads/priority";
import { listLeads } from "@/lib/leads/list-leads";
import { requireAuthenticatedUser } from "@/lib/permissions";
import type {
  DashboardClinicMetric,
  DashboardStatusMetric,
  DashboardTreatmentMetric,
} from "@/types/dashboard";
import type { LeadStatus, Treatment } from "@/types/leads";

const statusLabels: Record<LeadStatus, string> = {
  nuevo: "Nuevos",
  contactado: "Contactados",
  cita_agendada: "Citas agendadas",
  no_interesado: "No interesados",
  cliente: "Clientes",
};

const treatmentLabels: Record<Treatment, string> = {
  implantes: "Implantes",
  ortodoncia: "Ortodoncia",
  estetica: "Estética dental",
  revision: "Revisión",
};

const roleLabels = {
  ADMIN: "administración global",
  CLINIC_MANAGER: "gestión de clínicas",
  RECEPTIONIST: "recepción",
} as const;

type DistributionMetric =
  | DashboardStatusMetric
  | DashboardClinicMetric
  | DashboardTreatmentMetric;

function DistributionList({
  title,
  metrics,
  getLabel,
  getColor,
}: {
  title: string;
  metrics: DistributionMetric[];
  getLabel: (metric: DistributionMetric) => string;
  getColor?: (metric: DistributionMetric) => string | undefined;
}) {
  const maximum = Math.max(...metrics.map((metric) => metric.count), 1);

  return (
    <div>
      <h2 className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {metrics.map((metric) => (
          <li key={getLabel(metric)}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-medium text-foreground">
                {getLabel(metric)}
              </span>
              <span className="shrink-0 font-semibold text-muted-foreground">
                {metric.count}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{
                  width: `${(metric.count / maximum) * 100}%`,
                  backgroundColor: getColor?.(metric),
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  type DashboardData = [
    Awaited<ReturnType<typeof getDashboardStats>>,
    Awaited<ReturnType<typeof listLeads>>,
  ];
  let data: DashboardData;

  try {
    data = await Promise.all([
      getDashboardStats(),
      listLeads({ sort: "recent" }),
    ]);
  } catch {
    return (
      <FeedbackState
        variant="error"
        title="No se pudo cargar el dashboard"
        description="La conexión con la base de datos no está disponible ahora mismo. Inténtalo de nuevo en unos instantes."
      />
    );
  }

  const [stats, leads] = data;
  const firstName = user.fullName.trim().split(/\s+/)[0] || "equipo";
  const recentLeads = leads.slice(0, 6);
  const attentionLeads = leads.filter(requiresAttention).slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.4)] sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 size-64 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Resumen operativo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
            Hola, {firstName}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Aquí tienes la actividad de tu espacio de {roleLabels[user.role]}. Detecta primero lo que necesita una respuesta y vuelve al pipeline cuando quieras profundizar.
          </p>
        </div>
      </section>

      <section aria-label="Métricas principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Leads"
          value={stats.totalLeads}
          detail="Oportunidades activas en tu alcance"
          icon={Layers3}
          accentClassName="bg-blue-100 text-blue-700"
        />
        <StatsCard
          label="Nuevos"
          value={stats.newLeads}
          detail="Pendientes de primer contacto"
          icon={Sparkles}
          accentClassName="bg-amber-100 text-amber-700"
        />
        <StatsCard
          label="Citas"
          value={stats.scheduledAppointments}
          detail="Citas agendadas en el pipeline"
          icon={CalendarCheck2}
          accentClassName="bg-violet-100 text-violet-700"
        />
        <StatsCard
          label="Implantes"
          value={stats.implantLeads}
          detail="Leads interesados en implantes"
          icon={ScanFace}
          accentClassName="bg-emerald-100 text-emerald-700"
        />
      </section>

      <RecentLeads leads={recentLeads} attentionLeads={attentionLeads} />

      <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.42)] sm:p-7">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Lectura rápida</p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-foreground">Distribución del pipeline</h2>
          </div>
          <Link href="/leads" className="text-xs font-semibold text-primary hover:underline">Abrir pipeline completo</Link>
        </div>
        <div className="mt-7 grid gap-8 md:grid-cols-3">
          <DistributionList
            title="Por estado"
            metrics={stats.statusDistribution}
            getLabel={(metric) => statusLabels[(metric as DashboardStatusMetric).status]}
          />
          <DistributionList
            title="Por clínica"
            metrics={stats.clinicDistribution}
            getLabel={(metric) => (metric as DashboardClinicMetric).city}
            getColor={(metric) => (metric as DashboardClinicMetric).color}
          />
          <DistributionList
            title="Tratamientos"
            metrics={stats.treatmentDistribution}
            getLabel={(metric) => treatmentLabels[(metric as DashboardTreatmentMetric).treatment]}
          />
        </div>
      </section>
    </div>
  );
}
