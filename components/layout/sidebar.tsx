import Link from "next/link";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  Settings2,
  Sparkles,
  UsersRound,
} from "lucide-react";

import type { CurrentUser, UserRole } from "@/types/auth";
import { SidebarNav, type SidebarNavItem } from "@/components/layout/sidebar-nav";

type NavigationItem = {
  label: string;
  href: string;
  icon: SidebarNavItem["icon"];
  allowedRoles?: readonly UserRole[];
  enabled?: boolean;
};

const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Leads", href: "/leads", icon: UsersRound, enabled: true },
  {
    label: "Actividad",
    href: "/actividad",
    icon: Activity,
    allowedRoles: ["ADMIN", "CLINIC_MANAGER"],
    enabled: false,
  },
  {
    label: "Configuración",
    href: "/settings/users",
    icon: Settings2,
    allowedRoles: ["ADMIN"],
    enabled: true,
  },
  {
    label: "Auditoría",
    href: "/settings/audit",
    icon: ClipboardList,
    allowedRoles: ["ADMIN"],
    enabled: true,
  },
];

function canSeeItem(user: CurrentUser, item: NavigationItem) {
  return !item.allowedRoles || item.allowedRoles.includes(user.role);
}

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_rgba(37,99,235,0.9)] transition-transform group-hover:-rotate-3">
        <Sparkles className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-bold tracking-[-0.02em]">
          Vitalis
        </span>
        <span className="block truncate text-[11px] font-medium tracking-[0.14em] text-sidebar-foreground/55 uppercase">
          CRM comercial
        </span>
      </span>
    </Link>
  );
}

export function Sidebar({ user }: { user: CurrentUser }) {
  const visibleNavigation = navigation.filter((item) => canSeeItem(user, item));

  return (
    <aside className="border-sidebar-border bg-sidebar lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col lg:border-r">
      <div className="flex min-h-16 items-center justify-between border-b border-sidebar-border px-4 sm:px-6 lg:min-h-24 lg:border-b-0 lg:px-7">
        <Brand />
        <span className="hidden rounded-full bg-sidebar-primary/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-sidebar-primary uppercase lg:inline-flex">
          Interno
        </span>
      </div>

      <div className="flex-1 overflow-x-auto px-3 py-3 sm:px-4 lg:overflow-visible lg:px-5 lg:py-6">
        <p className="mb-3 hidden px-3 text-[10px] font-bold tracking-[0.18em] text-sidebar-foreground/45 uppercase lg:block">
          Espacio de trabajo
        </p>
        <SidebarNav
          items={visibleNavigation.map(({ enabled, ...item }) => ({
            ...item,
            disabled: enabled === false,
          }))}
        />
      </div>

      <div className="hidden border-t border-sidebar-border p-5 lg:block">
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/45 p-4">
          <p className="text-[10px] font-bold tracking-[0.16em] text-sidebar-foreground/45 uppercase">
            Clínicas asignadas
          </p>
          <div className="mt-3 space-y-2">
            {user.clinics.length > 0 ? (
              user.clinics.map((clinic) => (
                <div key={clinic.id} className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/75">
                  <span
                    className="size-2 rounded-full ring-4 ring-white/60"
                    style={{ backgroundColor: clinic.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{clinic.name}</span>
                </div>
              ))
            ) : (
              <p className="text-xs leading-5 text-sidebar-foreground/55">
                Sin clínicas activas asignadas.
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
