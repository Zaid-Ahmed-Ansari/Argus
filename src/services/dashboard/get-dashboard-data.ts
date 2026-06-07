import { analysisRepository } from "@/services/repositories/analysis.repository";
import { incidentRepository } from "@/services/repositories/incident.repository";
import type { AnalysisSummary, IncidentSummary } from "@/types/incident";

export type DashboardData = {
  incidents: IncidentSummary[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    severityCounts: Record<string, number>;
  };
  recentAnalyses: AnalysisSummary[];
};

const DEFAULT_LIMIT = 20;

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [incidents, total, severityCounts, recentAnalyses] = await Promise.all([
    incidentRepository.findMany({ userId, limit: DEFAULT_LIMIT, offset: 0 }),
    incidentRepository.count({ userId }),
    incidentRepository.countBySeverity(userId),
    analysisRepository.findRecentForUser(userId, 5),
  ]);

  return {
    incidents,
    meta: {
      total,
      limit: DEFAULT_LIMIT,
      offset: 0,
      severityCounts,
    },
    recentAnalyses,
  };
}
