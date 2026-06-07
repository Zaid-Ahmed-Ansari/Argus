import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { AnalyzeResponse } from "@/types/api";
import type { ExperimentMetric } from "@/types/experiment";

export type StoredExperimentResult = {
  experimentId: string;
  variant: string;
  metrics: Partial<Record<ExperimentMetric, number>> & { latencyMs?: number };
  prediction: AnalyzeResponse;
  groundTruth?: Record<string, unknown>;
  recordedAt: string;
  userId?: string;
  fixtureId?: string;
  scenario?: string;
  difficulty?: string;
  note?: string;
};

function resultKey(result: StoredExperimentResult): string {
  return [
    result.experimentId,
    result.variant,
    result.fixtureId ?? "",
    result.scenario ?? "",
  ].join("|");
}

async function loadResultsFromDir(
  dir: string,
): Promise<StoredExperimentResult[]> {
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  return Promise.all(
    jsonFiles.map(async (file) => {
      const content = await readFile(path.join(dir, file), "utf-8");
      return JSON.parse(content) as StoredExperimentResult;
    }),
  );
}

/** Loads live results and committed baseline (baseline fills gaps on Vercel). */
export async function loadExperimentResults(): Promise<StoredExperimentResult[]> {
  const root = process.cwd();
  const [live, baseline] = await Promise.all([
    loadResultsFromDir(path.join(root, "experiments", "results")),
    loadResultsFromDir(path.join(root, "experiments", "baseline")),
  ]);

  const merged = new Map<string, StoredExperimentResult>();
  for (const result of [...baseline, ...live]) {
    const key = resultKey(result);
    const existing = merged.get(key);
    if (
      !existing ||
      new Date(result.recordedAt).getTime() >
        new Date(existing.recordedAt).getTime()
    ) {
      merged.set(key, result);
    }
  }

  return [...merged.values()].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
}

export type VariantAggregate = {
  variant: string;
  runs: number;
  accuracy?: number;
  attack_type_accuracy?: number;
  severity_accuracy?: number;
  mitre_mapping_accuracy?: number;
  investigation_quality?: number;
  recommendation_quality?: number;
  triage_completeness?: number;
  analyst_utility_score?: number;
  hallucination_rate?: number;
  relevance?: number;
  latency_ms?: number;
};

function avgMetric(
  runs: StoredExperimentResult[],
  key: ExperimentMetric,
): number | undefined {
  const values = runs
    .map((r) => r.metrics[key])
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return undefined;
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(4));
}

export function aggregateResultsByVariant(
  results: StoredExperimentResult[],
  experimentId: string,
  fixtureId?: string,
): VariantAggregate[] {
  const filtered = results.filter(
    (r) =>
      r.experimentId === experimentId &&
      (fixtureId ? r.fixtureId === fixtureId : true),
  );
  const byVariant = new Map<string, StoredExperimentResult[]>();

  for (const result of filtered) {
    const list = byVariant.get(result.variant) ?? [];
    list.push(result);
    byVariant.set(result.variant, list);
  }

  return [...byVariant.entries()].map(([variant, runs]) => ({
    variant,
    runs: runs.length,
    accuracy: avgMetric(runs, "accuracy"),
    attack_type_accuracy: avgMetric(runs, "attack_type_accuracy"),
    severity_accuracy: avgMetric(runs, "severity_accuracy"),
    mitre_mapping_accuracy: avgMetric(runs, "mitre_mapping_accuracy"),
    investigation_quality: avgMetric(runs, "investigation_quality"),
    recommendation_quality: avgMetric(runs, "recommendation_quality"),
    triage_completeness: avgMetric(runs, "triage_completeness"),
    analyst_utility_score: avgMetric(runs, "analyst_utility_score"),
    hallucination_rate: avgMetric(runs, "hallucination_rate"),
    relevance: avgMetric(runs, "relevance"),
    latency_ms: avgMetric(runs, "latency_ms"),
  }));
}

export type ScenarioAggregate = {
  fixtureId: string;
  scenario?: string;
  difficulty?: string;
  runs: number;
  accuracy?: number;
  analyst_utility_score?: number;
  attack_type_accuracy?: number;
  hallucination_rate?: number;
};

export function aggregateResultsByScenario(
  results: StoredExperimentResult[],
): ScenarioAggregate[] {
  const byFixture = new Map<string, StoredExperimentResult[]>();

  for (const result of results) {
    if (!result.fixtureId) continue;
    const list = byFixture.get(result.fixtureId) ?? [];
    list.push(result);
    byFixture.set(result.fixtureId, list);
  }

  return [...byFixture.entries()]
    .map(([fixtureId, runs]) => ({
      fixtureId,
      scenario: runs[0]?.scenario,
      difficulty: runs[0]?.difficulty,
      runs: runs.length,
      accuracy: avgMetric(runs, "accuracy"),
      analyst_utility_score: avgMetric(runs, "analyst_utility_score"),
      attack_type_accuracy: avgMetric(runs, "attack_type_accuracy"),
      hallucination_rate: avgMetric(runs, "hallucination_rate"),
    }))
    .sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0));
}
