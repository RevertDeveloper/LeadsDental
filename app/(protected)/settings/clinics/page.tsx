import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

import { ClinicList } from "@/components/settings/clinic-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthClinic } from "@/types/auth";

export const dynamic = "force-dynamic";

export default async function ClinicsSettingsPage() {
  await requireRole("ADMIN");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("id, name, city, slug, color, active")
    .order("name");

  if (error) throw new Error("No se pudo cargar la configuración de clínicas.");

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Configuración</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Clínicas Vitalis</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Consulta la identidad y disponibilidad de cada centro conectado al CRM.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Building2 className="size-4" aria-hidden="true" />
          <span><strong>{data?.length ?? 0}</strong> clínicas configuradas</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/settings/users" className="rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Usuarios</Link>
        <span className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 font-medium text-primary" aria-current="page">Clínicas <ChevronRight className="size-3.5" aria-hidden="true" /></span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Red de clínicas</CardTitle>
          <CardDescription>Los colores se utilizan para reconocer rápidamente el alcance de cada lead.</CardDescription>
        </CardHeader>
      </Card>
      <ClinicList clinics={(data ?? []) as AuthClinic[]} />
    </div>
  );
}
