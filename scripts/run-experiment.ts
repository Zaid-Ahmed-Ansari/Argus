import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadExperimentConfigs } from "../src/lib/experiments";
import { analysisOrchestrator } from "../src/services/ai/analysis-orchestrator";
import {
  DEFAULT_FIXTURE_ID,
  getFixtureIds,
  isValidFixtureId,
  loadAllEvalFixtures,
  loadEvalFixture,
  loadEvalLogs,
  type EvalFixture,
} from "../src/services/eval/ground-truth";
import {
  computeExperimentMetrics,
  type GroundTruthSpec,
} from "../src/services/eval/metrics";
import type { ExperimentVariant } from "../src/types/experiment";

function variantToSlug(variant: ExperimentVariant, index: number): string {
  return (
    variant.label?.toLowerCase().replace(/\s+/g, "-") ??
    `variant-${index + 1}`
  );
}

function parseArgs(argv: string[]) {
  const fixtures: string[] = [];
  let allFixtures = false;
  let experimentFilter: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    if (arg === "--all-fixtures" || arg === "--all") {
      allFixtures = true;
    } else if (arg === "--fixture" || arg === "--scenario") {
      const next = argv[i + 1];
      if (next) {
        fixtures.push(next);
        i++;
      }
    } else if (!arg.startsWith("-")) {
      experimentFilter = arg;
    }
  }

  return { fixtures, allFixtures, experimentFilter };
}

async function resolveFixtures(
  fixtureArgs: string[],
  allFixtures: boolean,
): Promise<EvalFixture[]> {
  if (allFixtures) return loadAllEvalFixtures();
  if (fixtureArgs.length > 0) {
    for (const id of fixtureArgs) {
      if (!isValidFixtureId(id)) {
        throw new Error(
          `Unknown fixture "${id}". Valid: ${getFixtureIds().join(", ")}`,
        );
      }
    }
    return Promise.all(fixtureArgs.map((id) => loadEvalFixture(id)));
  }
  return [await loadEvalFixture(DEFAULT_FIXTURE_ID)];
}

async function runVariant(
  experimentId: string,
  variant: ExperimentVariant,
  variantSlug: string,
  logs: string,
  groundTruth: GroundTruthSpec,
  fixture: EvalFixture,
) {
  const start = Date.now();
  const { response, metadata } = await analysisOrchestrator.analyzeLogsWithMeta(
    logs,
    {
      provider: variant.provider,
      usedRag: variant.usedRag,
      inputFormat: variant.inputFormat ?? "RAW",
    },
  );
  const latencyMs = metadata.latencyMs ?? Date.now() - start;

  const metrics = computeExperimentMetrics(response, groundTruth, latencyMs);
  const recordedAt = new Date().toISOString();

  const payload = {
    experimentId,
    variant: variantSlug,
    metrics,
    prediction: response,
    groundTruth,
    recordedAt,
    fixtureId: fixture.fixtureId,
    scenario: fixture.scenario,
    difficulty: fixture.difficulty,
    note: "Batch run via scripts/run-experiment.ts",
  };

  const resultsDir = path.join(process.cwd(), "experiments", "results");
  await mkdir(resultsDir, { recursive: true });
  const filename = `${experimentId}-${fixture.fixtureId}-${variantSlug}-${Date.now()}.json`;
  await writeFile(path.join(resultsDir, filename), JSON.stringify(payload, null, 2));

  console.log(
    `  ✓ [${fixture.fixtureId}] ${variantSlug}: accuracy=${((metrics.accuracy ?? 0) * 100).toFixed(1)}% utility=${((metrics.analyst_utility_score ?? 0) * 100).toFixed(1)}%`,
  );
}

async function main() {
  const { fixtures, allFixtures, experimentFilter } = parseArgs(
    process.argv.slice(2),
  );
  const evalFixtures = await resolveFixtures(fixtures, allFixtures);
  const configs = await loadExperimentConfigs();
  const selected = experimentFilter
    ? configs.filter((c) => c.id.includes(experimentFilter))
    : configs;

  if (selected.length === 0) {
    console.error(`No experiments matched filter: ${experimentFilter ?? "(none)"}`);
    process.exit(1);
  }

  console.log(
    `Running ${selected.length} experiment(s) on ${evalFixtures.length} scenario(s)\n`,
  );

  for (const config of selected) {
    console.log(`${config.name} (${config.id})`);
    for (const fixture of evalFixtures) {
      const logs = await loadEvalLogs(fixture);
      for (const [index, variant] of config.variants.entries()) {
        const slug = variantToSlug(variant, index);
        try {
          await runVariant(
            config.id,
            variant,
            slug,
            logs,
            fixture.groundTruth,
            fixture,
          );
        } catch (error) {
          console.error(
            `  ✗ [${fixture.fixtureId}] ${slug}: ${error instanceof Error ? error.message : "failed"}`,
          );
        }
      }
    }
    console.log("");
  }

  console.log("Done. View results at /experiments");
}

main().catch((error: unknown) => {
  console.error("Experiment run failed:", error);
  process.exit(1);
});
