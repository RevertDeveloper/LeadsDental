import Link from "next/link";
import { ArrowLeft, CalendarDays, Pencil, Phone, Stethoscope } from "lucide-react";
import { notFound } from "next/navigation";

import { createNoteAction } from "@/app/(protected)/leads/[id]/actions";
import { NoteForm } from "@/components/notes/note-form";
import { NoteList } from "@/components/notes/note-list";
import { LeadClinicBadge } from "@/components/leads/lead-clinic-badge";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLeadById } from "@/lib/leads/get-lead";
import { listLeadNotes } from "@/lib/notes/list-notes";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

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
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const notes = await listLeadNotes(lead.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link href="/leads" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver a Leads
          </Link>
          <p className="mt-6 text-xs font-bold tracking-[0.18em] text-primary uppercase">Ficha de seguimiento</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-foreground">{lead.name}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Toda la actividad comercial de este lead, en un único historial.</p>
        </div>
        <Link href={`/leads/${lead.id}/edit`} className={buttonVariants({ variant: "outline", size: "lg" })}>
          <Pencil aria-hidden="true" />
          Editar lead
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Contacto</p>
            <a href={`tel:${lead.phone}`} className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary">
              <Phone className="size-4 text-primary" aria-hidden="true" />
              {lead.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Clínica</p>
            <div className="mt-2"><LeadClinicBadge clinic={lead.clinic} /></div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Estado</p>
            <div className="mt-2"><LeadStatusBadge status={lead.status} /></div>
          </div>
          <div className="flex items-start gap-3 border-t border-border pt-4 sm:col-span-2 lg:col-span-4">
            <Stethoscope className="mt-0.5 size-4 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-foreground">{treatmentLabels[lead.treatment]}</p>
              <p className="mt-1 text-xs text-muted-foreground">Origen: {sourceLabels[lead.source]} · Alta el {formatDate(lead.created_at)}</p>
            </div>
            <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Actualizado {formatDate(lead.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-start">
        <NoteList notes={notes} />
        <NoteForm leadId={lead.id} action={createNoteAction} />
      </div>
    </div>
  );
}
