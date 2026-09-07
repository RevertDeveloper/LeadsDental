import "server-only";

import { requireAuthenticatedUser } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clinicIdSchema } from "@/types/auth";
import type { NoteRecord } from "@/types/notes";

const noteFields = "id, lead_id, text, type, created_at, created_by, metadata";

/** Lists a lead's immutable activity in chronological order under RLS. */
export async function listLeadNotes(leadId: string): Promise<NoteRecord[]> {
  if (!clinicIdSchema.safeParse(leadId).success) {
    return [];
  }

  await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select(noteFields)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("No se pudo cargar la actividad del lead.");
  }

  return (data ?? []) as NoteRecord[];
}
