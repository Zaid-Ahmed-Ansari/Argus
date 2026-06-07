import { cn } from "@/lib/utils";
import { formatSeverity } from "@/utils/format";

type SeverityBadgeProps = {
  severity: string;
  className?: string;
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const key = severity.toUpperCase();
  const isElevated = key === "CRITICAL" || key === "HIGH";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-medium",
        isElevated
          ? "border-destructive/30 bg-destructive/8 text-destructive"
          : "border-primary/20 bg-accent text-accent-foreground",
        className,
      )}
    >
      {formatSeverity(key)}
    </span>
  );
}
