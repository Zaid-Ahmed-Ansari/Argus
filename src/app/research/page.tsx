import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedMetric } from "@/features/research/components/animated-metric";
import { CoverageMatrix } from "@/features/research/components/coverage-matrix";
import { ProgressTimeline } from "@/features/research/components/progress-timeline";
import { ResearchGraph } from "@/features/research/components/research-graph";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { ExperimentTimeline } from "@/features/research/components/experiment-timeline";
import { getResearchSnapshot } from "@/lib/research-snapshot";

export default async function ResearchOverviewPage() {
  const snapshot = await getResearchSnapshot();
  const { overview } = snapshot;
  const answered = snapshot.questions.filter((q) => q.status === "answered").length;

  return (
    <>
      <ResearchPageHeader
        title="Command center"
        description="Evaluating Gemini as a baseline for SOC log triage while building the labeled corpus and metrics framework to fine-tune an open-source security model on cybersecurity-grounded supervision."
        action={
          <Link
            href="/research/results"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            View results
          </Link>
        }
      />

      <div className="research-section-gap px-6 py-8 lg:px-10">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AnimatedMetric label="Scenarios" value={overview.totalScenarios} />
          <AnimatedMetric label="Experiments" value={overview.activeExperiments} />
          <AnimatedMetric label="Total runs" value={overview.totalRuns} />
          <AnimatedMetric
            label="Best accuracy"
            value={overview.bestAccuracy}
            format="percent"
            tone={
              overview.bestAccuracy !== null && overview.bestAccuracy >= 0.7
                ? "success"
                : "default"
            }
          />
          <AnimatedMetric
            label="Avg hallucination"
            value={overview.avgHallucination}
            format="rate"
            tone={
              overview.avgHallucination !== null && overview.avgHallucination > 0.2
                ? "critical"
                : "default"
            }
          />
        </section>

        <section className="surface-card p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Research trajectory</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Phase 1: Gemini baseline + eval framework → Phase 2: fine-tune
                open-source model on labeled logs
              </p>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              {answered}/{snapshot.questions.length} hypotheses answered
            </p>
          </div>
          <ProgressTimeline steps={overview.progressSteps} />
        </section>

        <section>
          <h2 className="text-lg font-semibold">Experiment coverage</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Per-scenario scores across No RAG, Hybrid RAG, Raw, and Structured axes.
          </p>
          <CoverageMatrix cells={snapshot.coverageMatrix} />
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold">Research graph</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Dataset → experiment → result → hypothesis
            </p>
            <div className="surface-card overflow-hidden">
              <ResearchGraph
                data={{
                  scenarios: snapshot.scenarios.map((s) => ({
                    id: s.id,
                    name: s.name,
                  })),
                  experiments: snapshot.experiments.map((e) => ({
                    id: e.id,
                    name: e.name,
                  })),
                  resultCount: snapshot.results.length,
                  answeredCount: answered,
                }}
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Recent runs</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Latest batch evaluation activity
            </p>
            <div className="surface-card px-4">
              <ExperimentTimeline entries={snapshot.timeline.slice(-8)} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
