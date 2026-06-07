import { jsonSuccess } from "@/lib/api-response";
import {
  aggregateResultsByVariant,
  loadExperimentResults,
} from "@/lib/experiment-results";
import { loadExperimentConfigs } from "@/lib/experiments";

export const runtime = "nodejs";

/** Public read-only endpoint for research dashboard. */
export async function GET() {
  const [results, configs] = await Promise.all([
    loadExperimentResults(),
    loadExperimentConfigs(),
  ]);

  const aggregates = configs.map((config) => ({
    experimentId: config.id,
    name: config.name,
    description: config.description,
    variants: aggregateResultsByVariant(results, config.id),
    totalRuns: results.filter((r) => r.experimentId === config.id).length,
  }));

  return jsonSuccess({
    results: results.slice(0, 50),
    aggregates,
    total: results.length,
  });
}
