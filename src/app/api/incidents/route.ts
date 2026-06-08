import { getIncidentsListData } from "@/services/incidents/get-incidents-list-data";
import {
  getDatabaseErrorMessage,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { requireSession } from "@/lib/auth-session";
import {
  jsonError,
  jsonServerError,
  jsonServiceUnavailable,
  jsonSuccess,
  jsonUnauthorized,
} from "@/lib/api-response";
import { incidentsQuerySchema } from "@/lib/validators/incidents";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!session) {
      return jsonUnauthorized();
    }

    const { searchParams } = new URL(request.url);
    const parsed = incidentsQuerySchema.safeParse({
      severity: searchParams.get("severity") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError("Invalid query parameters", 400, parsed.error.flatten());
    }

    const data = await getIncidentsListData(session.user.id, {
      severity: parsed.data.severity,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
    });

    return jsonSuccess(data);
  } catch (error) {
    console.error("[GET /api/incidents]", error);

    if (isDatabaseConnectionError(error)) {
      return jsonServiceUnavailable(getDatabaseErrorMessage());
    }

    return jsonServerError("Failed to fetch incidents");
  }
}
