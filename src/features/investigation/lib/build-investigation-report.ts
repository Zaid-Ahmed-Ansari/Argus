import { MOCK_INVESTIGATION_REPORT } from "@/features/investigation/data/mock-investigation-report";
import type { AnalysisSummary } from "@/types/incident";
import type {
  InvestigationReport,
  TieredRecommendations,
} from "@/types/investigation";

type BuildInvestigationInput = {
  incidentId: string;
  title: string;
  status: string;
  analysis: AnalysisSummary | null;
  logLineCount?: number;
};

function tierRecommendations(flat: string[]): TieredRecommendations {
  if (flat.length === 0) {
    return { immediate: [], shortTerm: [], longTerm: [] };
  }
  const third = Math.max(1, Math.ceil(flat.length / 3));
  return {
    immediate: flat.slice(0, third),
    shortTerm: flat.slice(third, third * 2),
    longTerm: flat.slice(third * 2),
  };
}

/**
 * Builds an investigation report for the SOC workspace.
 * Today: enriches mock multi-incident structure with real DB analysis fields.
 * Future: replace mock body when analyze API returns structured incidents.
 */
export function buildInvestigationReport(
  input: BuildInvestigationInput,
): InvestigationReport {
  const base = structuredClone(MOCK_INVESTIGATION_REPORT);

  base.id = input.incidentId;
  base.title = input.title;
  base.status = input.status;

  if (!input.analysis) {
    return base;
  }

  const { analysis } = input;
  base.generatedAt = analysis.createdAt;

  if (analysis.summary && base.detectedIncidents[0]) {
    const primary = base.detectedIncidents[0];
    base.detectedIncidents[0] = {
      ...primary,
      title: analysis.attackType ?? primary.title,
      attackType: analysis.attackType ?? primary.attackType,
      severity: analysis.severity,
      description: analysis.summary,
    };
  }

  if (analysis.timeline.length > 0 && base.timelineStages[0]) {
    const stage = base.timelineStages[0];
    stage.events = analysis.timeline.map((evt, i) => ({
      id: `real-evt-${i}`,
      timestamp: evt.timestamp,
      event: evt.event,
      source: evt.source,
      stageId: stage.id,
    }));
  }

  if (analysis.recommendations.length > 0) {
    base.recommendations = tierRecommendations(analysis.recommendations);
  }

  const logsProcessed =
    input.logLineCount ?? base.metadata.logsProcessed;

  base.metadata = {
    ...base.metadata,
    model: analysis.provider === "gemini" ? "gemini-2.5-flash" : analysis.provider,
    provider: analysis.provider,
    usedRag: analysis.usedRag,
    logsProcessed,
    confidence: base.commandCenter.confidence,
  };

  base.commandCenter.logsProcessed = logsProcessed;

  return base;
}
