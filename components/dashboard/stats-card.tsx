import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  accentClassName: string;
};

export function StatsCard({
  label,
  value,
  detail,
  icon: Icon,
  accentClassName,
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div
        className={cn(
          "absolute -right-8 -top-10 size-28 rounded-full opacity-10 blur-2xl",
          accentClassName,
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-foreground">
            {value.toLocaleString("es-ES")}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-2xl",
            accentClassName,
          )}
        >
          <Icon className="size-[18px]" strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
