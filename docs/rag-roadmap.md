# RAG Roadmap

## Phase 4 — Retrieval-augmented analysis

### Knowledge sources (planned)

- MITRE ATT&CK techniques and mitigations
- OWASP Top 10 summaries
- Internal SOC playbooks
- Sigma rule descriptions

### Architecture

```text
User logs + query
    → Retriever.retrieve(query)
        → KnowledgeStore (pgvector + FTS hybrid)
    → Prompt builder (context + logs)
    → LlmProvider.complete()
    → Analysis persisted with usedRag=true
```

### Interfaces (implemented, stubs)

| Interface | Location |
|-----------|----------|
| `Retriever` | `src/lib/rag/retriever.interface.ts` |
| `EmbeddingProvider` | `src/lib/rag/embedding.interface.ts` |
| `KnowledgeStore` | `src/lib/rag/knowledge-store.interface.ts` |

`NullRetriever` is used when `usedRag === false`.

### Embeddings (Phase 4b — implemented)

- `DocumentChunk.embedding` stored as **JSONB** (portable; no pgvector extension required on dev Postgres)
- Model: `gemini-embedding-001` via `GeminiEmbeddingProvider`
- Retriever modes: `RAG_RETRIEVER_MODE=fts|vector|hybrid` (default: `hybrid`)

```bash
npm run db:seed:knowledge
npm run db:embed
```

### Ingestion pipeline (planned)

1. Parse MITRE STIX / markdown playbooks
2. Chunk with overlap (512 tokens, 64 overlap)
3. Embed via `EmbeddingProvider`
4. Upsert into `KnowledgeStore`

### Evaluation

Compare `usedRag: true` vs `false` using Experiment 2 config and `/api/evaluate` metrics.
