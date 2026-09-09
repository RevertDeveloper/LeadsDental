"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Header, type HeaderNotification } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/types/auth";

const SIDEBAR_COLLAPSED_COOKIE_NAME = "leadsdental.sidebar.collapsed";

export function ProtectedAppShell({
  user,
  notifications,
  children,
  initialCollapsed = false,
}: {
  user: CurrentUser;
  notifications: HeaderNotification[];
  children: ReactNode;
  initialCollapsed?: boolean;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    document.cookie = `${SIDEBAR_COLLAPSED_COOKIE_NAME}=${String(
      isSidebarCollapsed,
    )}; path=/; max-age=31536000; samesite=lax`;
  }, [isSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        user={user}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />
      <div
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72",
        )}
      >
        <Header user={user} notifications={notifications} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
