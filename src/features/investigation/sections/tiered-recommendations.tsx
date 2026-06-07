import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import type { TieredRecommendations } from "@/types/investigation";

type TieredRecommendationsSectionProps = {
  recommendations: TieredRecommendations;
};

function RecommendationColumn({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <ol className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
          >
            <span className="font-mono text-xs text-foreground">{i + 1}.</span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TieredRecommendationsSection({
  recommendations,
}: TieredRecommendationsSectionProps) {
  return (
    <InvestigationSection
      id="recommendations"
      title="Recommendations"
      description="Prioritized response actions for containment, remediation, and long-term hardening."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <RecommendationColumn
          title="Immediate Actions"
          items={recommendations.immediate}
          accent="#DC2626"
        />
        <RecommendationColumn
          title="Short-Term Actions"
          items={recommendations.shortTerm}
          accent="#D97706"
        />
        <RecommendationColumn
          title="Long-Term Improvements"
          items={recommendations.longTerm}
          accent="#16A34A"
        />
      </div>
    </InvestigationSection>
  );
}
