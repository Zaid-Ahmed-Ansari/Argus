import { Badge } from "@/components/ui/badge";
import { MetricBar } from "@/features/experiments/components/metric-bar";
import type { VariantAggregate } from "@/lib/experiment-results";
import type { ExperimentConfig, ExperimentMetric } from "@/types/experiment";
import { cn } from "@/lib/utils";

const METRIC_LABELS: Record<ExperimentMetric, { label: string; invert?: boolean; format?: "percent" | "latency" }> = {
  accuracy: { label: "Composite accuracy" },
  attack_type_accuracy: { label: "Attack type accuracy" },
  severity_accuracy: { label: "Severity accuracy" },
  mitre_mapping_accuracy: { label: "MITRE mapping" },
  investigation_quality: { label: "Investigation quality" },
  recommendation_quality: { label: "Recommendation quality" },
  triage_completeness: { label: "Triage completeness" },
  analyst_utility_score: { label: "Analyst utility" },
  hallucination_rate: { label: "Hallucination", invert: true },
  relevance: { label: "Relevance" },
  latency_ms: { label: "Latency", format: "latency" },
};

type ExperimentComparisonPanelProps = {
  config: ExperimentConfig;
  aggregates: VariantAggregate[];
};

function findVariant(variantSlug: string, config: ExperimentConfig) {
  return config.variants.find((v) => {
    const slug = (v.label ?? "").toLowerCase().replace(/\s+/g, "-");
    return slug === variantSlug || variantSlug.includes(slug) || slug.includes(variantSlug);
  });
}

function variantLabel(variantSlug: string, config: ExperimentConfig): string {
  return findVariant(variantSlug, config)?.label ?? variantSlug;
}

function variantConfigBadges(
  variantSlug: string,
  config: ExperimentConfig,
): string[] {
  const variant = findVariant(variantSlug, config) ?? config.variants[0];
  if (!variant) return [];

  const badges: string[] = [];
  if (variant.usedRag !== undefined) {
    badges.push(variant.usedRag ? "RAG on" : "RAG off");
  }
  if (variant.inputFormat) {
    badges.push(variant.inputFormat === "RAW" ? "Raw logs" : "Structured");
  }
  return badges;
}

function pickWinner(aggregates: VariantAggregate[]): string | null {
  const scored = aggregates.filter((a) => a.accuracy !== undefined);
  if (scored.length === 0) return null;
  return scored.reduce((best, row) =>
    (row.accuracy ?? 0) > (best.accuracy ?? 0) ? row : best,
  ).variant;
}

function getMetricValue(
  row: VariantAggregate,
  metric: ExperimentMetric,
): number | undefined {
  return row[metric as keyof VariantAggregate] as number | undefined;
}

export function ExperimentComparisonPanel({
  config,
  aggregates,
}: ExperimentComparisonPanelProps) {
  const winner = pickWinner(aggregates);
  const hasResults = aggregates.length > 0;
  const displayMetrics = config.metrics.filter((m) => m !== "latency_ms").slice(0, 5);

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border bg-muted/30 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {config.id}
              </p>
              {config.category ? (
                <Badge variant="outline" className="text-xs capitalize">
                  {config.category}
                </Badge>
              ) : null}
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {config.name}
            </h2>
            {config.description ? (
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                {config.description}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="p-6">
        {!hasResults ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-base text-muted-foreground">
            No results recorded yet for this experiment.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {aggregates.map((row) => {
              const isWinner = winner === row.variant && aggregates.length > 1;
              return (
                <div
                  key={row.variant}
                  className={cn(
                    "rounded-lg border border-border p-5",
                    isWinner && "border-foreground/30 bg-muted/20 ring-1 ring-foreground/10",
                  )}
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-medium">
                      {variantLabel(row.variant, config)}
                    </h3>
                    {isWinner ? (
                      <Badge className="text-sm">Higher accuracy</Badge>
                    ) : null}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {variantConfigBadges(row.variant, config).map((badge) => (
                      <span
                        key={badge}
                        className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground"
                      >
                        {badge}
                      </span>
                    ))}
                    <span className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                      {row.runs} run{row.runs === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {displayMetrics.map((metric) => {
                      const meta = METRIC_LABELS[metric];
                      return (
                        <MetricBar
                          key={metric}
                          label={meta.label}
                          value={getMetricValue(row, metric)}
                          highlight={isWinner && metric === "accuracy"}
                          invert={meta.invert}
                          format={meta.format}
                        />
                      );
                    })}
                    {config.metrics.includes("latency_ms") ? (
                      <MetricBar
                        label="Latency"
                        value={row.latency_ms}
                        format="latency"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
