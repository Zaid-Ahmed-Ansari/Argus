# Experiments

Research configs and evaluation results.

## Active configs

| File | Compares |
|------|----------|
| `configs/rag-vs-no-rag.json` | `usedRag: false` vs `true` |
| `configs/raw-vs-structured.json` | `inputFormat: RAW` vs `STRUCTURED` |

## Run

```bash
npm run experiment:run
npm run experiment:rag
```

## View results

- **Public UI:** [http://localhost:3000/experiments](http://localhost:3000/experiments)
- **Files:** `results/*.json` (gitignored)
- **API:** `GET /api/experiments/results` (public)

## Docs

[docs/experiments.md](../docs/experiments.md)
