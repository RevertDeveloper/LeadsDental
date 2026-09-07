import Link from "next/link";
import { Plus } from "lucide-react";

import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadTable } from "@/components/leads/lead-table";
import { buttonVariants } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { requireAuthenticatedUser } from "@/lib/permissions";
import { listLeads, parseLeadFilters } from "@/lib/leads/list-leads";

type LeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const [user, rawSearchParams] = await Promise.all([
    requireAuthenticatedUser(),
    searchParams,
  ]);
  const filters = parseLeadFilters(rawSearchParams);
  let leads;

  try {
    leads = await listLeads(filters);
  } catch {
    return (
      <FeedbackState
        variant="error"
        title="No se pudo cargar Leads"
        description="La sesión o la conexión con la base de datos no están disponibles ahora mismo."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Gestión comercial
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-foreground">
            Leads
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Localiza y prioriza las oportunidades activas de tus clínicas.
          </p>
        </div>
        <Link href="/leads/new" className={buttonVariants({ size: "lg" })}>
          <Plus aria-hidden="true" />
          Nuevo lead
        </Link>
      </section>

      <LeadFilters clinics={user.clinics} filters={filters} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{leads.length}</span>{" "}
          {leads.length === 1 ? "lead visible" : "leads visibles"}
        </p>
        {filters.search || filters.clinic_id || filters.status || filters.treatment || filters.source ? (
          <p className="text-xs font-medium text-primary">Filtros activos</p>
        ) : null}
      </div>

      {leads.length > 0 ? (
        <LeadTable leads={leads} />
      ) : (
        <FeedbackState
          variant="empty"
          title="No hay leads con estos filtros"
          description="Prueba a limpiar algún filtro o crea un nuevo lead para comenzar a trabajar el pipeline."
          action={
            <Link href="/leads/new" className={buttonVariants({ variant: "outline" })}>
              <Plus aria-hidden="true" />
              Crear primer lead
            </Link>
          }
        />
      )}
    </div>
  );
}
