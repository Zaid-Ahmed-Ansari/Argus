# Research & Experiments

## 1. Dual purpose of Argus

Argus is both:

1. **Production-style analyst tool** — auth, uploads, persistent incidents, investigation UI
2. **Research instrument** — labeled datasets, batch runner, public metrics dashboard at `/research`

---

## 2. Evaluation corpus

### Structure

```
datasets/
  brute_force/
    sample.log
    ground-truth.json
  password_spray/
    ...
  eval/
    fixtures-index.json   # version 2 index of all 10 scenarios
```

### Ground truth schema (`GroundTruthSpec`)

```typescript
{
  attackType: string           // e.g. "Brute Force"
  severity: string             // e.g. "HIGH"
  mitreTechniques: string[]    // e.g. ["T1110.001"]
  requiredKeywords: string[]   // must appear in output
  forbiddenKeywords: string[]  // hallucination detection
  minTimelineEvents: number
  expectedRecommendationThemes: string[]  // e.g. "block", "MFA"
  requiredEntities: {
    users?: string[]
    ips?: string[]
    hosts?: string[]
  }
}
```

---

## 3. Active experiments

| ID | Name | Design | Research question |
|----|------|--------|-------------------|
| **exp-002** | RAG vs No RAG | 2 variants: hybrid RAG on/off | RQ1 — Does RAG improve triage accuracy? |
| **exp-003** | Raw vs Structured | 2 variants: RAW vs STRUCTURED input | RQ2 — Does structured parsing help? |
| **exp-004** | Cross-Scenario Benchmark | Hybrid RAG × all 10 scenarios | RQ4 — Performance across attack types |
| **exp-005** | RAG × Input Matrix | 2×2 factorial: RAG × input format | RQ7 — Additive gains from RAG + structure |

Config files: `experiments/configs/exp-00*.json`

---

## 4. Research questions (RQ1–RQ15)

Defined in `src/lib/research-catalog.ts` and `src/lib/research-findings.ts`.

### Examples

| RQ | Question |
|----|----------|
| RQ1 | Does hybrid RAG improve triage accuracy over no-RAG baseline? |
| RQ2 | Does structured log parsing outperform raw log input? |
| RQ3 | How does accuracy vary by scenario difficulty (easy/medium/hard)? |
| RQ4 | Which attack types are hardest for the LLM to classify? |
| RQ5 | Do hard scenarios produce higher hallucination rates? |
| RQ6 | What is the latency cost of hybrid RAG vs FTS-only? |
| RQ7 | Does RAG + structured input show additive accuracy gains? |
| RQ8 | How reliable is MITRE technique mapping from sparse log evidence? |
| RQ9 | Do recommendation themes align with SOC playbook expectations? |
| RQ10 | What is analyst utility score across the full benchmark? |

(Full list in research catalog — 15 total spanning accuracy, latency, hallucination, MITRE, and utility.)

---

## 5. Evaluation metrics

**File:** `src/services/eval/metrics.ts`

### Per-metric definitions

| Metric | How computed |
|--------|--------------|
| `attack_type_accuracy` | Exact match=1.0; substring=0.75; else token overlap ratio |
| `severity_accuracy` | Binary: predicted severity === ground truth |
| `mitre_mapping_accuracy` | Fraction of expected technique IDs found in output blob |
| `keywordScore` | Matched required keywords / total required |
| `timelineScore` | 1.0 if events ≥ minTimelineEvents; else ratio |
| `recommendation_quality` | Theme keyword overlap in recommendations |
| `investigation_quality` | `0.4×timeline + 0.3×keywords + 0.3×entity_recall` |
| `triage_completeness` | Checklist: attackType, severity, summary, timeline, recommendations |
| `hallucination_rate` | Forbidden keyword hits / total forbidden (lower = better) |
| `latency_ms` | Wall-clock from orchestrator |

### Composite scores

**Accuracy (weighted):**
```
0.20×severity + 0.20×attack_type + 0.15×keywords + 0.10×timeline
+ 0.10×recommendations + 0.10×mitre + 0.10×investigation + 0.05×triage
```

**Analyst utility:**
```
0.30×accuracy + 0.25×investigation_quality + 0.25×recommendation_quality + 0.20×(1 - hallucination_rate)
```

---

## 6. Experiment runner

**Script:** `scripts/run-experiment.ts`

```
Load experiment config
    ↓
For each fixture in config:
    Load sample.log + ground-truth.json
    Run analysisOrchestrator with variant settings (RAG on/off, input format)
    computeExperimentMetrics(prediction, groundTruth, latencyMs)
    ↓
Write JSON results to experiments/results/
```

### Baseline results

Committed to `experiments/baseline/` so `/research` dashboard works on Vercel without re-running experiments (ephemeral filesystem).

**Commands:**
- `npm run experiment:run` — single experiment
- `npm run experiment:all` — all fixtures
- `npm run experiment:rag` — exp-002 specifically
- `npm run experiment:baseline` — export baseline JSON

---

## 7. Reproducibility controls

| Control | Value |
|---------|-------|
| Temperature | 0.15 (fixed) |
| Prompt version | `soc-v3-hybrid-rag` (stored per Analysis) |
| Ground truth | Versioned JSON fixtures |
| Fixture index | `fixtures-index.json` version 2 |
| Model | Documented in experiment config |

### Non-determinism caveat

LLM outputs vary slightly between runs even at low temperature. Report **averages over multiple runs** for rigorous publication; Argus baselines are single-run snapshots.

---

## 8. Public research UI

| Route | Content |
|-------|---------|
| `/research` | Command center — scenarios, metrics overview |
| `/research/questions` | RQ1–RQ15 with linked experiments |
| `/research/results` | Charts, leaderboard, baseline numbers |
| `/research/datasets` | Corpus documentation |
| `/research/experiments` | Experiment configs and status |
| `/research/reports` | Generated reports |

---

## 9. Scenario difficulty distribution

| Difficulty | Scenarios |
|------------|-----------|
| easy | brute_force, password_spray |
| medium | credential_stuffing, privilege_escalation, suspicious_admin, web_shell |
| hard | lateral_movement, account_takeover, data_exfiltration, insider_threat |

**RQ3/RQ5** analyze accuracy and hallucination by difficulty tier.

---

## 10. Key file paths

| Topic | Path |
|-------|------|
| Metrics | `src/services/eval/metrics.ts` |
| Ground truth loader | `src/services/eval/ground-truth.ts` |
| Experiment runner | `scripts/run-experiment.ts` |
| Configs | `experiments/configs/` |
| Baselines | `experiments/baseline/` |
| Research catalog | `src/lib/research-catalog.ts` |
| Research findings | `src/lib/research-findings.ts` |
| Datasets | `datasets/` |
