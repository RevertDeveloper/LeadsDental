import { LogOut } from "lucide-react";

import { logout } from "@/app/login/actions";
import type { CurrentUser } from "@/types/auth";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const roleLabels: Record<CurrentUser["role"], string> = {
  ADMIN: "Administrador",
  CLINIC_MANAGER: "Manager de clínica",
  RECEPTIONIST: "Recepción",
};

export function UserMenu({ user }: { user: CurrentUser }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card py-1 pl-1 pr-1.5 shadow-sm sm:gap-3 sm:pr-2">
      <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
        {getInitials(user.fullName)}
      </span>
      <div className="hidden min-w-0 sm:block">
        <p className="max-w-32 truncate text-xs font-semibold text-foreground">
          {user.fullName}
        </p>
        <p className="max-w-32 truncate text-[10px] font-medium text-muted-foreground">
          {roleLabels[user.role]}
        </p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          aria-label="Cerrar sesión"
          className="grid size-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <LogOut className="size-4" strokeWidth={1.9} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
