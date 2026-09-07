"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RouteErrorProps = {
  scope: string;
  reset: () => void;
  digest?: string;
};

export function RouteError({ scope, reset, digest }: RouteErrorProps) {
  useEffect(() => {
    if (digest) {
      console.error("Route error", { digest, scope });
    }
  }, [digest, scope]);

  return (
    <Card className="mx-auto max-w-2xl border-red-200/80">
      <CardContent className="flex flex-col items-start gap-5 p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-red-700 uppercase">
            {scope}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-foreground">
            No se ha podido cargar esta sección
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Ha ocurrido un problema inesperado. Puedes volver a intentarlo sin perder los datos guardados.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={reset}>
          <RefreshCcw aria-hidden="true" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}
