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
    <div className="w-full shrink-0 sm:w-auto">
      <form action={formAction}>
        <input type="hidden" name="lead_id" value={leadId} />
        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}
        >
          {pending ? <AiLoadingState /> : state.success ? <Check aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
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
        <div className="mt-4 sm:min-w-[28rem]">
          <GeneratedMessage message={state.generatedMessage} />
        </div>
      ) : null}
    </div>
  );
}
