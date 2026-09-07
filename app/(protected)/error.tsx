"use client";

import { RouteError } from "@/components/ui/route-error";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError scope="Espacio de trabajo" reset={reset} digest={error.digest} />;
}
