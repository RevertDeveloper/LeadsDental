import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";

import { LeadClinicBadge } from "@/components/leads/lead-clinic-badge";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LeadWithClinic } from "@/types/leads";

const treatmentLabels = {
  implantes: "Implantes",
  ortodoncia: "Ortodoncia",
  estetica: "Estética dental",
  revision: "Revisión",
} as const;

const sourceLabels = {
  instagram: "Instagram",
  web: "Web",
  llamada: "Llamada",
} as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function LeadTable({ leads }: { leads: LeadWithClinic[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/55">
            <tr className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              <th className="px-6 py-4">Lead</th>
              <th className="px-4 py-4">Clínica</th>
              <th className="px-4 py-4">Tratamiento</th>
              <th className="px-4 py-4">Fuente</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Alta</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {leads.map((lead) => {
              const priority = lead.treatment === "implantes" && lead.status === "nuevo";

              return (
                <tr
                  key={lead.id}
                  className={priority ? "bg-blue-50/45" : "bg-card hover:bg-muted/25"}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Phone className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                          >
                            {lead.name}
                          </Link>
                          {priority ? (
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[10px] text-blue-700">
                              Prioridad
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <LeadClinicBadge clinic={lead.clinic} />
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {treatmentLabels[lead.treatment]}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {sourceLabels[lead.source]}
                  </td>
                  <td className="px-4 py-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                      >
                        Abrir
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/leads/${lead.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                      >
                        Editar
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </Link>
                      <DeleteLeadDialog leadId={lead.id} leadName={lead.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
