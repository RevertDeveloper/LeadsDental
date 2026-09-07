import { z } from "zod";

import { clinicIdSchema } from "@/types/auth";

export const treatmentSchema = z.enum([
  "implantes",
  "ortodoncia",
  "estetica",
  "revision",
]);

export const leadSourceSchema = z.enum(["instagram", "web", "llamada"]);

export const leadStatusSchema = z.enum([
  "nuevo",
  "contactado",
  "cita_agendada",
  "no_interesado",
  "cliente",
]);

const normalizedNameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(120, "El nombre no puede superar los 120 caracteres.");

const normalizedPhoneSchema = z
  .string()
  .trim()
  .min(7, "El teléfono debe tener al menos 7 caracteres.")
  .max(30, "El teléfono no puede superar los 30 caracteres.");

const leadFieldsSchema = z.object({
  name: normalizedNameSchema,
  phone: normalizedPhoneSchema,
  clinic_id: clinicIdSchema,
  treatment: treatmentSchema,
  source: leadSourceSchema,
  status: leadStatusSchema,
});

export const leadCreateSchema = leadFieldsSchema.extend({
  duplicate_of: clinicIdSchema.optional(),
});

export const leadUpdateSchema = leadFieldsSchema.extend({
  id: clinicIdSchema,
});

export type LeadFields = z.infer<typeof leadFieldsSchema>;

