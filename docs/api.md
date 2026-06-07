# API Reference

Base URL: `http://localhost:3000` (development)

## Authentication

Most routes require a Better Auth session cookie. Public routes:

- `GET /api/experiments/results`
- `GET /api/auth/*`

---

## POST /api/analyze

Analyze logs and create an incident. **Requires auth.**

**Body**

```json
{
  "logs": "string (paste mode)",
  "uploadId": "string (file mode)",
  "usedRag": false
}
```

**Response** `200` — `AnalyzeResponse` + `incidentId`

---

## GET /api/incidents

List incidents for the signed-in user. **Requires auth.**

---

## GET /api/incidents/:id

Incident detail. **Requires auth.**

---

## GET /api/logs/search

Full-text search across stored logs. **Requires auth.**

Query: `?q=failed+password&limit=20`

---

## POST /api/evaluate

Score a prediction against ground truth and save to `experiments/results/`. **Requires auth.**

**Body**

```json
{
  "experimentId": "exp-002-rag-vs-no-rag",
  "variant": "with-rag",
  "prediction": { "attackType": "...", "severity": "HIGH", "summary": "...", "timeline": [], "recommendations": [] },
  "groundTruth": { "attackType": "Brute Force", "severity": "HIGH" },
  "latencyMs": 12000
}
```

---

## GET /api/experiments/results

**Public.** Returns aggregated experiment metrics for the dashboard.

**Response** `200`

```json
{
  "results": [],
  "aggregates": [
    {
      "experimentId": "exp-002-rag-vs-no-rag",
      "name": "RAG vs No RAG",
      "variants": [{ "variant": "with-rag", "runs": 2, "accuracy": 0.64 }],
      "totalRuns": 4
    }
  ],
  "total": 4
}
```

Powers the public `/experiments` page.

---

## Rate limits

Applied per user + IP on analyze, upload, search, and evaluate endpoints.
