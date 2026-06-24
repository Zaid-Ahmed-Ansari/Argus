import { cache } from "react";
import {
  CATEGORY_DESCRIPTIONS,
  EXPERIMENT_FAMILIES,
  EXPERIMENT_PROGRESSION,
  PROGRESS_STEPS,
  TELEMETRY_SOURCE_LABELS,
  VARIANT_LABELS,
} from "@/lib/argus-research/catalog";
import {
  computeResearchFindings,
  enrichExperimentFindings,
} from "@/lib/argus-research/findings";
import { loadAggregates, loadSampleIncidents } from "@/lib/argus-research/loaders";
import type {
  ArgusDatasetExplorerData,
  ArgusExperimentsData,
  ArgusQuestionsData,
  ArgusResearchOverviewData,
  ArgusResultsLabData,
  TelemetrySource,
} from "@/lib/argus-research/types";
import { ARGUS_ATTACK_CATEGORIES } from "@/lib/argus-research/types";

function buildClassDistribution(stats: Record<string, number>) {
  return ARGUS_ATTACK_CATEGORIES.map((category) => ({
    category,
    count: stats[category] ?? 0,
  }));
}

function buildSourceCoverage(
  sourceDist: Record<string, number>,
): TelemetrySource[] {
  return Object.entries(sourceDist)
    .map(([id, count]) => ({
      id,
      label: TELEMETRY_SOURCE_LABELS[id] ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

async function getCore() {
  const [aggregates, samples] = await Promise.all([
    loadAggregates(),
    loadSampleIncidents(),
  ]);
  const rawStats = aggregates.datasetStatistics.datasets.raw!;
  const classDistribution = buildClassDistribution(
    rawStats.class_distribution,
  );
  const sourceCoverage = buildSourceCoverage(rawStats.source_distribution);
  const variantStats = (["raw", "condensed", "rag"] as const).map((v) => {
    const d = aggregates.datasetStatistics.datasets[v]!;
    return {
      variant: v,
      label: VARIANT_LABELS[v],
      recordCount: d.record_count,
      averageTokens: d.token_stats.average,
      minTokens: d.token_stats.min,
      maxTokens: d.token_stats.max,
    };
  });
  return { aggregates, samples, classDistribution, sourceCoverage, variantStats };
}

export const getArgusResearchOverview = cache(
  async (): Promise<ArgusResearchOverviewData> => {
    const { aggregates, classDistribution, sourceCoverage, variantStats } =
      await getCore();
    return {
      overview: aggregates.overview,
      classDistribution,
      sourceCoverage,
      variantStats,
      leaderboard: aggregates.leaderboard,
      progressSteps: PROGRESS_STEPS,
      experimentProgression: EXPERIMENT_PROGRESSION,
    };
  },
);

export const getArgusDatasetExplorer = cache(
  async (): Promise<ArgusDatasetExplorerData> => {
    const {
      aggregates,
      samples,
      classDistribution,
      sourceCoverage,
      variantStats,
    } = await getCore();
    return {
      overview: aggregates.overview,
      variantStats,
      classDistribution,
      sourceCoverage,
      categories: ARGUS_ATTACK_CATEGORIES.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        description: CATEGORY_DESCRIPTIONS[name],
        count: 100,
      })),
      samples,
      condensedReductionPct:
        aggregates.datasetStatistics.condensed_reduction_pct,
    };
  },
);

export const getArgusResultsLab = cache(
  async (): Promise<ArgusResultsLabData> => {
    const aggregates = await loadAggregates();
    return {
      leaderboard: aggregates.leaderboard,
      runs: aggregates.runs,
      classLabels: aggregates.classLabels,
    };
  },
);

export const getArgusExperiments = cache(
  async (): Promise<ArgusExperimentsData> => {
    const aggregates = await loadAggregates();
    return {
      families: enrichExperimentFindings(
        EXPERIMENT_FAMILIES,
        aggregates.runs,
      ),
      runs: aggregates.runs,
    };
  },
);

export const getArgusQuestions = cache(async (): Promise<ArgusQuestionsData> => {
  const aggregates = await loadAggregates();
  const questions = computeResearchFindings(aggregates.runs);
  return {
    questions,
    answeredCount: questions.filter((q) => q.status === "answered").length,
    inProgressCount: questions.filter((q) => q.status === "in_progress")
      .length,
  };
});

export const getArgusResearchSnapshot = cache(async () => {
  const [overview, dataset, results, experiments, questions] =
    await Promise.all([
      getArgusResearchOverview(),
      getArgusDatasetExplorer(),
      getArgusResultsLab(),
      getArgusExperiments(),
      getArgusQuestions(),
    ]);
  return { overview, dataset, results, experiments, questions };
});
