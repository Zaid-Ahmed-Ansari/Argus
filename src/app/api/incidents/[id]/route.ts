import { incidentRepository } from "@/services/repositories/incident.repository";
import {
  getDatabaseErrorMessage,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { requireSession } from "@/lib/auth-session";
import {
  jsonError,
  jsonNotFound,
  jsonServerError,
  jsonServiceUnavailable,
  jsonSuccess,
  jsonUnauthorized,
} from "@/lib/api-response";
import { incidentIdSchema } from "@/lib/validators/incidents";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    if (!session) {
      return jsonUnauthorized();
    }

    const { id } = await context.params;
    const idParsed = incidentIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError("Invalid incident ID", 400);
    }

    const incident = await incidentRepository.findById(
      idParsed.data,
      session.user.id,
    );

    if (!incident) {
      return jsonNotFound("Incident not found");
    }

    return jsonSuccess(incident);
  } catch (error) {
    console.error("[GET /api/incidents/[id]]", error);

    if (isDatabaseConnectionError(error)) {
      return jsonServiceUnavailable(getDatabaseErrorMessage());
    }

    return jsonServerError("Failed to fetch incident");
  }
}
