import type { Severity } from "@/generated/prisma/client";
import { incidentRepository } from "@/services/repositories/incident.repository";
import type { IncidentSummary } from "@/types/incident";

export type IncidentsListData = {
  incidents: IncidentSummary[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    severityCounts: Record<string, number>;
  };
};

export type IncidentsListOptions = {
  severity?: Severity;
  limit?: number;
  offset?: number;
};

export async function getIncidentsListData(
  userId: string,
  options: IncidentsListOptions = {},
): Promise<IncidentsListData> {
  const limit = options.limit ?? 6;
  const offset = options.offset ?? 0;
  const severity = options.severity;

  const [incidents, total, severityCounts] = await Promise.all([
    incidentRepository.findMany({ userId, severity, limit, offset }),
    incidentRepository.count({ userId, severity }),
    incidentRepository.countBySeverity(userId),
  ]);

  return {
    incidents,
    meta: {
      total,
      limit,
      offset,
      severityCounts,
    },
  };
}
