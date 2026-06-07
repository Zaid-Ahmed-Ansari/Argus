import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  aggregateResultsByScenario,
  aggregateResultsByVariant,
  loadExperimentResults,
  type StoredExperimentResult,
} from "@/lib/experiment-results";
import { loadExperimentConfigs } from "@/lib/experiments";
import {
  PAPER_SECTIONS,
  RESEARCH_QUESTIONS,
  RESEARCH_SCENARIOS,
} from "@/lib/research-catalog";
import {
  loadAllEvalFixtures,
  type EvalFixture,
} from "@/services/eval/ground-truth";
import type { ExperimentConfig, ExperimentVariant } from "@/types/experiment";

import { COVERAGE_AXES, type CoverageAxis } from "@/lib/research-constants";
import { computeAllResearchFindings } from "@/lib/research-findings";
import type {
  CoverageCell,
  EnrichedExperiment,
  EnrichedQuestion,
  EnrichedScenario,
  LeaderboardRow,
  ProgressStep,
  ReportItem,
  ResearchOverview,
  TimelineEntry,
} from "@/lib/research-types";

export type { CoverageAxis } from "@/lib/research-constants";
export type {
  CoverageCell,
  EnrichedExperiment,
  EnrichedQuestion,
  EnrichedScenario,
  LeaderboardRow,
  ProgressStep,
  QuestionStatus,
  ReportItem,
  ResearchOverview,
  TimelineEntry,
} from "@/lib/research-types";
export { COVERAGE_AXES };

export type ResearchSnapshot = {
  overview: ResearchOverview;
  coverageMatrix: CoverageCell[];
  scenarios: EnrichedScenario[];
  experiments: EnrichedExperiment[];
  results: StoredExperimentResult[];
  leaderboard: LeaderboardRow[];
  questions: EnrichedQuestion[];
  timeline: TimelineEntry[];
  reports: ReportItem[];
  configs: ExperimentConfig[];
};

function variantSlug(variant: ExperimentVariant, index: number): string {
  return (
    variant.label?.toLowerCase().replace(/\s+/g, "-") ?? `variant-${index + 1}`
  );
}

function findVariantForResult(
  result: StoredExperimentResult,
  configs: ExperimentConfig[],
): ExperimentVariant | undefined {
  const config = configs.find((c) => c.id === result.experimentId);
  if (!config) return undefined;
  return config.variants.find((v, i) => {
    const slug = variantSlug(v, i);
    return (
      result.variant === slug ||
      result.variant.includes(slug) ||
      slug.includes(result.variant)
    );
  });
}

function matchesAxis(
  variant: ExperimentVariant | undefined,
  axis: CoverageAxis,
): boolean {
  if (!variant) return false;
  switch (axis) {
    case "no_rag":
      return variant.usedRag === false;
    case "hybrid_rag":
      return variant.usedRag === true;
    case "raw_input":
      return variant.inputFormat !== "STRUCTURED";
    case "structured_input":
      return variant.inputFormat === "STRUCTURED";
    default:
      return false;
  }
}

function buildCoverageMatrix(
  results: StoredExperimentResult[],
  configs: ExperimentConfig[],
): CoverageCell[] {
  const cells: CoverageCell[] = [];
  for (const scenario of RESEARCH_SCENARIOS) {
    for (const axis of COVERAGE_AXES) {
      const matching = results.filter((r) => {
        if (r.fixtureId !== scenario.id) return false;
        const variant = findVariantForResult(r, configs);
        return matchesAxis(variant, axis.id);
      });
      const scores = matching
        .map((r) => r.metrics.accuracy)
        .filter((v): v is number => typeof v === "number");
      cells.push({
        scenarioId: scenario.id,
        axis: axis.id,
        score:
          scores.length > 0 ? Math.max(...scores) : null,
        runs: matching.length,
      });
    }
  }
  return cells;
}

function buildProgressSteps(
  fixtures: EvalFixture[],
  results: StoredExperimentResult[],
  configs: ExperimentConfig[],
): ProgressStep[] {
  const hasDatasets = fixtures.length >= 10;
  const hasRuns = results.length > 0;
  const hasEval = results.some((r) => r.metrics.accuracy !== undefined);
  const answered = computeAllResearchFindings(results, configs).filter(
    (q) => q.status === "answered",
  ).length;

  return [
    {
      id: "datasets",
      label: "Corpus labeled",
      status: hasDatasets ? "complete" : "active",
      detail: `${fixtures.length} scenarios with ground truth`,
    },
    {
      id: "runs",
      label: "Experiments executed",
      status: hasRuns ? "complete" : hasDatasets ? "active" : "pending",
      detail: hasRuns ? `${results.length} recorded runs` : "Awaiting batch runner",
    },
    {
      id: "eval",
      label: "Metrics computed",
      status: hasEval ? "complete" : hasRuns ? "active" : "pending",
      detail: hasEval ? "Ground-truth scoring applied" : "Pending evaluation",
    },
    {
      id: "rq",
      label: "Hypotheses tested",
      status: answered > 0 ? (answered >= 3 ? "complete" : "active") : "pending",
      detail: `${answered} of ${RESEARCH_QUESTIONS.length} questions with evidence`,
    },
  ];
}

function buildLeaderboard(
  results: StoredExperimentResult[],
  configs: ExperimentConfig[],
): LeaderboardRow[] {
  return results
    .filter((r) => typeof r.metrics.accuracy === "number")
    .map((r) => {
      const config = configs.find((c) => c.id === r.experimentId);
      return {
        id: `${r.experimentId}-${r.fixtureId}-${r.variant}-${r.recordedAt}`,
        model: "Gemini",
        experiment: config?.name ?? r.experimentId,
        variant: r.variant,
        scenario: r.scenario ?? r.fixtureId ?? "—",
        accuracy: r.metrics.accuracy ?? 0,
        hallucinationRate: r.metrics.hallucination_rate ?? 0,
        latencyMs: r.metrics.latency_ms ?? r.metrics.latencyMs ?? 0,
        relevance: r.metrics.relevance ?? 0,
        recordedAt: r.recordedAt,
      };
    })
    .sort((a, b) => b.accuracy - a.accuracy);
}

function buildTimeline(
  results: StoredExperimentResult[],
  configs: ExperimentConfig[],
): TimelineEntry[] {
  return results
    .filter((r) => typeof r.metrics.accuracy === "number")
    .map((r) => ({
      id: `${r.experimentId}-${r.recordedAt}`,
      recordedAt: r.recordedAt,
      experimentId: r.experimentId,
      experimentName:
        configs.find((c) => c.id === r.experimentId)?.name ?? r.experimentId,
      variant: r.variant,
      scenario: r.scenario ?? r.fixtureId ?? "—",
      accuracy: r.metrics.accuracy ?? 0,
    }))
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
}

async function loadScenarioLogs(
  fixtures: EvalFixture[],
): Promise<EnrichedScenario[]> {
  return Promise.all(
    RESEARCH_SCENARIOS.map(async (meta) => {
      const fixture = fixtures.find((f) => f.fixtureId === meta.id);
      let sampleLog = "";
      if (fixture) {
        sampleLog = await readFile(
          path.join(process.cwd(), fixture.logFile),
          "utf-8",
        );
      }
      return {
        ...meta,
        difficulty: meta.difficulty,
        sampleLog,
        groundTruth: fixture?.groundTruth ?? {
          attackType: meta.name,
          severity: meta.severity,
          mitreTechniques: meta.mitre,
        },
        runCount: 0,
        bestAccuracy: null,
      };
    }),
  );
}

export async function getResearchSnapshot(): Promise<ResearchSnapshot> {
  const [configs, results, fixtures] = await Promise.all([
    loadExperimentConfigs(),
    loadExperimentResults(),
    loadAllEvalFixtures(),
  ]);

  const scenarios = await loadScenarioLogs(fixtures);
  const scenarioAgg = aggregateResultsByScenario(results);
  for (const scenario of scenarios) {
    const agg = scenarioAgg.find((s) => s.fixtureId === scenario.id);
    scenario.runCount = agg?.runs ?? 0;
    scenario.bestAccuracy = agg?.accuracy ?? null;
  }

  const experiments: EnrichedExperiment[] = configs.map((config) => {
    const aggregates = aggregateResultsByVariant(results, config.id);
    const best = aggregates.reduce(
      (top, row) =>
        (row.accuracy ?? 0) > (top?.accuracy ?? 0) ? row : top,
      aggregates[0],
    );
    const linkedRq = RESEARCH_QUESTIONS.find((rq) =>
      rq.experiments.includes(config.id),
    );

    return {
      id: config.id,
      name: config.name,
      description: config.description ?? "",
      category: config.category ?? "scenario",
      status: "active",
      researchQuestion: linkedRq?.question ?? "Evaluate SOC analysis quality under controlled conditions.",
      runs: aggregates.reduce((s, a) => s + a.runs, 0),
      bestAccuracy: best?.accuracy ?? null,
      bestVariant: best?.variant ?? null,
      variants: config.variants,
      metrics: config.metrics,
    };
  });

  const accuracies = results
    .map((r) => r.metrics.accuracy)
    .filter((v): v is number => typeof v === "number");
  const hallucinations = results
    .map((r) => r.metrics.hallucination_rate)
    .filter((v): v is number => typeof v === "number");

  const overview: ResearchOverview = {
    totalScenarios: RESEARCH_SCENARIOS.length,
    totalExperiments: configs.length,
    activeExperiments: configs.length,
    totalRuns: results.length,
    bestAccuracy: accuracies.length > 0 ? Math.max(...accuracies) : null,
    avgHallucination:
      hallucinations.length > 0
        ? hallucinations.reduce((a, b) => a + b, 0) / hallucinations.length
        : null,
    progressSteps: buildProgressSteps(fixtures, results, configs),
  };

  const reports: ReportItem[] = [
    {
      id: "paper-outline",
      title: "Research Paper Outline",
      type: "outline",
      description: "Publication structure for open-source SOC model evaluation — 9 sections",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "methodology",
      title: "Evaluation Methodology",
      type: "methodology",
      description: "Ground-truth schema, metrics, batch runner protocol",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "experiment-summary",
      title: "Experiment Summary",
      type: "summary",
      description: `${results.length} runs across ${configs.length} active experiments`,
      updatedAt: results[0]?.recordedAt ?? new Date().toISOString(),
    },
    ...PAPER_SECTIONS.map((section, i) => ({
      id: `section-${i}`,
      title: section.title,
      type: "outline" as const,
      description: section.summary,
      updatedAt: new Date().toISOString(),
    })),
  ];

  return {
    overview,
    coverageMatrix: buildCoverageMatrix(results, configs),
    scenarios,
    experiments,
    results,
    leaderboard: buildLeaderboard(results, configs),
    questions: computeAllResearchFindings(results, configs),
    timeline: buildTimeline(results, configs),
    reports,
    configs,
  };
}
