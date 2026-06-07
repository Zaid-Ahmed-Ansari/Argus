import type { AnalyzeResponse, TimelineEvent } from "@/types/api";

export type AiProviderName = "GEMINI" | "OPENAI";

export type InputFormatType = "RAW" | "STRUCTURED";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AnalysisContext = {
  provider?: AiProviderName;
  usedRag?: boolean;
  inputFormat?: InputFormatType;
  incidentId?: string;
};

export type AnalysisResult = AnalyzeResponse & {
  provider: AiProviderName;
  usedRag: boolean;
  inputFormat: InputFormatType;
};

export type AnalysisMetadata = {
  provider: AiProviderName;
  modelVersion?: string;
  promptVersion: string;
  tokenCount?: number;
  latencyMs: number;
  rawResponse?: unknown;
  usedRag?: boolean;
};

export type AnalyzeLogsResult = {
  response: AnalyzeResponse;
  metadata: AnalysisMetadata;
};

export type AnalysisInput = {
  logs: string;
  context?: AnalysisContext;
};

export type TimelineResult = {
  events: TimelineEvent[];
};

export type SeverityClassification = {
  severity: SeverityLevel;
  confidence?: number;
};

export type RecommendationResult = {
  recommendations: string[];
};
