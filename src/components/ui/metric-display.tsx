import { cn } from "@/lib/utils";

type MetricDisplayProps = {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  tone?: "default" | "success" | "warning" | "critical";
  className?: string;
};

const TONE_CLASS = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
};

export function MetricDisplay({
  label,
  value,
  subtext,
  tone = "default",
  className,
}: MetricDisplayProps) {
  return (
    <div className={cn("surface-card px-5 py-5", className)}>
      <p className="metric-label">{label}</p>
      <p className={cn("metric-value mt-2", TONE_CLASS[tone])}>{value}</p>
      {subtext ? (
        <p className="mt-2 text-sm text-muted-foreground">{subtext}</p>
      ) : null}
    </div>
  );
}
