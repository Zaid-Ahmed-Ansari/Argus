import { cn } from "@/lib/utils";

type MetricBarProps = {
  label: string;
  value?: number;
  format?: "percent" | "latency";
  invert?: boolean;
  highlight?: boolean;
};

function formatValue(value: number | undefined, format: "percent" | "latency"): string {
  if (value === undefined) return "—";
  if (format === "latency") return `${Math.round(value)} ms`;
  return `${(value * 100).toFixed(1)}%`;
}

export function MetricBar({
  label,
  value,
  format = "percent",
  invert = false,
  highlight = false,
}: MetricBarProps) {
  const width =
    value === undefined
      ? 0
      : format === "latency"
        ? Math.min(100, (value / 15000) * 100)
        : invert
          ? Math.max(4, (1 - value) * 100)
          : Math.max(4, value * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            highlight && "text-foreground",
          )}
        >
          {formatValue(value, format)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            highlight ? "bg-foreground" : "bg-foreground/50",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
