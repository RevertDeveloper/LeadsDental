import { Badge } from "@/components/ui/badge";
import { requiresAttention, type LeadPriorityInput } from "@/lib/leads/priority";

export function LeadPriorityIndicator({
  lead,
}: {
  lead: LeadPriorityInput;
}) {
  if (!requiresAttention(lead)) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      role="status"
      aria-label="Necesita seguimiento: implante nuevo"
      className="border-blue-200 bg-blue-50 text-[10px] text-blue-700"
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      Necesita seguimiento
    </Badge>
  );
}
