"use server";

import { revalidatePath } from "next/cache";

import { createNote } from "@/lib/notes/create-note";
import type { NoteFormState } from "@/lib/notes/form-state";
import { AuthorizationError } from "@/lib/permissions";
import type { LeadStatusFormState } from "@/lib/leads/status-form-state";
import { updateLeadStatus } from "@/lib/leads/update-lead-status";

function formDataToInput(formData: FormData) {
  return {
    lead_id: formData.get("lead_id"),
    text: formData.get("text"),
    type: formData.get("type"),
    metadata: {},
  };
}

export async function createNoteAction(
  previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  let result;

  try {
    result = await createNote(formDataToInput(formData));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { revision: previousState.revision ?? 0, message: error.message };
    }

    return {
      revision: previousState.revision ?? 0,
      message: "No se pudo guardar la nota. Inténtalo de nuevo.",
    };
  }

  if (result.ok) {
    revalidatePath(`/leads/${result.note.lead_id}`);
    return {
      success: true,
      revision: (previousState.revision ?? 0) + 1,
    };
  }

  if (result.code === "VALIDATION_ERROR") {
    return {
      revision: previousState.revision ?? 0,
      message: "Revisa el contenido de la nota antes de guardarla.",
      fieldErrors: result.fieldErrors,
    };
  }

  return { revision: previousState.revision ?? 0, message: result.message };
}

export async function updateLeadStatusAction(
  previousState: LeadStatusFormState,
  formData: FormData,
): Promise<LeadStatusFormState> {
  let result;

  try {
    result = await updateLeadStatus({
      lead_id: formData.get("lead_id"),
      status: formData.get("status"),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { revision: previousState.revision ?? 0, message: error.message };
    }

    return {
      revision: previousState.revision ?? 0,
      message: "No se pudo actualizar el estado. Inténtalo de nuevo.",
    };
  }

  if (!result.ok) {
    return {
      revision: previousState.revision ?? 0,
      message: result.message,
    };
  }

  revalidatePath(`/leads/${result.lead.id}`);
  revalidatePath("/leads");

  return {
    success: true,
    revision: (previousState.revision ?? 0) + 1,
  };
}
