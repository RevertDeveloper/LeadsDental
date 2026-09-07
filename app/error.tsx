"use client";

import { RouteError } from "@/components/ui/route-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError scope="Clínica Dental Vitalis" reset={reset} digest={error.digest} />;
}
