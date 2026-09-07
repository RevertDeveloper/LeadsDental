import { UserPlus, UsersRound } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "@/components/settings/create-user-form";
import { UserTable } from "@/components/settings/user-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listAdminUsers } from "@/lib/users";
import { requireRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function UsersSettingsPage() {
  const currentUser = await requireRole("ADMIN");
  const supabase = await createSupabaseServerClient();
  const [{ data: clinics, error: clinicsError }, users] = await Promise.all([
    supabase.from("clinics").select("id, name, city, slug, color, active").eq("active", true).order("name"),
    listAdminUsers(),
  ]);

  if (clinicsError) throw new Error("No se pudieron cargar las clínicas.");

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Administración</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Usuarios internos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Gestiona accesos, roles y clínicas sin abrir un registro público.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <UsersRound className="size-4" aria-hidden="true" />
          <span><strong>{users.length}</strong> usuarios registrados</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-xl bg-primary/10 px-3 py-2 font-medium text-primary" aria-current="page">Usuarios</span>
        <Link href="/settings/clinics" className="rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Clínicas</Link>
      </div>
      <Card>
        <CardHeader className="border-b border-border/70">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-primary"><UserPlus className="size-5" aria-hidden="true" /></span>
            <div><CardTitle>Invitar a una persona</CardTitle><CardDescription className="mt-1">La invitación se envía por email. Nunca se muestran contraseñas en esta pantalla.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-0"><CreateUserForm clinics={clinics ?? []} /></CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader><CardTitle>Equipo de Vitalis</CardTitle><CardDescription>El acceso se limita automáticamente a las clínicas asignadas.</CardDescription></CardHeader>
        <CardContent className="p-0"><UserTable users={users} currentUserId={currentUser.id} /></CardContent>
      </Card>
    </div>
  );
}
