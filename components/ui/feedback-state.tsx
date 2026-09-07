import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FeedbackVariant = "loading" | "empty" | "error";

type FeedbackStateProps = {
  variant: FeedbackVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

const defaults: Record<FeedbackVariant, { title: string; description: string }> = {
  loading: {
    title: "Cargando información",
    description: "Estamos preparando los datos del espacio de trabajo.",
  },
  empty: {
    title: "Todavía no hay registros",
    description: "Cuando aparezca actividad, la verás aquí.",
  },
  error: {
    title: "No se pudo cargar la información",
    description: "Inténtalo de nuevo o contacta con un administrador.",
  },
};

export function FeedbackState({
  variant,
  title,
  description,
  action,
  className,
}: FeedbackStateProps) {
  const content = defaults[variant];
  const Icon =
    variant === "loading"
      ? LoaderCircle
      : variant === "empty"
        ? Inbox
        : AlertCircle;

  return (
    <div
      role={variant === "loading" ? "status" : variant === "error" ? "alert" : undefined}
      className={cn(
        "flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-11 place-items-center rounded-2xl",
          variant === "error"
            ? "bg-red-50 text-red-600"
            : variant === "empty"
              ? "bg-slate-100 text-slate-500"
              : "bg-blue-50 text-primary",
        )}
      >
        <Icon
          className={cn("size-5", variant === "loading" && "animate-spin")}
          aria-hidden="true"
        />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-foreground">
        {title ?? content.title}
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {description ?? content.description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
