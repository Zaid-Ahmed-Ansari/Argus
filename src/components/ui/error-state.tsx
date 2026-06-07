import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border border-destructive/20 bg-destructive/5 px-8 py-10 text-center",
        className,
      )}
    >
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" />
      </div>
      <p className="mt-4 text-lg font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            {retryLabel}
          </Button>
        ) : null}
        {action ? (
          <Link href={action.href} className={cn(buttonVariants())}>
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
