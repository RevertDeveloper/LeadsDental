import Link from "next/link";
import { ArrowUpRight, CalendarClock, CircleAlert, UserRound } from "lucide-react";

import { LeadClinicBadge } from "@/components/leads/lead-clinic-badge";
import { LeadPriorityIndicator } from "@/components/leads/lead-priority-indicator";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LeadWithClinic } from "@/types/leads";

const treatmentLabels = {
  implantes: "Implantes",
  ortodoncia: "Ortodoncia",
  estetica: "Estética dental",
  revision: "Revisión",
} as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function LeadSummary({ lead }: { lead: LeadWithClinic }) {
  return (
    <li className="group flex items-start gap-3 border-b border-border/75 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <UserRound className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/leads/${lead.id}`}
            className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
          >
            {lead.name}
          </Link>
          <LeadPriorityIndicator lead={lead} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <LeadClinicBadge clinic={lead.clinic} />
          <Badge variant="muted">{treatmentLabels[lead.treatment]}</Badge>
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        <time
          dateTime={lead.created_at}
          className="text-[11px] font-medium text-muted-foreground"
        >
          {formatDate(lead.created_at)}
        </time>
        <Link
          href={`/leads/${lead.id}`}
          aria-label={`Abrir ficha de ${lead.name}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-70 transition group-hover:opacity-100"
        >
          Abrir
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

type RecentLeadsProps = {
  leads: LeadWithClinic[];
  attentionLeads: LeadWithClinic[];
};

export function RecentLeads({ leads, attentionLeads }: RecentLeadsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.8fr)]">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Leads recientes</CardTitle>
            <CardDescription>
              Las últimas oportunidades incorporadas al pipeline.
            </CardDescription>
          </div>
          <Link
            href="/leads"
            className="shrink-0 text-xs font-semibold text-primary hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {leads.length > 0 ? (
            <ul aria-label="Leads recientes">
              {leads.map((lead) => (
                <LeadSummary key={lead.id} lead={lead} />
              ))}
            </ul>
          ) : (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-6 text-center">
              <span className="grid size-10 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <UserRound className="size-4" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">
                Todavía no hay leads
              </p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                Cuando llegue una nueva oportunidad, aparecerá aquí para que puedas actuar rápido.
              </p>
              <Link
                href="/leads/new"
                className="mt-4 text-xs font-semibold text-primary hover:underline"
              >
                Crear primer lead
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-card to-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Necesitan seguimiento</CardTitle>
              <CardDescription className="mt-1">
                Implantes nuevos, una oportunidad de alta intención comercial.
              </CardDescription>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <CircleAlert className="size-4" aria-hidden="true" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {attentionLeads.length > 0 ? (
            <ul className="space-y-1" aria-label="Leads que necesitan seguimiento">
              {attentionLeads.map((lead) => (
                <li key={lead.id} className="rounded-xl border border-blue-100 bg-white/75 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="block truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {lead.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    <LeadPriorityIndicator lead={lead} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <LeadClinicBadge clinic={lead.clinic} />
                    <Link
                      href={`/leads/${lead.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Abrir ficha
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white/55 px-6 text-center">
              <CalendarClock className="size-5 text-blue-600" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-foreground">Todo al día</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                No hay implantes nuevos que requieran seguimiento prioritario.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
