import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedLoading() {
  return (
    <div className="space-y-8" aria-label="Cargando espacio de trabajo" role="status">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.8fr)]">
        <Skeleton className="h-[360px]" />
        <Skeleton className="h-[360px]" />
      </div>
    </div>
  );
}
