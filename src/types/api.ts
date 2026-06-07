export type AnalyzeRequest = {
  logs: string;
};

export type TimelineEvent = {
  timestamp: string;
  event: string;
  source?: string;
};

export type AnalyzeResponse = {
  attackType: string;
  severity: string;
  summary: string;
  timeline: TimelineEvent[];
  recommendations: string[];
};

export type EvaluateRequest = {
  experimentId: string;
  variant: string;
  groundTruth?: Record<string, unknown>;
  prediction: AnalyzeResponse;
};

export type EvaluateResponse = {
  experimentId: string;
  variant: string;
  metrics: {
    accuracy?: number;
    hallucinationRate?: number;
    latencyMs?: number;
    relevance?: number;
  };
  recordedAt: string;
};

export type ApiError = {
  error: string;
  details?: unknown;
};
