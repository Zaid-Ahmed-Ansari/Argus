import { logSearchService } from "@/services/search/log-search.service";
import {
  getDatabaseErrorMessage,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { requireSession } from "@/lib/auth-session";
import { MAX_SEARCH_PER_MINUTE } from "@/lib/constants";
import {
  jsonError,
  jsonServerError,
  jsonServiceUnavailable,
  jsonSuccess,
  jsonTooManyRequests,
  jsonUnauthorized,
} from "@/lib/api-response";
import { logSearchQuerySchema } from "@/lib/validators/search";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!session) {
      return jsonUnauthorized();
    }

    const ip = getClientIp(request);
    const limit = rateLimit(
      `search:${session.user.id}:${ip}`,
      MAX_SEARCH_PER_MINUTE,
      60_000,
    );
    if (!limit.allowed) {
      return jsonTooManyRequests("Rate limit exceeded for search", limit.resetAt);
    }

    const { searchParams } = new URL(request.url);
    const parsed = logSearchQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError("Invalid query parameters", 400, parsed.error.flatten());
    }

    const results = await logSearchService.searchLogs(
      parsed.data.q,
      parsed.data.limit,
      session.user.id,
    );

    return jsonSuccess({
      query: parsed.data.q,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("[GET /api/logs/search]", error);

    if (isDatabaseConnectionError(error)) {
      return jsonServiceUnavailable(getDatabaseErrorMessage());
    }

    if (error instanceof Error && error.message.includes("not enabled")) {
      return jsonServiceUnavailable("Log search is not enabled");
    }

    return jsonServerError("Failed to search logs");
  }
}
