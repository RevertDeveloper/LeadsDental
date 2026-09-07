import { Badge } from "@/components/ui/badge";

export const leadStatuses = [
  "nuevo",
  "contactado",
  "cita_agendada",
  "no_interesado",
  "cliente",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

const statusPresentation: Record<LeadStatus, { label: string; className: string }> = {
  nuevo: {
    label: "Nuevo",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  contactado: {
    label: "Contactado",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  cita_agendada: {
    label: "Cita agendada",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  no_interesado: {
    label: "No interesado",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  cliente: {
    label: "Cliente",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const presentation = statusPresentation[status];

  return (
    <Badge variant="outline" className={presentation.className}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {presentation.label}
    </Badge>
  );
}
