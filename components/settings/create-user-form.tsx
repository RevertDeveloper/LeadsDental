"use client";

import { useActionState } from "react";

import { createUserAction, type UserAdminState } from "@/app/(protected)/settings/users/actions";
import type { AuthClinic } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { ActionFeedback } from "@/components/ui/action-feedback";

const initialState: UserAdminState = {};

export function CreateUserForm({ clinics }: { clinics: AuthClinic[] }) {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="grid gap-5 p-6 lg:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">
        Nombre completo
        <input name="full_name" required maxLength={120} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40" />
        {state.fieldErrors?.fullName ? <span className="text-xs text-destructive">{state.fieldErrors.fullName[0]}</span> : null}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email profesional
        <input name="email" type="email" required className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40" />
        {state.fieldErrors?.email ? <span className="text-xs text-destructive">{state.fieldErrors.email[0]}</span> : null}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Rol
        <select name="role" defaultValue="RECEPTIONIST" className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          <option value="RECEPTIONIST">Recepción</option>
          <option value="CLINIC_MANAGER">Manager de clínica</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </label>
      <fieldset className="grid gap-2 text-sm font-medium">
        <legend>Clínicas asignadas</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {clinics.map((clinic) => (
            <label key={clinic.id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/35 px-3 py-2 text-xs font-medium">
              <input type="checkbox" name="clinic_id" value={clinic.id} className="accent-primary" />
              {clinic.name}
            </label>
          ))}
        </div>
        {state.fieldErrors?.clinicIds ? <span className="text-xs text-destructive">{state.fieldErrors.clinicIds[0]}</span> : null}
      </fieldset>
      <div className="flex items-center gap-4 lg:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Enviando invitación…" : "Enviar invitación"}</Button>
        <p className="text-xs leading-5 text-muted-foreground">La persona recibirá un enlace seguro para activar su acceso.</p>
      </div>
      {state.message ? (
        <ActionFeedback
          variant={state.success ? "success" : "error"}
          className="lg:col-span-2"
        >
          {state.message}
        </ActionFeedback>
      ) : null}
    </form>
  );
}
