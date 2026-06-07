import type { TimelineEvent } from "@/types/api";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "RESOLVED"
  | "ARCHIVED";

export type IncidentSummary = {
  id: string;
  title: string;
  attackType: string | null;
  severity: SeverityLevel;
  summary: string | null;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
};

export type IncidentDetail = IncidentSummary & {
  logFiles: LogFileSummary[];
  latestAnalysis: AnalysisSummary | null;
};

export type LogFileSummary = {
  id: string;
  filename: string | null;
  logType: string;
  lineCount: number | null;
  createdAt: string;
};

export type AnalysisSummary = {
  id: string;
  provider: string;
  usedRag: boolean;
  inputFormat: string;
  attackType: string | null;
  severity: SeverityLevel;
  summary: string;
  timeline: TimelineEvent[];
  recommendations: string[];
  createdAt: string;
};
