import type { LeadDuplicateCandidate } from "@/lib/leads/find-duplicates";
import type { LeadFieldErrors } from "@/lib/leads/create-lead";

export type LeadFormState = {
  message?: string;
  fieldErrors?: LeadFieldErrors;
  duplicates?: LeadDuplicateCandidate[];
};
