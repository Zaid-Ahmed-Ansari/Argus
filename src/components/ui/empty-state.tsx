import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border bg-muted/30 px-8 py-14 text-center",
        className,
      )}
    >
      <p className="text-xl font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-lg text-muted-foreground">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className={cn(buttonVariants(), "mt-8")}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
