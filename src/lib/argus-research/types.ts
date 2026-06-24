export const RESEARCH_DATA_VERSION = 2;

export const ARGUS_ATTACK_CATEGORIES = [
  "Benign Activity",
  "Brute Force",
  "Password Spray",
  "Credential Stuffing",
  "Reconnaissance",
  "Privilege Escalation",
  "Defense Evasion",
  "Malware Execution",
  "Data Exfiltration",
  "Insider Threat",
] as const;

export type ArgusAttackCategory = (typeof ARGUS_ATTACK_CATEGORIES)[number];

export type ArgusDatasetVariant = "raw" | "condensed" | "rag";

export type ArgusModelType = "base" | "lora";

export type ClassificationMetrics = {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  perClassAccuracy: Record<string, number>;
  parseFailureRate: number;
};

export type ConfusionMatrixData = {
  labels: string[];
  matrix: number[][];
};

export type ClassificationRun = {
  id: string;
  label: string;
  modelType: ArgusModelType;
  datasetVariant: ArgusDatasetVariant;
  metrics: ClassificationMetrics;
  confusionMatrix: ConfusionMatrixData;
};

export type LeaderboardRow = {
  model: string;
  dataset: ArgusDatasetVariant;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
};

export type ResearchOverview = {
  totalIncidents: number;
  attackCategories: number;
  trainSamples: number;
  validationSamples: number;
  testSamples: number;
  modelsEvaluated: number;
  bestAccuracy: number;
  bestMacroF1: number;
  bestExperiment: string;
};

export type ProgressStep = {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
  detail: string;
};

export type DatasetVariantStats = {
  variant: ArgusDatasetVariant;
  label: string;
  recordCount: number;
  averageTokens: number;
  minTokens: number;
  maxTokens: number;
};

export type TelemetrySource = {
  id: string;
  label: string;
  count: number;
};

export type IncidentSample = {
  category: string;
  variant: ArgusDatasetVariant;
  scenarioId: string;
  sources: string[];
  sourceCount: number;
  userContentPreview: string;
  label: string;
};

export type ExperimentFamily = {
  id: string;
  name: string;
  description: string;
  experiments: ArgusExperiment[];
};

export type ArgusExperiment = {
  id: string;
  familyId: string;
  name: string;
  goal: string;
  dataset: string;
  model: string;
  methodology: string;
  metrics: string;
  findings: string;
};

export type EnrichedQuestion = {
  id: string;
  question: string;
  status: "answered" | "in_progress" | "open";
  finding: string;
  methodology: string;
};

export type ReportSection = {
  id: string;
  title: string;
  summary: string;
};

export type ArgusResearchOverviewData = {
  overview: ResearchOverview;
  classDistribution: { category: string; count: number }[];
  sourceCoverage: TelemetrySource[];
  variantStats: DatasetVariantStats[];
  leaderboard: LeaderboardRow[];
  progressSteps: ProgressStep[];
  experimentProgression: { stage: string; detail: string }[];
};

export type ArgusDatasetExplorerData = {
  overview: ResearchOverview;
  variantStats: DatasetVariantStats[];
  classDistribution: { category: string; count: number }[];
  sourceCoverage: TelemetrySource[];
  categories: {
    id: string;
    name: string;
    description: string;
    count: number;
  }[];
  samples: IncidentSample[];
  condensedReductionPct: number;
};

export type ArgusResultsLabData = {
  leaderboard: LeaderboardRow[];
  runs: ClassificationRun[];
  classLabels: string[];
};

export type ArgusExperimentsData = {
  families: ExperimentFamily[];
  runs: ClassificationRun[];
};

export type ArgusQuestionsData = {
  questions: EnrichedQuestion[];
  answeredCount: number;
  inProgressCount: number;
};

export type ArgusReportsData = {
  sections: ReportSection[];
};

export type ResearchAggregates = {
  version: number;
  generatedAt: string;
  overview: ResearchOverview;
  leaderboard: LeaderboardRow[];
  runs: ClassificationRun[];
  datasetStatistics: {
    seed: number;
    condensed_reduction_pct: number;
    datasets: Record<
      string,
      {
        dataset: string;
        record_count: number;
        class_distribution: Record<string, number>;
        split_distribution: Record<string, number>;
        token_stats: { average: number; min: number; max: number };
        source_distribution: Record<string, number>;
      }
    >;
  };
  classLabels: string[];
};
