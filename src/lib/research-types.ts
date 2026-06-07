import type { ExperimentVariant } from "@/types/experiment";
import type { GroundTruthSpec } from "@/services/eval/metrics";
import type { CoverageAxis } from "@/lib/research-constants";

export type CoverageCell = {
  scenarioId: string;
  axis: CoverageAxis;
  score: number | null;
  runs: number;
};

export type ProgressStep = {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
  detail: string;
};

export type EnrichedScenario = {
  id: string;
  name: string;
  description: string;
  mitre: string[];
  severity: string;
  difficulty: string;
  logLines: number;
  sources: string;
  sampleLog: string;
  groundTruth: GroundTruthSpec;
  runCount: number;
  bestAccuracy: number | null;
};

export type EnrichedExperiment = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "planned";
  researchQuestion: string;
  runs: number;
  bestAccuracy: number | null;
  bestVariant: string | null;
  variants: ExperimentVariant[];
  metrics: string[];
};

export type LeaderboardRow = {
  id: string;
  model: string;
  experiment: string;
  variant: string;
  scenario: string;
  accuracy: number;
  hallucinationRate: number;
  latencyMs: number;
  relevance: number;
  recordedAt: string;
};

export type QuestionStatus = "answered" | "in_progress" | "open";

export type EnrichedQuestion = {
  id: string;
  question: string;
  status: QuestionStatus;
  finding: string | null;
  experiments: string[];
  evidenceRuns: number;
};

export type TimelineEntry = {
  id: string;
  recordedAt: string;
  experimentId: string;
  experimentName: string;
  variant: string;
  scenario: string;
  accuracy: number;
};

export type ReportItem = {
  id: string;
  title: string;
  type: "outline" | "summary" | "methodology";
  description: string;
  updatedAt: string;
};

export type ResearchGraphData = {
  scenarios: { id: string; name: string }[];
  experiments: { id: string; name: string }[];
  resultCount: number;
  answeredCount: number;
};

export type ResearchOverview = {
  totalScenarios: number;
  totalExperiments: number;
  activeExperiments: number;
  totalRuns: number;
  bestAccuracy: number | null;
  avgHallucination: number | null;
  progressSteps: ProgressStep[];
};
