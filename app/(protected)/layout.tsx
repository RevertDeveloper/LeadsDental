import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthorizationError } from "@/lib/permissions/errors";
import { requireAuthenticatedUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  let user;

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar user={user} />
      <div className="min-h-screen lg:pl-72">
        <Header user={user} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
