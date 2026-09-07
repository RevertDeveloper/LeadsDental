import { LoaderCircle, Sparkles } from "lucide-react";

export function AiLoadingState() {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary" role="status">
      <span className="grid size-6 place-items-center rounded-full bg-primary/10">
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Generando…
      </span>
    </span>
  );
}
