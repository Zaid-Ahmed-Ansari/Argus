import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const ROOT = path.join(process.cwd(), "research", "argus-v2");

const leaderboardRowSchema = z.object({
  model: z.string(),
  dataset: z.enum(["raw", "condensed", "rag"]),
  accuracy: z.number(),
  precision: z.number(),
  recall: z.number(),
  f1: z.number(),
});

const aggregatesSchema = z.object({
  version: z.number(),
  overview: z.object({
    totalIncidents: z.literal(1000),
    attackCategories: z.literal(10),
    modelsEvaluated: z.number().min(6),
    bestAccuracy: z.number(),
    bestMacroF1: z.number(),
  }),
  leaderboard: z.array(leaderboardRowSchema).min(6),
  runs: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        metrics: z.object({
          accuracy: z.number(),
          f1: z.number(),
          perClassAccuracy: z.record(z.string(), z.number()),
        }),
        confusionMatrix: z.object({
          labels: z.array(z.string()).length(10),
          matrix: z.array(z.array(z.number()).length(10)).length(10),
        }),
      }),
    )
    .min(6),
});

async function validate() {
  const aggPath = path.join(ROOT, "aggregates.json");
  const raw = await readFile(aggPath, "utf8");
  const data = JSON.parse(raw);
  aggregatesSchema.parse(data);
  console.log("research data validation passed");
}

validate().catch((err) => {
  console.error("research data validation failed:", err);
  process.exit(1);
});
