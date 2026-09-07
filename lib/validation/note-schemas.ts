import { z } from "zod";

export const noteTypeSchema = z.enum([
  "llamada",
  "mensaje",
  "mensaje_generado_ia",
]);

const noteMetadataSchema = z
  .record(z.string(), z.json())
  .default({});

export const noteCreateSchema = z.object({
  lead_id: z.string().uuid(),
  text: z
    .string()
    .trim()
    .min(1, "La nota no puede estar vacía.")
    .max(5000, "La nota no puede superar los 5.000 caracteres."),
  type: noteTypeSchema,
  metadata: noteMetadataSchema,
});

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
