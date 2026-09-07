import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ActionFeedbackProps = {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
};

export function ActionFeedback({ variant, children, className }: ActionFeedbackProps) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-6",
        variant === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
        className,
      )}
    >
      {children}
    </p>
  );
}
