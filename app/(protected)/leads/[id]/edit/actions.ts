"use server";

import { redirect } from "next/navigation";

import { AuthorizationError } from "@/lib/permissions";
import { updateLead } from "@/lib/leads/update-lead";
import type { LeadFormState } from "@/lib/leads/form-state";

function formDataToInput(formData: FormData) {
  const input = Object.fromEntries(formData.entries());

  if (input.duplicate_of === "") {
    delete input.duplicate_of;
  }

  return input;
}

export async function updateLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  let result;

  try {
    result = await updateLead(formDataToInput(formData));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: error.message };
    }

    return { message: "No se pudo actualizar el lead. Inténtalo de nuevo." };
  }

  if (result.ok) {
    redirect("/leads");
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
