"use client";

import { useActionState } from "react";
import { Check, LoaderCircle } from "lucide-react";

import { leadStatuses } from "@/components/leads/lead-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { ActionFeedback } from "@/components/ui/action-feedback";
import type { LeadStatusFormState } from "@/lib/leads/status-form-state";
import type { LeadStatus } from "@/types/leads";

const statusLabels: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cita_agendada: "Cita agendada",
  no_interesado: "No interesado",
  cliente: "Cliente",
};

type LeadStatusAction = (
  previousState: LeadStatusFormState,
  formData: FormData,
) => Promise<LeadStatusFormState>;

type LeadStatusSelectorProps = {
  leadId: string;
  currentStatus: LeadStatus;
  action: LeadStatusAction;
};

export function LeadStatusSelector({
  leadId,
  currentStatus,
  action,
}: LeadStatusSelectorProps) {
  const [state, formAction, pending] = useActionState<LeadStatusFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="lead_id" value={leadId} />
      <label htmlFor={`lead-status-${leadId}`} className="sr-only">
        Cambiar estado del lead
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          id={`lead-status-${leadId}`}
          name="status"
          defaultValue={currentStatus}
          disabled={pending}
          className="h-9 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30 disabled:opacity-60"
        >
          {leadStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {pending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : state.success ? (
            <Check aria-hidden="true" />
          ) : null}
          {pending ? "Guardando…" : "Actualizar"}
        </button>
      </div>
      {state.message ? (
        <ActionFeedback variant="error" className="px-3 py-2 text-xs leading-5">
          {state.message}
        </ActionFeedback>
      ) : state.success ? (
        <ActionFeedback variant="success" className="px-3 py-2 text-xs leading-5">
          Estado actualizado y auditado.
        </ActionFeedback>
      ) : (
        <p className="text-xs text-muted-foreground">El cambio queda registrado en auditoría.</p>
      )}
    </form>
  );
}
