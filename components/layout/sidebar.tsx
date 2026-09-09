"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
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
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", enabled: true },
  { label: "Leads", href: "/leads", icon: "leads", enabled: true },
  {
    label: "Actividad",
    href: "/actividad",
    icon: "activity",
    allowedRoles: ["ADMIN", "CLINIC_MANAGER"],
    enabled: false,
  },
  {
    label: "Configuración",
    href: "/settings/users",
    icon: "settings",
    allowedRoles: ["ADMIN"],
    enabled: true,
  },
  {
    label: "Auditoría",
    href: "/settings/audit",
    icon: "audit",
    allowedRoles: ["ADMIN"],
    enabled: true,
  },
];

function canSeeItem(user: CurrentUser, item: NavigationItem) {
  return !item.allowedRoles || item.allowedRoles.includes(user.role);
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_rgba(37,99,235,0.9)] transition-transform group-hover:-rotate-3">
        <Sparkles className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className={cn("min-w-0", collapsed && "lg:hidden")}>
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

export function Sidebar({
  user,
  collapsed = false,
  onToggleCollapse,
}: {
  user: CurrentUser;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const visibleNavigation = navigation.filter((item) => canSeeItem(user, item));

  return (
    <aside
      className={cn(
        "border-sidebar-border bg-sidebar lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:border-r lg:transition-[width] lg:duration-200",
        collapsed ? "lg:w-20" : "lg:w-72",
      )}
    >
      <div className="flex min-h-16 items-center justify-between border-b border-sidebar-border px-4 sm:px-6 lg:min-h-24 lg:border-b-0 lg:px-3">
        <Brand collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "hidden rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex",
            collapsed && "lg:mx-auto",
          )}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto px-3 py-3 sm:px-4 lg:overflow-visible lg:px-3 lg:py-6">
        <p className={cn("mb-3 hidden px-3 text-[10px] font-bold tracking-[0.18em] text-sidebar-foreground/45 uppercase lg:block", collapsed && "lg:hidden")}>
          Espacio de trabajo
        </p>
        <SidebarNav
          items={visibleNavigation.map(({ enabled, ...item }) => ({
            ...item,
            disabled: enabled === false,
          }))}
          collapsed={collapsed}
        />
      </div>

      <div className={cn("hidden border-t border-sidebar-border p-5 lg:block", collapsed && "lg:hidden")}>
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
