import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-12 text-foreground">
      <Card className="w-full max-w-xl">
        <CardContent className="p-8 sm:p-10">
          <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">404 · Vitalis CRM</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">No encontramos esta página</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            El registro puede haber sido eliminado o la dirección ya no está disponible.
          </p>
          <Link href="/dashboard" className={buttonVariants({ className: "mt-6" })}>
            Volver al dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
