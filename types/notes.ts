import type { z } from "zod";

import { noteTypeSchema } from "@/lib/validation/note-schemas";

export type NoteType = z.infer<typeof noteTypeSchema>;

export type NoteRecord = {
  id: string;
  lead_id: string;
  text: string;
  type: NoteType;
  created_at: string;
  created_by: string | null;
  metadata: Record<string, unknown>;
};
