import type { SeverityLevel } from "@/types/incident";

export type InvestigationSeverity = SeverityLevel;

export type CommandCenterMetrics = {
  totalIncidents: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  confidence: number;
  logsProcessed: number;
  processingTimeMs: number;
};

export type DetectedIncident = {
  id: string;
  title: string;
  attackType: string;
  severity: InvestigationSeverity;
  confidence: number;
  description: string;
  mitreTechniques: string[];
  evidence: string[];
  affectedUsers: string[];
  sourceIps: string[];
};

export type AttackChainStage = {
  id: string;
  name: string;
  order: number;
  description: string;
};

export type MitreTechnique = {
  id: string;
  name: string;
  description: string;
  confidence: number;
  relatedEventIds: string[];
};

export type StagedTimelineEvent = {
  id: string;
  timestamp: string;
  event: string;
  source?: string;
  stageId: string;
};

export type TimelineStage = {
  id: string;
  name: string;
  events: StagedTimelineEvent[];
};

export type RootCauseFinding = {
  id: string;
  finding: string;
};

export type TieredRecommendations = {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
};

export type AnalysisMetadata = {
  model: string;
  knowledgeSources: string[];
  logsProcessed: number;
  incidentsDetected: number;
  confidence: number;
  analysisTimeMs: number;
  promptVersion: string;
  provider: string;
  usedRag: boolean;
};

export type ResearchInsight = {
  id: string;
  title: string;
  finding: string;
};

export type InvestigationReport = {
  id: string;
  title: string;
  status: string;
  generatedAt: string;
  commandCenter: CommandCenterMetrics;
  detectedIncidents: DetectedIncident[];
  attackChain: AttackChainStage[];
  mitreTechniques: MitreTechnique[];
  timelineStages: TimelineStage[];
  rootCauseFindings: RootCauseFinding[];
  recommendations: TieredRecommendations;
  metadata: AnalysisMetadata;
  researchInsights: ResearchInsight[];
};

export type InvestigationNavSection = {
  id: string;
  label: string;
};

export const INVESTIGATION_NAV_SECTIONS: InvestigationNavSection[] = [
  { id: "summary", label: "Summary" },
  { id: "incidents", label: "Incidents" },
  { id: "attack-chain", label: "Attack Chain" },
  { id: "mitre", label: "MITRE" },
  { id: "timeline", label: "Timeline" },
  { id: "root-cause", label: "Root Cause" },
  { id: "recommendations", label: "Recommendations" },
  { id: "metadata", label: "Metadata" },
  { id: "research", label: "Research" },
];
