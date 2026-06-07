# Argus Architecture

## Overview

Argus is a unified **Next.js 16** application using the App Router for both frontend and backend. All server logic runs in **Route Handlers** (`src/app/api`). There is no separate Python or FastAPI service.

## Layer diagram

```text
┌─────────────────────────────────────────────────────────┐
│  Presentation (src/app, src/components, src/features)   │
├─────────────────────────────────────────────────────────┤
│  API Routes (thin — validate, delegate, respond)        │
├─────────────────────────────────────────────────────────┤
│  Services (AI abstractions, repositories, search)       │
├─────────────────────────────────────────────────────────┤
│  Prisma ORM → PostgreSQL                                │
└─────────────────────────────────────────────────────────┘
```

## SOLID mapping


| Principle | Implementation                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------ |
| **SRP**   | Repositories own persistence; `AiAnalysisService` owns analysis orchestration; routes only handle HTTP |
| **OCP**   | New LLM providers implement `LlmProvider`; swap via `getProvider()`                                    |
| **LSP**   | `GeminiProvider` / `OpenAiProvider` are substitutable `LlmProvider` implementations                    |
| **ISP**   | `AiAnalysisService` exposes focused methods (`analyzeLogs`, `generateTimeline`, …)                     |
| **DIP**   | Routes depend on `analysisOrchestrator` and repositories, not concrete SDKs                            |


## Feature modules


| Module                     | Responsibility                    |
| -------------------------- | --------------------------------- |
| `features/incidents`       | Incident list, cards, severity UI |
| `features/logs`            | Upload form, log preview          |
| `features/analysis`        | Summary and attack type display   |
| `features/timeline`        | Timeline visualization            |
| `features/recommendations` | Investigation steps list          |
| `features/experiments`     | Research experiment UI            |


## AI provider abstraction

```text
Route Handler
    → AnalysisOrchestrator (AiAnalysisService)
        → LlmProvider (Gemini)
        → Retriever (hybrid RAG when usedRag: true)
```

Without `GEMINI_API_KEY`, `AnalysisOrchestrator` returns a placeholder response.

## RAG (implemented)

```text
usedRag: true
  → buildRagQuery(logs)
  → getKnowledgeRetriever()  // fts | vector | hybrid (env)
  → top-K MITRE/playbook chunks in prompt
  → LlmProvider.complete()
```

- `FtsKnowledgeRetriever` — PostgreSQL FTS on `DocumentChunk`
- `VectorKnowledgeRetriever` — cosine similarity on JSONB embeddings
- `HybridKnowledgeRetriever` — reciprocal rank fusion
- `GeminiEmbeddingProvider` — `gemini-embedding-001`

## Search

PostgreSQL full-text search on `LogFile.content` and knowledge `DocumentChunk.search_vector`.

## Experiments

Batch runner: `scripts/run-experiment.ts`  
Metrics: `src/services/eval/metrics.ts`  
Results: `experiments/results/` + public `/experiments` page (no auth)

See [experiments.md](experiments.md).

## Extension points

1. **New provider** — add `src/services/ai/providers/*.provider.ts`, register in `provider-factory.ts`
2. **New experiment axis** — extend `Analysis` model fields + experiment config JSON
3. **New log type** — extend `LogType` enum in Prisma schema

