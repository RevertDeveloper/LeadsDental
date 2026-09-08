"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  Settings2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type SidebarIconName =
  | "dashboard"
  | "leads"
  | "activity"
  | "settings"
  | "audit";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon: SidebarIconName;
  disabled?: boolean;
};

const icons: Record<SidebarIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  leads: UsersRound,
  activity: Activity,
  settings: Settings2,
  audit: ClipboardList,
};

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
      {items.map((item) => {
        const Icon = icons[item.icon];
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        const className = cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
          item.disabled && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-sidebar-foreground/70",
        );
        const content = (
          <>
            <Icon
              className="size-[18px] text-sidebar-foreground/55 transition-colors group-hover:text-sidebar-primary group-aria-[current=page]:text-sidebar-primary"
              strokeWidth={1.9}
              aria-hidden="true"
            />
            <span>{item.label}</span>
            {item.disabled ? (
              <span className="ml-auto hidden text-[9px] font-bold tracking-[0.08em] text-sidebar-foreground/40 uppercase lg:block">
                Pronto
              </span>
            ) : null}
          </>
        );

        return item.disabled ? (
          <span key={item.href} aria-disabled="true" title="Disponible en una fase posterior" className={className}>
            {content}
          </span>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
