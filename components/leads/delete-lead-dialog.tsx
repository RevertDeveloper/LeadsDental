"use client";

import { useActionState, useState } from "react";
import { Trash2, X } from "lucide-react";

import {
  deleteLeadAction,
  type DeleteLeadState,
} from "@/app/(protected)/leads/actions";
import { buttonVariants } from "@/components/ui/button";
import { ActionFeedback } from "@/components/ui/action-feedback";

export function DeleteLeadDialog({
  leadId,
  leadName,
}: {
  leadId: string;
  leadName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<DeleteLeadState, FormData>(
    deleteLeadAction,
    {},
  );

  if (state.success) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-red-200"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        Eliminar
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-lead-title-${leadId}`}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-red-700 uppercase">
                  Acción irreversible para el pipeline
                </p>
                <h2
                  id={`delete-lead-title-${leadId}`}
                  className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground"
                >
                  ¿Eliminar a {leadName}?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Cerrar diálogo"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              El lead desaparecerá del listado normal, pero se conservará en la base de datos
              junto con sus notas y trazabilidad.
            </p>
            {state.message ? (
              <ActionFeedback variant="error" className="mt-4 px-3 py-2 text-sm">
                {state.message}
              </ActionFeedback>
            ) : null}
            <form action={formAction} className="mt-6 flex justify-end gap-2">
              <input type="hidden" name="lead_id" value={leadId} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline" })}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className={buttonVariants({ variant: "destructive" })}
              >
                {pending ? "Eliminando…" : "Eliminar lead"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
