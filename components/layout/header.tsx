"use client";

import Link from "next/link";
import { Bell, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { UserMenu } from "@/components/layout/user-menu";
import type { CurrentUser } from "@/types/auth";

export type HeaderNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export function Header({
  user,
  notifications = [],
}: {
  user: CurrentUser;
  notifications?: HeaderNotification[];
}) {
  const [clinicMenuOpen, setClinicMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const clinicMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (clinicMenuRef.current && !clinicMenuRef.current.contains(target)) {
        setClinicMenuOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const primaryClinic = user.clinics[0];
  const clinicLabel =
    user.clinics.length > 1
      ? `${user.clinics.length} clínicas`
      : primaryClinic?.name ?? "Sin clínica";

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-20 lg:px-10">
        <div className="min-w-0">
          <div ref={clinicMenuRef} className="relative">
            <button
              type="button"
              aria-expanded={clinicMenuOpen}
              aria-label="Abrir selector de clínicas"
              onClick={() => setClinicMenuOpen((current) => !current)}
              className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              <span className="truncate">{clinicLabel}</span>
              <ChevronDown
                className={`hidden size-3.5 transition-transform sm:block ${clinicMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {clinicMenuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover p-2 shadow-[0_22px_50px_-24px_rgba(15,23,42,0.45)]">
                <div className="mb-2 flex items-center justify-between px-2 py-1">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
                    Clínicas accesibles
                  </p>
                  <Link
                    href="/leads"
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    onClick={() => setClinicMenuOpen(false)}
                  >
                    Ver todas
                  </Link>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/leads"
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setClinicMenuOpen(false)}
                  >
                    <span>Todas las clínicas</span>
                    <span className="text-xs text-muted-foreground">Filtro global</span>
                  </Link>
                  {user.clinics.map((clinic) => (
                    <Link
                      key={clinic.id}
                      href={`/leads?clinic_id=${clinic.id}`}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      onClick={() => setClinicMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="size-2 rounded-full ring-4 ring-background"
                          style={{ backgroundColor: clinic.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{clinic.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">Filtrar</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <p className="mt-1 truncate text-sm font-semibold tracking-[-0.01em] sm:text-base">
            Buenos días, {user.fullName.split(" ")[0]}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              aria-label="Notificaciones"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((current) => !current)}
              className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Bell className="size-4" strokeWidth={1.9} aria-hidden="true" />
              {notifications.length > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-card">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover p-2 shadow-[0_22px_50px_-24px_rgba(15,23,42,0.45)]">
                <div className="mb-2 flex items-center justify-between px-2 py-1">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
                    Notificaciones
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {notifications.length}
                  </span>
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.href}
                        className="block rounded-xl border border-transparent px-2.5 py-2 transition-colors hover:border-border hover:bg-muted"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          {notification.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/25 px-3 py-4 text-sm text-muted-foreground">
                    No tienes notificaciones pendientes.
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
