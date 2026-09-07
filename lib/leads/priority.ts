import type { LeadStatus, Treatment } from "@/types/leads";

export type LeadPriorityInput = Pick<
  { treatment: Treatment; status: LeadStatus },
  "treatment" | "status"
>;

/** MVP commercial rule: a new implant lead needs immediate follow-up. */
export function requiresAttention(lead: LeadPriorityInput) {
  return lead.treatment === "implantes" && lead.status === "nuevo";
}
