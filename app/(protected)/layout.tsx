import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ProtectedAppShell } from "@/components/layout/protected-app-shell";
import { listLeads } from "@/lib/leads/list-leads";
import { AuthorizationError } from "@/lib/permissions/errors";
import { requireAuthenticatedUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = cookieStore.get("leadsdental.sidebar.collapsed")?.value === "true";

  let user;
  let notifications: { id: string; title: string; description: string; href: string }[] = [];

  try {
    user = await requireAuthenticatedUser();
  } catch (error) {
    if (
      error instanceof AuthorizationError &&
      ["UNAUTHENTICATED", "INACTIVE_USER", "FORBIDDEN"].includes(error.code)
    ) {
      redirect("/login");
    }

    throw error;
  }

  try {
    const leads = await listLeads({ status: "nuevo", sort: "recent" });
    notifications = leads.slice(0, 4).map((lead) => ({
      id: lead.id,
      title: `${lead.name} necesita seguimiento`,
      description: `${lead.clinic.name} · ${lead.treatment}`,
      href: `/leads/${lead.id}`,
    }));
  } catch {
    notifications = [];
  }

  return (
    <ProtectedAppShell
      user={user}
      notifications={notifications}
      initialCollapsed={initialSidebarCollapsed}
    >
      {children}
    </ProtectedAppShell>
  );
}
