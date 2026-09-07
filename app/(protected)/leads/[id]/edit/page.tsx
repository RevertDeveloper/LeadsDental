import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadForm } from "@/components/leads/lead-form";
import { updateLeadAction } from "@/app/(protected)/leads/[id]/edit/actions";
import { getLeadById } from "@/lib/leads/get-lead";
import { requireAuthenticatedUser } from "@/lib/permissions";

type EditLeadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const [{ id }, user] = await Promise.all([
    params,
    requireAuthenticatedUser(),
  ]);
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/leads" className="text-sm font-semibold text-primary hover:underline">
          ← Volver a Leads
        </Link>
        <p className="mt-6 text-xs font-bold tracking-[0.18em] text-primary uppercase">
          Gestión comercial
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-foreground">
          Editar lead
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Actualiza los datos sin perder la clínica original del registro.
        </p>
      </div>
      <LeadForm action={updateLeadAction} clinics={user.clinics} lead={lead} />
    </div>
  );
}
