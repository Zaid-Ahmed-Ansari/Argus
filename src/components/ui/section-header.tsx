import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
};

export function SectionHeader({
  title,
  description,
  className,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-lg text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
