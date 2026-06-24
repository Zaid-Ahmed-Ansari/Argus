import Link from "next/link";
import { AnimatedMetric } from "@/features/research/components/animated-metric";
import { CoverageMatrix } from "@/features/research/components/coverage-matrix";
import { ExperimentTimeline } from "@/features/research/components/experiment-timeline";
import { ProgressTimeline } from "@/features/research/components/progress-timeline";
import { ResearchGraph } from "@/features/research/components/research-graph";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getResearchSnapshot } from "@/lib/research-snapshot";

export const revalidate = 86400;

export default async function ResearchLegacyPage() {
  const snapshot = await getResearchSnapshot();
  const { overview } = snapshot;
  const answered = snapshot.questions.filter((q) => q.status === "answered").length;

  return (
    <>
      <ResearchPageHeader
        title="Phase 1 — Gemini baseline (legacy)"
        description="Appendix preserving the original 10-scenario SSH log triage experiments with Gemini as a baseline before the ARGUS-1000 Qwen3 classification benchmark."
        action={
          <Link href="/research" className="text-sm underline">
            ← Current research lab
          </Link>
        }
      />

      <div className="research-section-gap px-6 py-8 lg:px-10">
        <p className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          This page documents early Phase 1 work. The main research platform now
          covers ARGUS-1000 incident classification with Qwen3-4B and LoRA.
        </p>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AnimatedMetric label="Scenarios" value={overview.totalScenarios} />
          <AnimatedMetric label="Experiments" value={overview.activeExperiments} />
          <AnimatedMetric label="Total runs" value={overview.totalRuns} />
          <AnimatedMetric
            label="Best accuracy"
            value={overview.bestAccuracy}
            format="percent"
          />
          <AnimatedMetric
            label="Avg hallucination"
            value={overview.avgHallucination}
            format="rate"
          />
        </section>

        <section className="surface-card p-6">
          <ProgressTimeline steps={overview.progressSteps} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Experiment coverage</h2>
          <CoverageMatrix cells={snapshot.coverageMatrix} />
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="surface-card overflow-hidden p-4">
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
          <div className="surface-card px-4">
            <ExperimentTimeline entries={snapshot.timeline.slice(-8)} />
          </div>
        </section>
      </div>
    </>
  );
}
