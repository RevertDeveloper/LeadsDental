import type { LeadStatus, Treatment } from "@/types/leads";
import type { NoteType } from "@/types/notes";

export type FollowupNoteContext = {
  type: NoteType;
  text: string;
  createdAt: string;
};

export type FollowupContext = {
  name: string;
  clinicName: string;
  treatment: Treatment;
  status: LeadStatus;
  lastInteraction: string | null;
  recentNotes: FollowupNoteContext[];
};
