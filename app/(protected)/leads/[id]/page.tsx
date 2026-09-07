import { notFound } from "next/navigation";

import {
  createNoteAction,
  generateFollowupAction,
  updateLeadStatusAction,
} from "@/app/(protected)/leads/[id]/actions";
import { LeadDetail } from "@/components/leads/lead-detail";
import { getLeadById } from "@/lib/leads/get-lead";
import { listLeadNotes } from "@/lib/notes/list-notes";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const notes = await listLeadNotes(lead.id);

  return (
    <LeadDetail
      lead={lead}
      notes={notes}
      createNoteAction={createNoteAction}
      generateFollowupAction={generateFollowupAction}
      updateLeadStatusAction={updateLeadStatusAction}
    />
  );
}
