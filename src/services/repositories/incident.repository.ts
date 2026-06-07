import type { Severity } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { mapIncident, mapIncidentDetail } from "@/utils/mappers";
import type { IncidentDetail, IncidentSummary } from "@/types/incident";

export type FindIncidentsOptions = {
  userId: string;
  severity?: Severity;
  limit?: number;
  offset?: number;
};

export class IncidentRepository {
  async findMany(options: FindIncidentsOptions): Promise<IncidentSummary[]> {
    const { userId, severity, limit = 20, offset = 0 } = options;

    const incidents = await prisma.incident.findMany({
      where: {
        userId,
        ...(severity ? { severity } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return incidents.map(mapIncident);
  }

  async findById(id: string, userId: string): Promise<IncidentDetail | null> {
    const incident = await prisma.incident.findFirst({
      where: { id, userId },
      include: {
        logFiles: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            filename: true,
            logType: true,
            lineCount: true,
            createdAt: true,
          },
        },
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            provider: true,
            usedRag: true,
            inputFormat: true,
            attackType: true,
            severity: true,
            summary: true,
            timeline: true,
            recommendations: true,
            createdAt: true,
          },
        },
      },
    });

    if (!incident) return null;
    return mapIncidentDetail(incident as Parameters<typeof mapIncidentDetail>[0]);
  }

  async count(
    options: Pick<FindIncidentsOptions, "userId" | "severity">,
  ): Promise<number> {
    return prisma.incident.count({
      where: {
        userId: options.userId,
        ...(options.severity ? { severity: options.severity } : {}),
      },
    });
  }

  async countBySeverity(userId: string): Promise<Record<Severity, number>> {
    const groups = await prisma.incident.groupBy({
      by: ["severity"],
      where: { userId },
      _count: { severity: true },
    });

    const result: Record<Severity, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    for (const group of groups) {
      result[group.severity] = group._count.severity;
    }

    return result;
  }
}

export const incidentRepository = new IncidentRepository();
