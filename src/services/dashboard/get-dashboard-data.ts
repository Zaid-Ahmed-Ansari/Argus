import { unstable_cache } from "next/cache";
import {
  INCIDENTS_CACHE_SECONDS,
  incidentsCacheTag,
} from "@/lib/incident-cache";
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

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const [incidents, stats, recentAnalyses] = await Promise.all([
    incidentRepository.findMany({ userId, limit: DEFAULT_LIMIT, offset: 0 }),
    incidentRepository.getUserStats(userId),
    analysisRepository.findRecentForUser(userId, 5),
  ]);

  return {
    incidents,
    meta: {
      total: stats.total,
      limit: DEFAULT_LIMIT,
      offset: 0,
      severityCounts: stats.severityCounts,
    },
    recentAnalyses,
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  return unstable_cache(
    () => fetchDashboardData(userId),
    ["dashboard", userId],
    {
      revalidate: INCIDENTS_CACHE_SECONDS,
      tags: [incidentsCacheTag(userId)],
    },
  )();
}
