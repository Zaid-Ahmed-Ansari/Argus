import type { AnalyzeResponse, TimelineEvent } from "@/types/api";
import type { AnalysisContext, SeverityLevel } from "@/types/analysis";

export interface AiAnalysisService {
  analyzeLogs(logs: string, context?: AnalysisContext): Promise<AnalyzeResponse>;
  generateTimeline(
    logs: string,
    context?: AnalysisContext,
  ): Promise<TimelineEvent[]>;
  classifySeverity(
    summary: string,
    context?: AnalysisContext,
  ): Promise<SeverityLevel>;
  generateRecommendations(
    analysis: Pick<AnalyzeResponse, "attackType" | "severity" | "summary">,
    context?: AnalysisContext,
  ): Promise<string[]>;
}
