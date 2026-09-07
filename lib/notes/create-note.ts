import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireClinicAccess } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { noteCreateSchema } from "@/lib/validation/note-schemas";
import type { NoteRecord } from "@/types/notes";

export type NoteFieldErrors = Record<string, string[]>;

export type CreateNoteResult =
  | { ok: true; note: NoteRecord }
  | { ok: false; code: "VALIDATION_ERROR"; fieldErrors: NoteFieldErrors }
  | { ok: false; code: "LEAD_NOT_FOUND"; message: string }
  | { ok: false; code: "DATABASE_ERROR"; message: string };

type CreateNoteDependencies = {
  authorize?: typeof requireClinicAccess;
  getSupabase?: () => Promise<SupabaseClient>;
};

const noteFields = "id, lead_id, text, type, created_at, created_by, metadata";

function issueMap(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.reduce<NoteFieldErrors>((errors, issue) => {
    const field = String(issue.path[0] ?? "form");
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

/** Creates an immutable note using the authenticated Supabase client and RLS. */
export async function createNote(
  input: unknown,
  dependencies: CreateNoteDependencies = {},
): Promise<CreateNoteResult> {
  const parsed = noteCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      fieldErrors: issueMap(parsed.error.issues),
    };
  }

  const supabase = dependencies.getSupabase
    ? await dependencies.getSupabase()
    : await createSupabaseServerClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, clinic_id")
    .eq("id", parsed.data.lead_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (leadError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo comprobar el lead. Inténtalo de nuevo.",
    };
  }

  if (!lead) {
    return {
      ok: false,
      code: "LEAD_NOT_FOUND",
      message: "No se encontró el lead o no tienes acceso a él.",
    };
  }

  const authorize = dependencies.authorize ?? requireClinicAccess;
  const user = await authorize(lead.clinic_id as string);
  const { data, error } = await supabase
    .from("notes")
    .insert({
      lead_id: parsed.data.lead_id,
      text: parsed.data.text,
      type: parsed.data.type,
      metadata: parsed.data.metadata,
      created_by: user.id,
    })
    .select(noteFields)
    .single();

  if (error || !data) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo guardar la nota. Inténtalo de nuevo.",
    };
  }

  return { ok: true, note: data as NoteRecord };
}
