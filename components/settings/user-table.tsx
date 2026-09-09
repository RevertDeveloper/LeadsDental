"use client";

import { useActionState, type FormEvent } from "react";
import { RefreshCcw, Trash2, UserRoundX } from "lucide-react";

import {
  deactivateUserAction,
  deleteUserAction,
  reactivateUserAction,
  type UserAdminState,
} from "@/app/(protected)/settings/users/actions";
import { Button } from "@/components/ui/button";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { FeedbackState } from "@/components/ui/feedback-state";
import type { AdminUserRecord } from "@/lib/users";

const roleLabels = {
  ADMIN: "Administrador",
  CLINIC_MANAGER: "Manager de clínica",
  RECEPTIONIST: "Recepción",
} as const;

export function UserTable({ users, currentUserId }: { users: AdminUserRecord[]; currentUserId: string }) {
  if (users.length === 0) {
    return (
      <FeedbackState
        variant="empty"
        title="Todavía no hay usuarios"
        description="Invita a la primera persona del equipo para empezar a gestionar accesos."
        className="m-6"
      />
    );
  }

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
  const isSelf = user.id === currentUserId;

  const handleDeleteSubmit = (event: FormEvent<HTMLFormElement>) => {
    const confirmed = window.confirm("¿Estás seguro de eliminar a este usuario?");

    if (!confirmed) {
      event.preventDefault();
    }
  };

  const [deactivateState, deactivateAction, deactivatePending] = useActionState<UserAdminState, FormData>(
    deactivateUserAction,
    {},
  );
  const [reactivateState, reactivateAction, reactivatePending] = useActionState<UserAdminState, FormData>(
    reactivateUserAction,
    {},
  );
  const [deleteState, deleteAction, deletePending] = useActionState<UserAdminState, FormData>(deleteUserAction, {});

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
        {isSelf ? (
          <span className="text-xs text-muted-foreground">Sesión actual</span>
        ) : (
          <div className="inline-flex flex-col items-end gap-1.5">
            {user.active ? (
              <form action={deactivateAction} className="w-full">
                <input type="hidden" name="user_id" value={user.id} />
                <Button type="submit" variant="ghost" size="sm" disabled={deactivatePending} className="text-muted-foreground hover:text-destructive">
                  <UserRoundX aria-hidden="true" />
                  {deactivatePending ? "Desactivando…" : "Desactivar"}
                </Button>
              </form>
            ) : (
              <form action={reactivateAction} className="w-full">
                <input type="hidden" name="user_id" value={user.id} />
                <Button type="submit" variant="secondary" size="sm" disabled={reactivatePending}>
                  <RefreshCcw aria-hidden="true" />
                  {reactivatePending ? "Reactivando…" : "Reactivar"}
                </Button>
              </form>
            )}

            <form action={deleteAction} className="w-full" onSubmit={handleDeleteSubmit}>
              <input type="hidden" name="user_id" value={user.id} />
              <Button type="submit" variant="ghost" size="sm" disabled={deletePending} className="text-muted-foreground hover:text-destructive">
                <Trash2 aria-hidden="true" />
                {deletePending ? "Eliminando…" : "Eliminar"}
              </Button>
            </form>

            {deactivateState.message ? (
              <ActionFeedback variant={deactivateState.success ? "success" : "error"} className="px-3 py-2 text-left text-xs leading-5">
                {deactivateState.message}
              </ActionFeedback>
            ) : null}
            {reactivateState.message ? (
              <ActionFeedback variant={reactivateState.success ? "success" : "error"} className="px-3 py-2 text-left text-xs leading-5">
                {reactivateState.message}
              </ActionFeedback>
            ) : null}
            {deleteState.message ? (
              <ActionFeedback variant={deleteState.success ? "success" : "error"} className="px-3 py-2 text-left text-xs leading-5">
                {deleteState.message}
              </ActionFeedback>
            ) : null}
          </div>
        )}
      </td>
    </tr>
  );
}
