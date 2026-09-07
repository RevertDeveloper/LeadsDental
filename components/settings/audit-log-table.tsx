import { ChevronDown, ShieldCheck } from "lucide-react";

import type { AuditLogListRecord } from "@/lib/audit/list-audit-log";

const actionLabels: Record<string, string> = {
  LEAD_CREATED: "Lead creado",
  LEAD_UPDATED: "Lead actualizado",
  LEAD_DELETED: "Lead eliminado",
  NOTE_CREATED: "Nota añadida",
  LEAD_STATUS_CHANGED: "Estado cambiado",
  LEAD_CLINIC_CHANGED: "Clínica cambiada",
  AI_FOLLOWUP_REQUESTED: "IA solicitada",
  AI_FOLLOWUP_GENERATED: "IA generada",
  AI_FOLLOWUP_FAILED: "IA fallida",
  USER_CREATED: "Usuario creado",
  USER_DEACTIVATED: "Usuario desactivado",
};

const entityLabels: Record<string, string> = {
  lead: "Lead",
  note: "Nota",
  user: "Usuario",
  ai_followup: "Seguimiento IA",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Details({ entry }: { entry: AuditLogListRecord }) {
  const oldValues = JSON.stringify(entry.old_values, null, 2);
  const newValues = JSON.stringify(entry.new_values, null, 2);
  const metadata = JSON.stringify(entry.metadata, null, 2);

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-end gap-1 text-xs font-medium text-primary outline-none marker:hidden focus-visible:underline">
        Ver cambios <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-3 grid gap-3 rounded-xl bg-muted/60 p-3 text-left text-xs sm:grid-cols-3">
        <AuditJson label="Antes" value={oldValues} />
        <AuditJson label="Después" value={newValues} />
        <AuditJson label="Metadatos" value={metadata} />
      </div>
    </details>
  );
}

function AuditJson({ label, value }: { label: string; value: string }) {
  return <div><p className="mb-1 font-bold tracking-[0.12em] text-muted-foreground uppercase">{label}</p><pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-foreground">{value}</pre></div>;
}

export function AuditLogTable({ entries }: { entries: AuditLogListRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          <tr><th className="px-6 py-4">Fecha</th><th className="px-4 py-4">Actor</th><th className="px-4 py-4">Acción</th><th className="px-4 py-4">Entidad</th><th className="px-4 py-4">ID</th><th className="px-6 py-4 text-right">Detalle</th></tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {entries.map((entry) => (
            <tr key={entry.id} className="align-top">
              <td className="whitespace-nowrap px-6 py-5 text-xs text-muted-foreground">{formatDate(entry.created_at)}</td>
              <td className="px-4 py-5"><span className="font-medium">{entry.actor_name}</span><span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><ShieldCheck className="size-3" aria-hidden="true" />Identidad verificada</span></td>
              <td className="px-4 py-5 font-medium">{actionLabels[entry.action] ?? entry.action}</td>
              <td className="px-4 py-5 text-muted-foreground">{entityLabels[entry.entity_type] ?? entry.entity_type}</td>
              <td className="px-4 py-5 font-mono text-[11px] text-muted-foreground">{entry.entity_id}</td>
              <td className="px-6 py-5 text-right"><Details entry={entry} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
