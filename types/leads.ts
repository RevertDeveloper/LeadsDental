import type { z } from "zod";

import {
  leadCreateSchema,
  leadSourceSchema,
  leadStatusSchema,
  leadUpdateSchema,
  treatmentSchema,
} from "@/lib/validation/lead-schemas";

export type Treatment = z.infer<typeof treatmentSchema>;
export type LeadSource = z.infer<typeof leadSourceSchema>;
export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

export type LeadRecord = {
  id: string;
  name: string;
  phone: string;
  phone_normalized: string;
  clinic_id: string;
  original_clinic_id: string | null;
  treatment: Treatment;
  source: LeadSource;
  status: LeadStatus;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type LeadWithClinic = LeadRecord & {
  clinic: {
    id: string;
    name: string;
    city: string;
    slug: string;
    color: string;
    active: boolean;
  };
  /** Present only when the original clinic is still in the user's scope. */
  originalClinic?: {
    id: string;
    name: string;
    city: string;
    slug: string;
    color: string;
    active: boolean;
  } | null;
};
