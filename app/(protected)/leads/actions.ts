"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  let result;

  try {
    result = await deleteLead(formData.get("lead_id"));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: error.message };
    }

    return { message: "No se pudo eliminar el lead. Inténtalo de nuevo." };
  }

  if (result.ok) {
    revalidatePath("/leads");
    redirect("/leads");
  }

  return { message: result.message };
}
