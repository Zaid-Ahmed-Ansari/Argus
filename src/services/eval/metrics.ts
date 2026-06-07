import type { AnalyzeResponse } from "@/types/api";
import type { ExperimentMetric } from "@/types/experiment";

export type RequiredEntities = {
  users?: string[];
  ips?: string[];
  hosts?: string[];
};

export type GroundTruthSpec = {
  attackType?: string;
  severity?: string;
  mitreTechniques?: string[];
  requiredKeywords?: string[];
  forbiddenKeywords?: string[];
  minTimelineEvents?: number;
  expectedRecommendationThemes?: string[];
  requiredEntities?: RequiredEntities;
};

export type ComputedMetrics = Partial<Record<ExperimentMetric, number>> & {
  latencyMs?: number;
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsKeyword(haystack: string, keyword: string): boolean {
  return normalize(haystack).includes(normalize(keyword));
}

function scoreAttackType(prediction: string, expected?: string): number {
  if (!expected) return 1;
  const pred = normalize(prediction);
  const exp = normalize(expected);
  if (pred === exp) return 1;
  if (pred.includes(exp) || exp.includes(pred)) return 0.75;
  const tokens = exp.split(/\s+/).filter(Boolean);
  const matched = tokens.filter((t) => pred.includes(t)).length;
  return tokens.length > 0 ? matched / tokens.length : 0;
}

function scoreSeverity(prediction: string, expected?: string): number {
  if (!expected) return 1;
  return normalize(prediction) === normalize(expected) ? 1 : 0;
}

function scoreKeywords(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 1;
  const matched = keywords.filter((k) => containsKeyword(text, k)).length;
  return matched / keywords.length;
}

function scoreRecommendations(
  recommendations: string[],
  themes: string[],
): number {
  if (themes.length === 0) return 1;
  const blob = recommendations.join(" ");
  const matched = themes.filter((t) => containsKeyword(blob, t)).length;
  return matched / themes.length;
}

function scoreMitreMapping(
  blob: string,
  techniques?: string[],
): number {
  if (!techniques || techniques.length === 0) return 1;
  const matched = techniques.filter((t) =>
    containsKeyword(blob, t.toLowerCase()),
  ).length;
  return matched / techniques.length;
}

function scoreEntityRecall(
  blob: string,
  entities?: RequiredEntities,
): number {
  if (!entities) return 1;
  const all = [
    ...(entities.users ?? []),
    ...(entities.ips ?? []),
    ...(entities.hosts ?? []),
  ];
  if (all.length === 0) return 1;
  const matched = all.filter((e) => containsKeyword(blob, e)).length;
  return matched / all.length;
}

function scoreTriageCompleteness(prediction: AnalyzeResponse): number {
  let score = 0;
  if (prediction.attackType?.trim().length > 2) score += 0.25;
  if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(prediction.severity)) {
    score += 0.25;
  }
  if (prediction.summary?.trim().length > 20) score += 0.2;
  if ((prediction.timeline?.length ?? 0) >= 1) score += 0.15;
  if ((prediction.recommendations?.length ?? 0) >= 2) score += 0.15;
  return score;
}

export function computeExperimentMetrics(
  prediction: AnalyzeResponse,
  groundTruth?: GroundTruthSpec,
  latencyMs = 0,
): ComputedMetrics {
  const summaryBlob = [
    prediction.summary,
    prediction.attackType,
    ...prediction.timeline.map((e) => e.event),
    ...prediction.recommendations,
  ].join(" ");

  const attack_type_accuracy = scoreAttackType(
    prediction.attackType,
    groundTruth?.attackType,
  );
  const severity_accuracy = scoreSeverity(
    prediction.severity,
    groundTruth?.severity,
  );
  const keywordScore = scoreKeywords(
    `${prediction.summary} ${prediction.attackType}`,
    groundTruth?.requiredKeywords ?? [],
  );
  const timelineScore =
    (prediction.timeline?.length ?? 0) >= (groundTruth?.minTimelineEvents ?? 1)
      ? 1
      : (prediction.timeline?.length ?? 0) /
        Math.max(groundTruth?.minTimelineEvents ?? 1, 1);
  const recommendation_quality = scoreRecommendations(
    prediction.recommendations,
    groundTruth?.expectedRecommendationThemes ?? [],
  );
  const mitre_mapping_accuracy = scoreMitreMapping(
    summaryBlob,
    groundTruth?.mitreTechniques,
  );
  const entityScore = scoreEntityRecall(
    summaryBlob,
    groundTruth?.requiredEntities,
  );
  const investigation_quality = Number(
    (timelineScore * 0.4 + keywordScore * 0.3 + entityScore * 0.3).toFixed(4),
  );
  const triage_completeness = Number(
    scoreTriageCompleteness(prediction).toFixed(4),
  );

  const accuracy = Number(
    (
      severity_accuracy * 0.2 +
      attack_type_accuracy * 0.2 +
      keywordScore * 0.15 +
      timelineScore * 0.1 +
      recommendation_quality * 0.1 +
      mitre_mapping_accuracy * 0.1 +
      investigation_quality * 0.1 +
      triage_completeness * 0.05
    ).toFixed(4),
  );

  const forbidden = groundTruth?.forbiddenKeywords ?? [];
  const hallucinationHits = forbidden.filter((k) =>
    containsKeyword(summaryBlob, k),
  ).length;
  const hallucination_rate =
    forbidden.length > 0 ? hallucinationHits / forbidden.length : 0;

  const relevance = Number(
    (keywordScore * 0.4 + recommendation_quality * 0.3 + attack_type_accuracy * 0.3).toFixed(4),
  );

  const analyst_utility_score = Number(
    (
      accuracy * 0.3 +
      investigation_quality * 0.25 +
      recommendation_quality * 0.25 +
      (1 - hallucination_rate) * 0.2
    ).toFixed(4),
  );

  return {
    accuracy,
    attack_type_accuracy: Number(attack_type_accuracy.toFixed(4)),
    severity_accuracy: Number(severity_accuracy.toFixed(4)),
    mitre_mapping_accuracy: Number(mitre_mapping_accuracy.toFixed(4)),
    investigation_quality,
    recommendation_quality: Number(recommendation_quality.toFixed(4)),
    triage_completeness,
    analyst_utility_score,
    hallucination_rate: Number(hallucination_rate.toFixed(4)),
    relevance,
    latency_ms: latencyMs,
    latencyMs,
  };
}
