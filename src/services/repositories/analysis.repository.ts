import type {
  AiProvider,
  InputFormat,
  Severity,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { mapAnalysis } from "@/utils/mappers";
import type { TimelineEvent } from "@/types/api";
import type { AnalysisSummary } from "@/types/incident";

export type CreateAnalysisInput = {
  incidentId: string;
  provider?: AiProvider;
  usedRag?: boolean;
  inputFormat?: InputFormat;
  attackType?: string;
  severity: Severity;
  summary: string;
  timeline: TimelineEvent[];
  recommendations: string[];
  modelVersion?: string;
  promptVersion?: string;
  latencyMs?: number;
  tokenCount?: number;
  rawResponse?: unknown;
};

export class AnalysisRepository {
  async create(input: CreateAnalysisInput): Promise<AnalysisSummary> {
    const analysis = await prisma.analysis.create({
      data: {
        incidentId: input.incidentId,
        provider: input.provider ?? "GEMINI",
        usedRag: input.usedRag ?? false,
        inputFormat: input.inputFormat ?? "RAW",
        attackType: input.attackType,
        severity: input.severity,
        summary: input.summary,
        timeline: input.timeline,
        recommendations: input.recommendations,
        modelVersion: input.modelVersion,
        promptVersion: input.promptVersion,
        latencyMs: input.latencyMs,
        tokenCount: input.tokenCount,
        rawResponse: input.rawResponse as object | undefined,
      },
    });

    return mapAnalysis(analysis);
  }

  async findLatestByIncident(incidentId: string): Promise<AnalysisSummary | null> {
    const analysis = await prisma.analysis.findFirst({
      where: { incidentId },
      orderBy: { createdAt: "desc" },
    });

    return analysis ? mapAnalysis(analysis) : null;
  }

  async findRecentForUser(
    userId: string,
    limit = 10,
    options?: { includeDetails?: boolean },
  ): Promise<AnalysisSummary[]> {
    const includeDetails = options?.includeDetails ?? false;

    const analyses = await prisma.analysis.findMany({
      where: { incident: { userId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: includeDetails
        ? {
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
          }
        : {
            id: true,
            provider: true,
            severity: true,
            summary: true,
            createdAt: true,
          },
    });

    return analyses.map((row) =>
      mapAnalysis(row as Parameters<typeof mapAnalysis>[0]),
    );
  }
}

export const analysisRepository = new AnalysisRepository();
