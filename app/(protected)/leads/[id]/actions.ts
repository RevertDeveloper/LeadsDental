"use server";

import { revalidatePath } from "next/cache";

import { createNote } from "@/lib/notes/create-note";
import { NoteFormState } from "@/lib/notes/form-state";
import { AuthorizationError } from "@/lib/permissions";

function formDataToInput(formData: FormData) {
  return {
    lead_id: formData.get("lead_id"),
    text: formData.get("text"),
    type: formData.get("type"),
    metadata: {},
  };
}

export async function createNoteAction(
  _previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  let result;

  try {
    result = await createNote(formDataToInput(formData));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: error.message };
    }

    return { message: "No se pudo guardar la nota. Inténtalo de nuevo." };
  }

  if (result.ok) {
    revalidatePath(`/leads/${result.note.lead_id}`);
    return {};
  }

  if (result.code === "VALIDATION_ERROR") {
    return {
      message: "Revisa el contenido de la nota antes de guardarla.",
      fieldErrors: result.fieldErrors,
    };
  }

  return { message: result.message };
}
