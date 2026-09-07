import "server-only";

import type { NoteRecord } from "@/types/notes";
import type { LeadWithClinic } from "@/types/leads";
import type { FollowupContext, FollowupNoteContext } from "@/types/ai";

export const MAX_FOLLOWUP_NOTES = 3;
export const MAX_FOLLOWUP_NOTE_LENGTH = 500;

type FollowupLead = Pick<LeadWithClinic, "name" | "treatment" | "status"> & {
  clinic: Pick<LeadWithClinic["clinic"], "name">;
};

type FollowupNote = Pick<NoteRecord, "type" | "text" | "created_at">;

function toNoteContext(note: FollowupNote): FollowupNoteContext {
  return {
    type: note.type,
    text: note.text.trim().slice(0, MAX_FOLLOWUP_NOTE_LENGTH),
    createdAt: note.created_at,
  };
}

/** Builds the smallest approved context for a follow-up generation request. */
export function buildFollowupContext(
  lead: FollowupLead,
  notes: readonly FollowupNote[],
): FollowupContext {
  const recentNotes = notes
    .filter((note) => note.text.trim().length > 0)
    .toSorted((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, MAX_FOLLOWUP_NOTES)
    .map(toNoteContext);

  return {
    name: lead.name,
    clinicName: lead.clinic.name,
    treatment: lead.treatment,
    status: lead.status,
    lastInteraction: recentNotes[0]?.text ?? null,
    recentNotes,
  };
}
