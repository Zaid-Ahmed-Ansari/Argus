import { analyzeAndPersistIncident } from "@/services/analysis/analyze-incident.service";
import { revalidateIncidentsCache } from "@/lib/incident-cache.server";
import {
  getDatabaseErrorMessage,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { requireSession } from "@/lib/auth-session";
import { MAX_ANALYZE_PER_MINUTE } from "@/lib/constants";
import {
  jsonError,
  jsonServerError,
  jsonServiceUnavailable,
  jsonSuccess,
  jsonTooManyRequests,
  jsonUnauthorized,
} from "@/lib/api-response";
import { analyzeRequestSchema } from "@/lib/validators/analyze";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!session) {
      return jsonUnauthorized();
    }

    const ip = getClientIp(request);
    const limit = rateLimit(
      `analyze:${session.user.id}:${ip}`,
      MAX_ANALYZE_PER_MINUTE,
      60_000,
    );
    if (!limit.allowed) {
      return jsonTooManyRequests("Rate limit exceeded for analysis", limit.resetAt);
    }

    const body: unknown = await request.json();
    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid request body", 400, parsed.error.flatten());
    }

    const result = await analyzeAndPersistIncident({
      logs: parsed.data.logs,
      uploadId: parsed.data.uploadId,
      userId: session.user.id,
      usedRag: parsed.data.usedRag,
    });

    revalidateIncidentsCache(session.user.id);

    return jsonSuccess(result);
  } catch (error) {
    console.error("[POST /api/analyze]", error);

    if (isDatabaseConnectionError(error)) {
      return jsonServiceUnavailable(getDatabaseErrorMessage());
    }

    if (error instanceof Error && error.message.includes("Upload not found")) {
      return jsonError(error.message, 404);
    }

    return jsonServerError("Failed to analyze logs");
  }
}
