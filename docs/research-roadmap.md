# Argus Research Roadmap

Public research documentation for Argus. Full expansion plan lives locally in `personal-not-to-commit/docs/research-expansion-roadmap.md`.

## Active research corpus

- **10 labeled scenarios** under `datasets/` (brute force through insider threat)
- **4 experiment configs** under `experiments/configs/`
- **8 evaluation metrics** in `src/services/eval/metrics.ts`
- **Public results** at `/experiments`

## Quick commands

```bash
npm run experiment:run          # default scenario
npm run experiment:all          # all 10 scenarios × all experiments
npm run experiment:rag          # RAG vs no-RAG only
```

## Research questions (primary)

1. Does hybrid RAG improve SOC triage accuracy across attack types?
2. Do structured events outperform raw logs for classification?
3. Can LLMs map incidents to MITRE ATT&CK from sparse evidence?
4. How do hallucination rates vary by scenario difficulty?
5. Are playbook-aligned recommendations reproducible under ground-truth eval?

See [experiments.md](experiments.md) for methodology and metric definitions.
