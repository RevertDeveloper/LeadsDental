import { Badge } from "@/components/ui/badge";

type LeadClinicBadgeProps = {
  clinic: {
    name: string;
    color: string;
  };
};

export function LeadClinicBadge({ clinic }: LeadClinicBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="border-transparent"
      style={{
        backgroundColor: `${clinic.color}18`,
        color: clinic.color,
      }}
    >
      <span
        className="size-1.5 rounded-full ring-2 ring-current/20"
        style={{ backgroundColor: clinic.color }}
        aria-hidden="true"
      />
      {clinic.name}
    </Badge>
  );
}
