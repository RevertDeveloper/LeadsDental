"use client";

import { useActionState, useState } from "react";
import { MessageCircle, PhoneCall, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NoteFormState } from "@/lib/notes/form-state";
import { noteTypeSchema } from "@/lib/validation/note-schemas";

type NoteFormAction = (
  previousState: NoteFormState,
  formData: FormData,
) => Promise<NoteFormState>;

const noteTypes = {
  llamada: {
    label: "Llamada",
    description: "Seguimiento telefónico",
    Icon: PhoneCall,
  },
  mensaje: {
    label: "Mensaje",
    description: "WhatsApp, email u otro canal",
    Icon: MessageCircle,
  },
  mensaje_generado_ia: {
    label: "Mensaje generado por IA",
    description: "Texto creado para revisión humana",
    Icon: Sparkles,
  },
} as const;

export function NoteForm({ leadId, action }: { leadId: string; action: NoteFormAction }) {
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(action, {});

  return (
    <Card className="border-primary/15 bg-primary/[0.025]">
      <CardHeader>
        <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Nueva entrada</p>
        <CardTitle className="mt-2 text-lg">Registrar actividad</CardTitle>
        <CardDescription>
          Añade contexto operativo. Las notas se guardan como historial y no se pueden editar ni borrar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NoteFormFields
          key={state.revision ?? 0}
          leadId={leadId}
          state={state}
          formAction={formAction}
          pending={pending}
        />
      </CardContent>
    </Card>
  );
}

function NoteFormFields({
  leadId,
  state,
  formAction,
  pending,
}: {
  leadId: string;
  state: NoteFormState;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  const [text, setText] = useState("");
  const [type, setType] = useState<(typeof noteTypeSchema.options)[number]>("llamada");
  const fieldError = state.fieldErrors?.text?.[0];

  return (
    <>
      <form action={formAction} className="space-y-5">
          <input type="hidden" name="lead_id" value={leadId} />
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-foreground">Tipo de actividad</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {noteTypeSchema.options.map((noteType) => {
                const option = noteTypes[noteType];
                const Icon = option.Icon;
                const selected = type === noteType;

                return (
                  <label
                    key={noteType}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${selected ? "border-primary bg-primary/8 ring-2 ring-primary/15" : "border-border bg-card hover:border-primary/35"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={noteType}
                      checked={selected}
                      onChange={() => setType(noteType)}
                      className="sr-only"
                    />
                    <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label htmlFor="note-text" className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">Contenido de la nota</span>
            <textarea
              id="note-text"
              name="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ej. Hemos hablado con la paciente y solicita disponibilidad la próxima semana."
              maxLength={5000}
              required
              rows={4}
              aria-invalid={Boolean(fieldError)}
              className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-3 focus:ring-ring/30 aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-200"
            />
            <span className="mt-1.5 flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{fieldError ?? "El texto quedará asociado al usuario que lo registra."}</span>
              <span className="shrink-0">{text.length}/5000</span>
            </span>
          </label>

          {state.message ? (
            <ActionFeedback variant="error">
              {state.message}
            </ActionFeedback>
          ) : null}

          {state.success ? (
            <ActionFeedback variant="success">
              Actividad registrada en la timeline.
            </ActionFeedback>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className={buttonVariants({ size: "lg" })}
            >
              {pending ? "Guardando…" : "Añadir a la timeline"}
            </button>
          </div>
      </form>
    </>
  );
}
