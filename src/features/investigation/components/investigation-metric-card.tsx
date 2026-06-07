import { cn } from "@/lib/utils";

type InvestigationMetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "default" | "critical" | "high" | "warning" | "success";
  className?: string;
};

const variantStyles = {
  default: "text-foreground",
  critical: "text-critical",
  high: "text-critical",
  warning: "text-warning",
  success: "text-success",
};

export function InvestigationMetricCard({
  label,
  value,
  sublabel,
  variant = "default",
  className,
}: InvestigationMetricCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[108px] min-w-0 flex-col justify-between rounded-lg border border-border bg-card p-4 sm:p-5",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase leading-snug tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 text-2xl font-semibold tabular-nums leading-none tracking-tight sm:text-3xl",
          variantStyles[variant],
        )}
      >
        {value}
      </p>
      {sublabel ? (
        <p className="mt-2 text-xs text-muted-foreground">{sublabel}</p>
      ) : (
        <span className="mt-2 block h-0" aria-hidden />
      )}
    </div>
  );
}
