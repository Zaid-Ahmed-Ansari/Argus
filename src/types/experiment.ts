import type { AnalyzeResponse } from "@/types/api";
import type { AiProviderName, InputFormatType } from "@/types/analysis";

export type ExperimentMetric =
  | "accuracy"
  | "attack_type_accuracy"
  | "severity_accuracy"
  | "mitre_mapping_accuracy"
  | "investigation_quality"
  | "recommendation_quality"
  | "triage_completeness"
  | "analyst_utility_score"
  | "hallucination_rate"
  | "latency_ms"
  | "relevance";

export type ExperimentCategory =
  | "rag"
  | "input"
  | "scenario"
  | "prompt"
  | "model"
  | "knowledge"
  | "agent";

export type ExperimentVariant = {
  provider?: AiProviderName;
  usedRag?: boolean;
  inputFormat?: InputFormatType;
  label?: string;
};

export type ExperimentConfig = {
  id: string;
  name: string;
  description?: string;
  category?: ExperimentCategory;
  variants: ExperimentVariant[];
  metrics: ExperimentMetric[];
};

export type ExperimentResult = {
  experimentId: string;
  variant: string;
  prediction: AnalyzeResponse;
  metrics: Partial<Record<ExperimentMetric, number>>;
  recordedAt: string;
  fixtureId?: string;
};
