import { unstable_cache } from "next/cache";
import { BASE_MODEL, LORA_CONFIG, RESEARCH_POSITIONING } from "@/lib/argus-research/catalog";
import {
  RESEARCH_CACHE_SECONDS,
  RESEARCH_CACHE_TAG,
} from "@/lib/argus-research/cache";
import { loadAggregates } from "@/lib/argus-research/loaders";
import { computeResearchFindings } from "@/lib/argus-research/findings";
import { RESEARCH_DATA_VERSION } from "@/lib/argus-research/types";

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

async function generateReport(): Promise<string> {
  const aggregates = await loadAggregates();
  const questions = computeResearchFindings(aggregates.runs);

  const leaderboardTable = aggregates.leaderboard
    .map(
      (r) =>
        `| ${r.model} | ${r.dataset} | ${pct(r.accuracy)} | ${pct(r.precision)} | ${pct(r.recall)} | ${pct(r.f1)} |`,
    )
    .join("\n");

  const rqSection = questions
    .map((q) => `### ${q.id}\n**${q.question}**\n\n${q.finding}\n`)
    .join("\n");

  return `# ARGUS Research Report

## Abstract

${RESEARCH_POSITIONING} This report documents the ARGUS-1000 dataset (1000 synthetic SOC incidents, 10 attack categories), three dataset representations (raw, condensed, RAG-enhanced), and evaluation of ${BASE_MODEL} with and without LoRA fine-tuning (${LORA_CONFIG}).

## Introduction

Security Operations Centers face alert fatigue and manual log triage bottlenecks. Large language models offer automated incident classification, but require careful dataset engineering, retrieval grounding, and parameter-efficient fine-tuning for production viability.

## Problem Statement

Given multi-source security telemetry, automatically classify each incident into one of ten attack categories with measurable accuracy, precision, recall, and F1 — suitable for SOC triage assistance.

## Dataset Construction

- **Total incidents:** 1,000 (balanced: 100 per class)
- **Splits:** 800 train / 100 validation / 100 test
- **Variants:** Raw logs (~964 avg tokens), Condensed events (~96 tokens, 90.1% reduction), RAG enhanced (~136 tokens)
- **Sources:** SSH, Sysmon, Firewall, VPN, Web logs, CloudTrail, M365, Windows Events, and more
- **Seed:** 42 (reproducible stratified split)

## Methodology

1. Synthetic incident generation with multi-source telemetry
2. Three input representations per incident
3. Zero-shot base model evaluation (Qwen3-4B 4-bit)
4. LoRA supervised fine-tuning per dataset variant
5. Classification into structured JSON \`{"attack_type":"..."}\`
6. Evaluation on 50-sample balanced test set (5 per class)

## Experimental Setup

| Configuration | Model | Dataset |
|---------------|-------|---------|
${aggregates.runs.map((r) => `| ${r.label} | ${r.modelType === "lora" ? "LoRA" : "Base"} Qwen3-4B | ${r.datasetVariant} |`).join("\n")}

## Model Architecture

- **Base:** ${BASE_MODEL}
- **Fine-tuning:** LoRA (${LORA_CONFIG})
- **Output:** Single-field JSON attack type classification

## Evaluation Metrics

Accuracy, Precision, Recall, F1 (macro), per-class accuracy, confusion matrix, parse failure rate.

## Results

### Leaderboard

| Model | Dataset | Accuracy | Precision | Recall | F1 |
|-------|---------|----------|-----------|--------|-----|
${leaderboardTable}

**Best configuration:** ${aggregates.overview.bestExperiment} (F1 ${pct(aggregates.overview.bestMacroF1)})

## Research Questions

${rqSection}

## Discussion

RAG-enhanced input provides the largest gain for the base model (74% → 100% accuracy). Condensed events offer a strong efficiency trade-off. LoRA fine-tuning on condensed/RAG data achieves perfect test accuracy on this benchmark. Raw telemetry causes parse failures when the model emits verbose prose instead of JSON.

## Limitations

- Synthetic incidents (not real enterprise SIEM data)
- Test set: 50 samples (5 per class) — high variance possible
- Single base model family (Qwen3-4B)
- Binary single-label classification (no multi-label MITRE mapping)

## Future Work

- Real-world SIEM integration and domain adaptation
- Larger open-source models and multi-GPU training
- Multi-label MITRE ATT&CK technique mapping
- Human-in-the-loop evaluation with SOC analysts
- Production deployment with latency and cost benchmarks

## References

- MITRE ATT&CK Framework
- Hu et al., LoRA: Low-Rank Adaptation of Large Language Models
- Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
- Qwen3 Technical Report (Alibaba Cloud)
`;
}

export const getFullResearchReport = unstable_cache(
  generateReport,
  ["argus-research-full-report", String(RESEARCH_DATA_VERSION)],
  {
    revalidate: RESEARCH_CACHE_SECONDS,
    tags: [RESEARCH_CACHE_TAG],
  },
);
