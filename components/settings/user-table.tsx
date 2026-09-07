"use client";

import { useActionState } from "react";
import { UserRoundX } from "lucide-react";

import { deactivateUserAction, type UserAdminState } from "@/app/(protected)/settings/users/actions";
import { Button } from "@/components/ui/button";
import type { AdminUserRecord } from "@/lib/users";

const roleLabels = {
  ADMIN: "Administrador",
  CLINIC_MANAGER: "Manager de clínica",
  RECEPTIONIST: "Recepción",
} as const;

export function UserTable({ users, currentUserId }: { users: AdminUserRecord[]; currentUserId: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          <tr>
            <th className="px-6 py-4">Usuario</th>
            <th className="px-4 py-4">Rol</th>
            <th className="px-4 py-4">Clínicas</th>
            <th className="px-4 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {users.map((user) => (
            <UserRow key={user.id} user={user} currentUserId={currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user, currentUserId }: { user: AdminUserRecord; currentUserId: string }) {
  const [state, formAction, pending] = useActionState<UserAdminState, FormData>(deactivateUserAction, {});
  const isSelf = user.id === currentUserId;

  return (
    <tr className="align-top">
      <td className="px-6 py-5">
        <p className="font-semibold">{user.full_name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{user.email ?? "Email no disponible"}</p>
      </td>
      <td className="px-4 py-5 text-muted-foreground">{roleLabels[user.role]}</td>
      <td className="px-4 py-5">
        <div className="flex flex-wrap gap-1.5">
          {user.clinics.map((clinic) => (
            <span key={clinic.id} className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
              {clinic.name}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-5">
        <span className={user.active ? "text-emerald-700" : "text-muted-foreground"}>
          {user.active ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        {user.active && !isSelf ? (
          <form action={formAction} className="inline-flex flex-col items-end gap-1.5">
            <input type="hidden" name="user_id" value={user.id} />
            <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-muted-foreground hover:text-destructive">
              <UserRoundX aria-hidden="true" />
              {pending ? "Desactivando…" : "Desactivar"}
            </Button>
            {state.message ? <span className="text-xs text-destructive">{state.message}</span> : null}
          </form>
        ) : (
          <span className="text-xs text-muted-foreground">{isSelf ? "Sesión actual" : "Sin acciones"}</span>
        )}
      </td>
    </tr>
  );
}
