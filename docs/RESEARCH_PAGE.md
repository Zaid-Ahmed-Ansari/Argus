# Argus Research Lab — Page Guide

**URL:** https://argus-gules.vercel.app/research  
**Purpose:** Public research platform for **AI-powered SOC incident classification** — ARGUS-1000 dataset, Qwen3-4B evaluation, LoRA fine-tuning, and reproducible classification benchmarks.

The research section is **separate from the analyst app** (Dashboard / Incidents / Upload). It does not require sign-in.

---

## What the research lab is for

Argus is built as two things at once:

1. **Analyst tool** — upload logs, get AI triage, investigate incidents  
2. **Research instrument** — measure LLM classification accuracy on a labeled 1000-incident corpus with train/val/test splits

The research pages answer: *"How well does Qwen3-4B classify SOC incidents across raw, condensed, and RAG-enhanced inputs — with and without LoRA fine-tuning?"*

**Phase 1 legacy work** (10 SSH scenarios, Gemini baseline) is preserved at `/research/legacy`.

---

## Navigation map

| Route | Name | What you see |
|-------|------|--------------|
| `/research` | **Command center** | KPIs, class distribution, experiment progression, leaderboard |
| `/research/datasets` | **Dataset explorer** | ARGUS-1000 stats, variants, samples per attack category |
| `/research/experiments` | **Experiment workbench** | Families A–C (representation, model, output structure) |
| `/research/results` | **Results laboratory** | Leaderboard, confusion matrices, per-class charts |
| `/research/questions` | **Research questions** | RQ1–RQ8 with computed findings |
| `/research/legacy` | **Phase 1 appendix** | Original Gemini 10-scenario evaluation |

---

## Data pipeline

```
Argus Qwen training/Argus Model Train/   (source, not committed)
        ↓
npm run research:prepare
        ↓
research/argus-v2/aggregates.json + samples/
        ↓
getArgusResearchOverview() / getArgusResultsLab() / …
        ↓
all /research/* pages (24h ISR cache)
```

**Runtime reads only `aggregates.json` (~50KB)** — never ships full JSONL or per-response arrays to the client.

### Prepare research data locally

```bash
npm run research:extract-samples   # 30 sample incidents from JSONL
npm run research:build-aggregates
npm run research:validate
npm run research:prepare           # all of the above
```

---

## `/research` — Command center

Loads tiered snapshot via `getArgusResearchOverview()`.

### Top metrics

| Metric | Meaning |
|--------|---------|
| **Incidents** | Total ARGUS-1000 records (1000) |
| **Attack categories** | Multi-class labels (10) |
| **Models evaluated** | Base + LoRA configurations (6 runs) |
| **Best accuracy** | Highest test accuracy across runs |
| **Best macro F1** | Highest macro F1 across runs |

### Sections

1. **Research trajectory** — ARGUS dataset → base eval → LoRA → benchmark  
2. **Class distribution** — balanced 100 incidents per category  
3. **Experiment progression** — Raw → Condensed → RAG → LoRA  
4. **Leaderboard** — six model×dataset configurations  

---

## `/research/datasets` — Dataset explorer

Browse **ARGUS-1000**: 1000 synthetic multi-source SOC incidents.

### Three dataset variants

| Variant | Avg tokens | Description |
|---------|------------|-------------|
| **Raw** | ~964 | Full multi-source telemetry |
| **Condensed** | ~96 | ~90% token reduction |
| **RAG** | ~136 | Condensed + retrieved security knowledge |

### Ten attack categories

Benign Activity, Brute Force, Password Spray, Credential Stuffing, Reconnaissance, Privilege Escalation, Defense Evasion, Malware Execution, Data Exfiltration, Insider Threat.

Use `?id=brute-force` to pre-select a category.

---

## `/research/experiments` — Experiment workbench

Three experiment families:

| Family | Focus |
|--------|-------|
| **A — Dataset Representation** | Raw vs Condensed vs RAG |
| **B — Model Comparison** | Base Qwen3-4B vs LoRA fine-tuned |
| **C — Prompting & Output** | JSON parse reliability, cross-variant consistency |

Detail pages at `/research/experiments/[id]` show goal, methodology, metrics, and linked evaluation runs.

---

## `/research/results` — Results laboratory

Interactive classification results:

- **CSV leaderboard** — sortable accuracy, precision, recall, F1  
- **Confusion matrix heatmap** — rendered from JSON (no static PNGs)  
- **Per-class accuracy charts** — Base vs LoRA, Raw vs Condensed vs RAG  
- **Dynamic chart loading** — `next/dynamic` for Recharts bundle  

Filter by run with `?model=Base RAG`.

### Key results (test split)

| Configuration | Accuracy | F1 |
|---------------|----------|-----|
| Base Raw | 74% | 74% |
| Base Condensed | 100% | 100% |
| Base RAG | 100% | 100% |
| LoRA Raw | 74% | 74% |
| LoRA Condensed | 100% | 100% |
| LoRA RAG | 100% | 100% |

---

## `/research/questions` — Research questions (RQ1–RQ8)

| ID | Question |
|----|----------|
| **RQ1** | Does RAG improve cybersecurity incident classification? |
| **RQ2** | Do condensed events outperform raw logs? |
| **RQ3** | How effective is LoRA fine-tuning for SOC triage? |
| **RQ4** | Which attack classes are easiest to classify? |
| **RQ5** | Which attack classes remain challenging? |
| **RQ6** | How much does structured output improve reliability? |
| **RQ7** | Can compact models achieve production-ready SOC performance? |
| **RQ8** | How does retrieval affect classification accuracy? |

Findings are computed in `src/lib/argus-research/findings.ts` from `evaluation_results.json`.

---

## `/research/legacy` — Phase 1 appendix

Preserves the original Gemini-focused 10-scenario SSH evaluation (`getResearchSnapshot()` from `experiments/baseline/`). Not the primary research narrative — use for historical comparison only.

---

## Related files in the codebase

| Area | Path |
|------|------|
| V2 types & constants | `src/lib/argus-research/types.ts` |
| Catalog (RQ1–8, families, copy) | `src/lib/argus-research/catalog.ts` |
| Tiered snapshot getters | `src/lib/argus-research/snapshot.ts` |
| Findings computation | `src/lib/argus-research/findings.ts` |
| Runtime aggregates | `research/argus-v2/aggregates.json` |
| Sample incidents | `research/argus-v2/samples/` |
| Prepare scripts | `scripts/build-research-aggregates.ts`, etc. |
| Legacy snapshot (Phase 1) | `src/lib/research-snapshot.ts` |

---

## One-paragraph explanation (for your mentor)

> The research section is Argus's classification benchmark dashboard. We built ARGUS-1000 — 1000 synthetic SOC incidents across 10 attack categories with raw, condensed, and RAG-enhanced representations — and evaluated Qwen3-4B (4-bit) with and without LoRA fine-tuning. The UI at `/research` visualizes leaderboard results, confusion matrices, per-class metrics, and eight research hypotheses with computed findings. Early Gemini baseline work on 10 SSH scenarios is preserved at `/research/legacy`.
