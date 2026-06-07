import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import type { RootCauseFinding } from "@/types/investigation";

type RootCauseProps = {
  findings: RootCauseFinding[];
};

export function RootCause({ findings }: RootCauseProps) {
  return (
    <InvestigationSection
      id="root-cause"
      title="Root Cause Analysis"
      description="Underlying control failures that enabled the attack sequence."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {findings.map((finding, index) => (
          <article
            key={finding.id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-muted font-mono text-xs font-medium">
              {index + 1}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {finding.finding}
            </p>
          </article>
        ))}
      </div>
    </InvestigationSection>
  );
}
