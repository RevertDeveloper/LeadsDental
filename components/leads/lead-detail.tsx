import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  ChevronRight,
  Pencil,
  Phone,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { NoteForm } from "@/components/notes/note-form";
import { NoteList } from "@/components/notes/note-list";
import { LeadClinicBadge } from "@/components/leads/lead-clinic-badge";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { NoteFormState } from "@/lib/notes/form-state";
import type { NoteRecord } from "@/types/notes";
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
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

type LeadDetailProps = {
  lead: LeadWithClinic;
  notes: NoteRecord[];
  createNoteAction: (
    previousState: NoteFormState,
    formData: FormData,
  ) => Promise<NoteFormState>;
};

export function LeadDetail({ lead, notes, createNoteAction }: LeadDetailProps) {
  const originalClinicChanged =
    lead.original_clinic_id !== null && lead.original_clinic_id !== lead.clinic_id;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver a Leads
          </Link>
          <p className="mt-6 text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Ficha de seguimiento
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-foreground">
            {lead.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Toda la actividad comercial de este lead, en un único historial.
          </p>
        </div>
        <Link
          href={`/leads/${lead.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <Pencil aria-hidden="true" />
          Editar lead
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Contacto
            </p>
            <a
              href={`tel:${lead.phone}`}
              className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary"
            >
              <Phone className="size-4 text-primary" aria-hidden="true" />
              {lead.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Clínica actual
            </p>
            <div className="mt-2">
              <LeadClinicBadge clinic={lead.clinic} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Estado
            </p>
            <div className="mt-2">
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>
          <div className="flex items-start gap-3 border-t border-border pt-4 sm:col-span-2 lg:col-span-4">
            <Stethoscope className="mt-0.5 size-4 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {treatmentLabels[lead.treatment]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fuente: {sourceLabels[lead.source]} · Alta el {formatDate(lead.created_at)}
              </p>
              {originalClinicChanged ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                  Clínica original: {lead.originalClinic?.name ?? "otra clínica"}
                </p>
              ) : null}
            </div>
            <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Actualizado {formatDate(lead.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-card">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
                Asistente Vitalis
              </p>
              <h2 className="mt-1 text-base font-semibold text-foreground">
                Seguimiento asistido por IA
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                El borrador de mensaje estará disponible aquí para que el equipo lo revise antes de enviarlo.
              </p>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <Bot className="size-3.5 text-primary" aria-hidden="true" />
            Próximamente
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
