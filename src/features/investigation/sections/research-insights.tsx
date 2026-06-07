import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import type { ResearchInsight } from "@/types/investigation";

type ResearchInsightsProps = {
  insights: ResearchInsight[];
};

export function ResearchInsights({ insights }: ResearchInsightsProps) {
  return (
    <InvestigationSection
      id="research"
      title="Research Insights"
      description="Structured findings for evaluation, publication, and model benchmarking."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {insight.title}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {insight.finding}
            </p>
          </article>
        ))}
      </div>
    </InvestigationSection>
  );
}
