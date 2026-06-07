import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
  className?: string;
};

export function StatCard({ label, value, isLoading, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "surface-card flex min-h-[96px] min-w-0 flex-col justify-between px-4 py-4 sm:px-5 sm:py-5",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase leading-snug tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tabular-nums leading-none tracking-tight text-foreground sm:text-3xl">
        {isLoading ? <Skeleton className="h-8 w-16" /> : value}
      </p>
    </div>
  );
}
