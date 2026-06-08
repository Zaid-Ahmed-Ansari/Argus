import { unstable_cache } from "next/cache";
import type { Severity } from "@/generated/prisma/client";
import {
  INCIDENTS_CACHE_SECONDS,
  incidentsCacheTag,
} from "@/lib/incident-cache";
import { incidentRepository } from "@/services/repositories/incident.repository";
import type { IncidentSummary } from "@/types/incident";

export type IncidentsListData = {
  incidents: IncidentSummary[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type IncidentsListOptions = {
  severity?: Severity;
  limit?: number;
  offset?: number;
};

async function fetchIncidentsListData(
  userId: string,
  options: IncidentsListOptions = {},
): Promise<IncidentsListData> {
  const limit = options.limit ?? 6;
  const offset = options.offset ?? 0;
  const severity = options.severity;

  const incidentsPromise = incidentRepository.findMany({
    userId,
    severity,
    limit,
    offset,
  });

  if (severity) {
    const [incidents, total] = await Promise.all([
      incidentsPromise,
      incidentRepository.count({ userId, severity }),
    ]);

    return { incidents, meta: { total, limit, offset } };
  }

  const [incidents, stats] = await Promise.all([
    incidentsPromise,
    incidentRepository.getUserStats(userId),
  ]);

  return {
    incidents,
    meta: { total: stats.total, limit, offset },
  };
}

export async function getIncidentsListData(
  userId: string,
  options: IncidentsListOptions = {},
): Promise<IncidentsListData> {
  const limit = options.limit ?? 6;
  const offset = options.offset ?? 0;
  const severityKey = options.severity ?? "ALL";

  return unstable_cache(
    () => fetchIncidentsListData(userId, options),
    ["incidents-list", userId, severityKey, String(limit), String(offset)],
    {
      revalidate: INCIDENTS_CACHE_SECONDS,
      tags: [incidentsCacheTag(userId)],
    },
  )();
}
