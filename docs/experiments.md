# Research Experiments

Argus runs **controlled experiments** on a corpus of **10 labeled attack scenarios**. Results are public at `/experiments`.

## Active experiments

| ID | Name | Category | Variants |
|----|------|----------|----------|
| exp-002 | RAG vs No RAG | RAG | RAG off / hybrid RAG on |
| exp-003 | Raw vs Structured | Input | Raw logs / parsed events |
| exp-004 | Cross-Scenario Benchmark | Scenario | Hybrid RAG across all fixtures |
| exp-005 | RAG × Input Matrix | RAG | 2×2 factorial design |

## Metrics (v2)

| Metric | Description |
|--------|-------------|
| `accuracy` | Composite weighted score |
| `attack_type_accuracy` | Match against labeled attack type |
| `severity_accuracy` | Exact severity enum match |
| `mitre_mapping_accuracy` | Expected technique IDs in output |
| `investigation_quality` | Timeline + keywords + entities |
| `recommendation_quality` | Playbook theme overlap |
| `triage_completeness` | All output fields populated |
| `analyst_utility_score` | Human-proxy composite |
| `hallucination_rate` | Forbidden term hits (lower better) |
| `latency_ms` | Analysis wall-clock time |

Implementation: `src/services/eval/metrics.ts`

## Commands

```bash
npm run experiment:run              # brute_force (default)
npm run experiment:all              # all 10 scenarios × all experiments
npm run experiment:scenario -- brute_force password_spray
npm run experiment:rag              # exp-002 only
```

## Research questions

Primary hypotheses (RQ1–RQ15) are documented on `/experiments` and in `docs/research-roadmap.md`.

Full expansion plan (20+ planned experiments, paper outline): see local `personal-not-to-commit/docs/research-expansion-roadmap.md`.
