"use client";

import { useActionState } from "react";
import { Check, Sparkles } from "lucide-react";

import { AiLoadingState } from "@/components/ai/ai-loading-state";
import { GeneratedMessage } from "@/components/ai/generated-message";
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
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.success && !state.generatedMessage ? (
        <p className="mt-3 text-xs font-medium text-emerald-700" role="status">
          Borrador generado y añadido a la actividad.
        </p>
      ) : null}

      {state.generatedMessage ? (
        <div className="mt-4 sm:min-w-[28rem]">
          <GeneratedMessage message={state.generatedMessage} />
        </div>
      ) : null}
    </div>
  );
}
