"use server";

import { revalidatePath } from "next/cache";

import { deleteLead } from "@/lib/leads/delete-lead";
import { AuthorizationError } from "@/lib/permissions";

export type DeleteLeadState = {
  success?: boolean;
  message?: string;
};

export async function deleteLeadAction(
  _previousState: DeleteLeadState,
  formData: FormData,
): Promise<DeleteLeadState> {
  try {
    const result = await deleteLead(formData.get("lead_id"));

    if (result.ok) {
      revalidatePath("/leads");
      return { success: true };
    }

    return { message: result.message };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: error.message };
    }

    return { message: "No se pudo eliminar el lead. Inténtalo de nuevo." };
  }
}
