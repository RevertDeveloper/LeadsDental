import Link from "next/link";

import { LeadForm } from "@/components/leads/lead-form";
import { createLeadAction } from "@/app/(protected)/leads/new/actions";
import { requireAuthenticatedUser } from "@/lib/permissions";

export default async function NewLeadPage() {
  const user = await requireAuthenticatedUser();

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
          Añadir lead
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Registra una nueva oportunidad y asígnala a una clínica accesible para ti.
        </p>
      </div>
      <LeadForm action={createLeadAction} clinics={user.clinics} />
    </div>
  );
}
