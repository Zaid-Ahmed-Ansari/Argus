import { cn } from "@/lib/utils";

type InvestigationSectionProps = {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function InvestigationSection({
  id,
  title,
  description,
  action,
  children,
  className,
}: InvestigationSectionProps) {
  return (
    <section
      id={id}
      className={cn("investigation-section scroll-mt-24", className)}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
