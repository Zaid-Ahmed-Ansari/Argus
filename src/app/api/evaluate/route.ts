import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { requireSession } from "@/lib/auth-session";
import { MAX_EVALUATE_PER_MINUTE } from "@/lib/constants";
import {
  jsonError,
  jsonServerError,
  jsonSuccess,
  jsonTooManyRequests,
  jsonUnauthorized,
} from "@/lib/api-response";
import { evaluateRequestSchema } from "@/lib/validators/evaluate";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  computeExperimentMetrics,
  type GroundTruthSpec,
} from "@/services/eval/metrics";
import type { EvaluateResponse } from "@/types/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!session) {
      return jsonUnauthorized();
    }

    const ip = getClientIp(request);
    const limit = rateLimit(
      `evaluate:${session.user.id}:${ip}`,
      MAX_EVALUATE_PER_MINUTE,
      60_000,
    );
    if (!limit.allowed) {
      return jsonTooManyRequests("Rate limit exceeded", limit.resetAt);
    }

    const body: unknown = await request.json();
    const parsed = evaluateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid request body", 400, parsed.error.flatten());
    }

    const { experimentId, variant, prediction, groundTruth, latencyMs } =
      parsed.data;
    const recordedAt = new Date().toISOString();

    const metrics = computeExperimentMetrics(
      prediction,
      groundTruth as GroundTruthSpec | undefined,
      latencyMs ?? 0,
    );

    const response: EvaluateResponse = {
      experimentId,
      variant,
      metrics: {
        accuracy: metrics.accuracy,
        hallucinationRate: metrics.hallucination_rate,
        latencyMs: metrics.latencyMs,
        relevance: metrics.relevance,
      },
      recordedAt,
    };

    const resultsDir = path.join(process.cwd(), "experiments", "results");
    await mkdir(resultsDir, { recursive: true });

    const safeName = path.basename(`${experimentId}-${variant}-${Date.now()}.json`);
    const filepath = path.join(resultsDir, safeName);

    await writeFile(
      filepath,
      JSON.stringify(
        {
          ...response,
          metrics,
          prediction,
          groundTruth,
          userId: session.user.id,
        },
        null,
        2,
      ),
      "utf-8",
    );

    return jsonSuccess(response);
  } catch (error) {
    console.error("[POST /api/evaluate]", error);
    return jsonServerError("Failed to record evaluation");
  }
}
