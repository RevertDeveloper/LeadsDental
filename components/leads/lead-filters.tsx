import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AuthClinic } from "@/types/auth";
import {
  leadSourceSchema,
  leadStatusSchema,
  treatmentSchema,
} from "@/lib/validation/lead-schemas";
import type { LeadFilters } from "@/lib/leads/list-leads";

const labels = {
  status: {
    nuevo: "Nuevo",
    contactado: "Contactado",
    cita_agendada: "Cita agendada",
    no_interesado: "No interesado",
    cliente: "Cliente",
  },
  treatment: {
    implantes: "Implantes",
    ortodoncia: "Ortodoncia",
    estetica: "Estética dental",
    revision: "Revisión",
  },
  source: {
    instagram: "Instagram",
    web: "Web",
    llamada: "Llamada",
  },
} as const;

export function LeadFilters({
  clinics,
  filters,
}: {
  clinics: AuthClinic[];
  filters: LeadFilters;
}) {
  return (
    <form
      method="get"
      className="rounded-3xl border border-border bg-card p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.42)] sm:p-5"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="flex-1">
          <span className="sr-only">Buscar leads</span>
          <input
            type="search"
            name="search"
            defaultValue={filters.search ?? ""}
            placeholder="Buscar por nombre, teléfono o clínica"
            className="h-12 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
        </label>

        <div className="flex items-center gap-2 xl:w-auto">
          <Button type="submit" className="h-12 flex-1 px-5 xl:flex-none">
            Filtrar
          </Button>
          <Link
            href="/leads"
            className={buttonVariants({
              variant: "outline",
              className: "h-12 px-4",
            })}
          >
            Limpiar
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <FilterSelect name="clinic_id" label="Clínica" value={filters.clinic_id}>
          <option value="">Todas las clínicas</option>
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="status" label="Estado" value={filters.status}>
          <option value="">Todos los estados</option>
          {leadStatusSchema.options.map((status) => (
            <option key={status} value={status}>
              {labels.status[status]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="treatment" label="Tratamiento" value={filters.treatment}>
          <option value="">Todos los tratamientos</option>
          {treatmentSchema.options.map((treatment) => (
            <option key={treatment} value={treatment}>
              {labels.treatment[treatment]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="source" label="Fuente" value={filters.source}>
          <option value="">Todas las fuentes</option>
          {leadSourceSchema.options.map((source) => (
            <option key={source} value={source}>
              {labels.source[source]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="sort" label="Orden" value={filters.sort}>
          <option value="recent">Más recientes</option>
          <option value="activity">Última actividad</option>
          <option value="oldest">Más antiguos</option>
        </FilterSelect>
      </div>
    </form>
  );
}

function FilterSelect({
  name,
  label,
  value,
  children,
}: {
  name: string;
  label: string;
  value: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30"
      >
        {children}
      </select>
    </label>
  );
}
