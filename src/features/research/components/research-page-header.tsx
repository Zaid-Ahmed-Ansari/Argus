type ResearchPageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  eyebrow?: string;
};

export function ResearchPageHeader({
  title,
  description,
  action,
  eyebrow = "Research Lab",
}: ResearchPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border bg-card px-6 py-8 lg:px-10">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
