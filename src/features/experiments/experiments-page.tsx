import Link from "next/link";
import { BookOpen, FlaskConical, Microscope } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ExperimentComparisonPanel } from "@/features/experiments/components/experiment-comparison-panel";
import { ExperimentMatrix } from "@/features/experiments/components/experiment-matrix";
import { MethodologySection } from "@/features/experiments/components/methodology-section";
import { MetricsGlossary } from "@/features/experiments/components/metrics-glossary";
import { PaperOutline } from "@/features/experiments/components/paper-outline";
import { ResearchQuestionsSection } from "@/features/experiments/components/research-questions-section";
import { ScenarioCatalog } from "@/features/experiments/components/scenario-catalog";
import { ScenarioLeaderboard } from "@/features/experiments/components/scenario-leaderboard";
import {
  aggregateResultsByScenario,
  aggregateResultsByVariant,
  loadExperimentResults,
} from "@/lib/experiment-results";
import { loadExperimentConfigs } from "@/lib/experiments";
import {
  PLANNED_EXPERIMENTS,
  RESEARCH_QUESTIONS,
  RESEARCH_SCENARIOS,
} from "@/lib/research-catalog";
import { getRetrieverModeLabel } from "@/services/rag/retriever-factory";
import { cn } from "@/lib/utils";

export async function ExperimentsPageContent() {
  const [configs, results] = await Promise.all([
    loadExperimentConfigs(),
    loadExperimentResults(),
  ]);

  const scenarioLeaderboard = aggregateResultsByScenario(results);
  const totalRuns = results.length;
  const scenarioCount = RESEARCH_SCENARIOS.length;
  const activeExperiments = PLANNED_EXPERIMENTS.filter(
    (e) => e.status === "active",
  ).length;

  return (
    <div className="landing-grid">
      {/* Hero */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium">
            <Microscope className="size-4" />
            AI security research platform
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
            Evaluating LLMs for Security Operations Center log triage
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted-foreground">
            Argus is a controlled research environment for measuring how
            retrieval-augmented language models perform on labeled cybersecurity
            scenarios — with ground-truth metrics, not subjective chat ratings.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Scenarios</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {scenarioCount}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Labeled attack fixtures
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Active experiments</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {activeExperiments}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                RAG, input, benchmark axes
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Recorded runs</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {totalRuns}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Batch evaluation results
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">RAG retriever</p>
              <p className="mt-1 text-lg font-semibold">
                {getRetrieverModeLabel()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                FTS + semantic hybrid
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
        <MethodologySection />
        <ScenarioCatalog scenarios={RESEARCH_SCENARIOS} />
        <ResearchQuestionsSection questions={RESEARCH_QUESTIONS} />
        <ExperimentMatrix experiments={PLANNED_EXPERIMENTS} />

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Live experiment results
              </h2>
              <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                Variant comparisons from batch runs. Reproduce with{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  npm run experiment:all
                </code>
              </p>
            </div>
            <FlaskConical className="size-8 text-muted-foreground" />
          </div>
          <div className="mt-8 space-y-8">
            {configs.map((config) => (
              <ExperimentComparisonPanel
                key={config.id}
                config={config}
                aggregates={aggregateResultsByVariant(results, config.id)}
              />
            ))}
          </div>
        </section>

        <ScenarioLeaderboard aggregates={scenarioLeaderboard} />
        <MetricsGlossary />
        <PaperOutline />

        <section className="rounded-xl border border-border bg-muted/30 p-8 md:p-10">
          <div className="flex items-start gap-4">
            <BookOpen className="mt-1 size-6 shrink-0 text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Reproduce this research
              </h2>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-background p-4 text-sm">
{`cd argus
npm run experiment:run              # default scenario
npm run experiment:all              # all 10 scenarios
npm run experiment:scenario -- brute_force password_spray
npm run experiment:rag              # RAG comparison only`}
              </pre>
              <p className="mt-4 text-lg text-muted-foreground">
                Sign in to analyze your own logs on the private dashboard.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Create account
                </Link>
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
