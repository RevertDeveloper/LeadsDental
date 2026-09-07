"use server";

import { redirect } from "next/navigation";

import {
  createLead,
  type LeadFieldErrors,
} from "@/lib/leads/create-lead";
import { AuthorizationError } from "@/lib/permissions";
import type { LeadDuplicateCandidate } from "@/lib/leads/find-duplicates";

export type LeadFormState = {
  message?: string;
  fieldErrors?: LeadFieldErrors;
  duplicates?: LeadDuplicateCandidate[];
};

function formDataToInput(formData: FormData) {
  const input = Object.fromEntries(formData.entries());

  if (input.duplicate_of === "") {
    delete input.duplicate_of;
  }

  return input;
}

export async function createLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  try {
    const result = await createLead(formDataToInput(formData));

    if (result.ok) {
      redirect(`/leads/${result.lead.id}`);
    }

    if (result.code === "DUPLICATE_FOUND") {
      return {
        message:
          "Ya existe un lead con este teléfono. Revisa el candidato antes de continuar.",
        duplicates: result.duplicates,
      };
    }

    if (
      result.code === "VALIDATION_ERROR" ||
      result.code === "DUPLICATE_CONFIRMATION_INVALID"
    ) {
      return {
        message: "Revisa los datos marcados antes de guardar.",
        fieldErrors: result.fieldErrors,
      };
    }

    return { message: result.message };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: error.message };
    }

    return { message: "No se pudo crear el lead. Inténtalo de nuevo." };
  }
}
