"use server";

import { redirect } from "next/navigation";

import {
  createLead,
} from "@/lib/leads/create-lead";
import { AuthorizationError } from "@/lib/permissions";
import type { LeadFormState } from "@/lib/leads/form-state";

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
  let result;

  try {
    result = await createLead(formDataToInput(formData));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: error.message };
    }

    return {
      message: "No se ha podido guardar el lead. Comprueba los datos e inténtalo de nuevo.",
    };
  }

  if (result.ok) {
    redirect(`/leads/${result.lead.id}/edit`);
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
}
