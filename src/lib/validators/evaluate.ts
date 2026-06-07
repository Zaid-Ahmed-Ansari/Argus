import { z } from "zod";
import { analyzeResponseSchema } from "@/lib/validators/analyze";

const safeId = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid identifier format");

export const evaluateRequestSchema = z.object({
  experimentId: safeId,
  variant: safeId,
  groundTruth: z.record(z.string(), z.unknown()).optional(),
  prediction: analyzeResponseSchema,
  latencyMs: z.number().int().nonnegative().optional(),
  fixtureId: z.string().optional(),
});
