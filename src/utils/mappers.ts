import type {
  Analysis as PrismaAnalysis,
  Incident as PrismaIncident,
  LogFile as PrismaLogFile,
} from "@/generated/prisma/client";
import type { TimelineEvent } from "@/types/api";
import type {
  AnalysisSummary,
  IncidentDetail,
  IncidentSummary,
  LogFileSummary,
} from "@/types/incident";

function parseTimeline(value: unknown): TimelineEvent[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is TimelineEvent =>
      typeof item === "object" &&
      item !== null &&
      "timestamp" in item &&
      "event" in item,
  ) as TimelineEvent[];
}

function parseRecommendations(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function mapIncident(incident: PrismaIncident): IncidentSummary {
  return {
    id: incident.id,
    title: incident.title,
    attackType: incident.attackType,
    severity: incident.severity,
    summary: incident.summary,
    status: incident.status,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
  };
}

export function mapLogFile(logFile: PrismaLogFile): LogFileSummary {
  return {
    id: logFile.id,
    filename: logFile.filename,
    logType: logFile.logType,
    lineCount: logFile.lineCount,
    createdAt: logFile.createdAt.toISOString(),
  };
}

export function mapAnalysis(analysis: PrismaAnalysis): AnalysisSummary {
  return {
    id: analysis.id,
    provider: analysis.provider,
    usedRag: analysis.usedRag,
    inputFormat: analysis.inputFormat,
    attackType: analysis.attackType,
    severity: analysis.severity,
    summary: analysis.summary,
    timeline: parseTimeline(analysis.timeline),
    recommendations: parseRecommendations(analysis.recommendations),
    createdAt: analysis.createdAt.toISOString(),
  };
}

export function mapIncidentDetail(
  incident: PrismaIncident & {
    logFiles: PrismaLogFile[];
    analyses: PrismaAnalysis[];
  },
): IncidentDetail {
  const latestAnalysis = incident.analyses[0]
    ? mapAnalysis(incident.analyses[0])
    : null;

  return {
    ...mapIncident(incident),
    logFiles: incident.logFiles.map(mapLogFile),
    latestAnalysis,
  };
}
