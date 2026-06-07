import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import type { MitreTechnique } from "@/types/investigation";

type MitreMappingProps = {
  techniques: MitreTechnique[];
};

export function MitreMapping({ techniques }: MitreMappingProps) {
  return (
    <InvestigationSection
      id="mitre"
      title="MITRE ATT&CK Mapping"
      description="Detected techniques with confidence scores and correlated event references."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {techniques.map((technique) => (
          <article
            key={technique.id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-foreground bg-foreground px-2.5 py-1 font-mono text-xs font-medium text-background">
                {technique.id}
              </span>
              <span className="font-semibold text-foreground">
                {technique.name}
              </span>
              <span className="ml-auto rounded-md border border-border bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {technique.confidence}% confidence
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {technique.description}
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Related events: {technique.relatedEventIds.join(", ")}
            </p>
          </article>
        ))}
      </div>
    </InvestigationSection>
  );
}
