import { Bell, ChevronDown, MapPin } from "lucide-react";

import { UserMenu } from "@/components/layout/user-menu";
import type { CurrentUser } from "@/types/auth";

export function Header({ user }: { user: CurrentUser }) {
  const primaryClinic = user.clinics[0];
  const clinicLabel =
    user.clinics.length > 1
      ? `${user.clinics.length} clínicas`
      : primaryClinic?.name ?? "Sin clínica";

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-20 lg:px-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            <span className="truncate">{clinicLabel}</span>
            <ChevronDown className="hidden size-3.5 sm:block" aria-hidden="true" />
          </div>
          <p className="mt-1 truncate text-sm font-semibold tracking-[-0.01em] sm:text-base">
            Buenos días, {user.fullName.split(" ")[0]}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Bell className="size-4" strokeWidth={1.9} aria-hidden="true" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-500 ring-2 ring-card" aria-hidden="true" />
          </button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
