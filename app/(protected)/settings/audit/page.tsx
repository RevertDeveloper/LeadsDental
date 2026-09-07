import Link from "next/link";
import { ChevronRight, ClipboardCheck } from "lucide-react";

import { AuditLogTable } from "@/components/settings/audit-log-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackState } from "@/components/ui/feedback-state";
import { listAuditLog } from "@/lib/audit/list-audit-log";
import { requireRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AuditSettingsPage() {
  await requireRole("ADMIN");
  const entries = await listAuditLog();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Configuración</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Auditoría</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Una línea de tiempo de las acciones relevantes realizadas dentro del CRM.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <ClipboardCheck className="size-4" aria-hidden="true" />
          <span><strong>{entries.length}</strong> eventos recientes</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/settings/users" className="rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Usuarios</Link>
        <Link href="/settings/clinics" className="rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Clínicas</Link>
        <span className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 font-medium text-primary" aria-current="page">Auditoría <ChevronRight className="size-3.5" aria-hidden="true" /></span>
      </div>
      <Card className="overflow-hidden">
        <CardHeader><CardTitle>Actividad reciente</CardTitle><CardDescription>Se muestran hasta 100 eventos. El registro es de solo lectura y omite secretos y prompts.</CardDescription></CardHeader>
        <CardContent className="p-0">
          {entries.length > 0 ? (
            <AuditLogTable entries={entries} />
          ) : (
            <FeedbackState
              variant="empty"
              title="Todavía no hay eventos de auditoría"
              description="Las acciones relevantes aparecerán aquí cuando el equipo empiece a trabajar."
              className="m-6"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
