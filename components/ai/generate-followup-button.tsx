"use client";

import { useActionState } from "react";
import { Check, Sparkles } from "lucide-react";

import { AiLoadingState } from "@/components/ai/ai-loading-state";
import { GeneratedMessage } from "@/components/ai/generated-message";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { buttonVariants } from "@/components/ui/button";
import type { GenerateFollowupState } from "@/lib/ai/form-state";

type GenerateFollowupAction = (
  previousState: GenerateFollowupState,
  formData: FormData,
) => Promise<GenerateFollowupState>;

type GenerateFollowupButtonProps = {
  leadId: string;
  action: GenerateFollowupAction;
};

export function GenerateFollowupButton({
  leadId,
  action,
}: GenerateFollowupButtonProps) {
  const [state, formAction, pending] = useActionState<
    GenerateFollowupState,
    FormData
  >(action, {});

  return (
    <div className="w-full">
      <form action={formAction} className="w-full">
        <input type="hidden" name="lead_id" value={leadId} />
        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({
            size: "lg",
            className:
              "w-full min-h-12 rounded-2xl bg-gradient-to-r from-primary via-primary to-sky-500 px-4 text-base font-semibold text-primary-foreground shadow-[0_12px_24px_-12px_rgba(37,99,235,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(37,99,235,1)] sm:w-auto",
          })}
        >
          {pending ? (
            <AiLoadingState />
          ) : state.success ? (
            <Check aria-hidden="true" />
          ) : (
            <Sparkles aria-hidden="true" />
          )}
          <span>{pending ? "Generando…" : "Generar mensaje de seguimiento"}</span>
        </button>
      </form>

      {state.message ? (
        <ActionFeedback variant="error" className="mt-3 px-3 py-2 text-xs leading-5">
          {state.message}
        </ActionFeedback>
      ) : null}

      {state.success && !state.generatedMessage ? (
        <ActionFeedback variant="success" className="mt-3 px-3 py-2 text-xs leading-5">
          Borrador generado y añadido a la actividad.
        </ActionFeedback>
      ) : null}

      {state.generatedMessage ? (
        <div className="mt-4 w-full">
          <GeneratedMessage message={state.generatedMessage} />
        </div>
      ) : null}
    </div>
  );
}
