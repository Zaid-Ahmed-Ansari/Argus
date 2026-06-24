# RAG (Retrieval-Augmented Generation) in Argus

## 1. What is RAG and why use it?

**Retrieval-Augmented Generation (RAG)** combines:

1. **Retrieval** — fetch relevant documents from a knowledge base
2. **Generation** — LLM produces output using retrieved context + user input

### Why RAG for SOC analysis?

- LLMs **hallucinate** MITRE technique IDs and playbook steps without grounding
- SOC knowledge (MITRE ATT&CK, runbooks) is **too large** to fit in every prompt
- RAG injects only the **top-K relevant chunks** at query time

### Argus RAG knowledge sources

| Source file | Content |
|-------------|---------|
| `mitre-brute-force.json` | T1110 technique family |
| `mitre-credential-access.json` | Credential access tactics |
| `soc-ssh-investigation.json` | SSH investigation playbook |
| `soc-password-spray.json` | Password spray playbook |

Ingested into `KnowledgeDocument` → chunked into `DocumentChunk` rows.

---

## 2. End-to-end RAG flow

```
Raw logs uploaded
    ↓
buildRagQuery(logs) — extract keywords or first 200 chars
    ↓
getKnowledgeRetriever(mode) — fts | vector | hybrid
    ↓
Top-K chunks retrieved (default K=5)
    ↓
Formatted as [source] title\ncontent, joined (max 8000 chars)
    ↓
Injected into prompt inside <context> tags
    ↓
Gemini generates JSON analysis
```

**Toggle:** `usedRag` flag on each `Analysis` record; `RAG_RETRIEVER_MODE` env var.

---

## 3. Three retrieval modes

| Mode | Env value | How it works |
|------|-----------|--------------|
| **FTS only** | `fts` | PostgreSQL full-text search on chunk `search_vector` |
| **Vector only** | `vector` | Gemini embeddings + cosine similarity in application code |
| **Hybrid** | `hybrid` (default) | Run FTS + vector in parallel, fuse with RRF |

Factory: `src/services/rag/retriever-factory.ts`

---

## 4. Full-Text Search (FTS) retrieval

### PostgreSQL components

- **Column:** `DocumentChunk.search_vector` (type `tsvector`)
- **Index:** GIN index for fast `@@` matching
- **Trigger:** Auto-updates `search_vector` on insert/update via `to_tsvector('english', content)`
- **Query:** `plainto_tsquery('english', $query)` — converts natural language to AND-query
- **Ranking:** `ts_rank(search_vector, query)` — relevance score

### Strengths

- Exact match on MITRE IDs (`T1110.001`), technique names, keywords
- Fast with GIN index
- No API cost

### Weaknesses

- Misses semantic paraphrases ("password guessing" vs "brute force attempt")
- English stemmer may not match security jargon perfectly

**Implementation:** `src/services/rag/fts-knowledge-retriever.ts`

---

## 5. Vector retrieval

### Embedding provider

- **Model:** `gemini-embedding-001` (configurable via `GEMINI_EMBEDDING_MODEL`)
- **Dimensions:** 768
- **Batch size:** 16 chunks per API call

### Storage

- Embeddings stored as **JSONB array** on `DocumentChunk.embedding`
- **Not using pgvector extension** — deliberate portability choice for Supabase/local Postgres

### Retrieval algorithm

1. Embed the query via Gemini Embeddings API
2. Load up to **200 chunks** that have non-null embeddings
3. Compute **cosine similarity** in Node.js for each
4. Sort descending, return top-K

### Strengths

- Captures semantic similarity (paraphrased playbook language)
- Works when exact keywords don't appear in query

### Weaknesses

- API latency and cost per query
- In-memory scan over 200 chunks (doesn't scale to millions without pgvector/ANN index)

**Implementation:** `src/services/rag/vector-knowledge-retriever.ts`, `src/services/rag/gemini-embedding.provider.ts`

---

## 6. Hybrid retrieval + Reciprocal Rank Fusion (RRF)

### Why hybrid?

| FTS good at | Vector good at |
|-------------|----------------|
| `T1110.001` exact ID | "repeated login failures from one IP" |
| "brute force" keyword | Paraphrased playbook steps |

### RRF formula

For each chunk appearing in ranked lists from retrievers 1…n:

```
RRF_score(d) = Σ  1 / (k + rank_i(d))
```

- `k = 60` (`RRF_RANK_CONSTANT`) — standard constant from literature; dampens high ranks
- `rank_i` = 1-based position in retriever i's list
- Chunks in **both** lists get **summed** scores → naturally boosted

### Fusion steps in Argus

1. Run FTS and vector retrieval in parallel (`Promise.all`)
2. If one list empty, return the other
3. Fuse with `fuseRankedLists()`, sort by RRF score, take top-K

**Implementation:** `src/services/rag/hybrid-knowledge-retriever.ts`

---

## 7. Chunking strategy

| Parameter | Value |
|-----------|-------|
| Chunk size | 800 characters |
| Overlap | 100 characters |

### Sliding window

```
chunk[0] = text[0 : 800]
next start = 800 - 100 = 700
chunk[1] = text[700 : 1500]
...
```

**Why overlap?** Prevents sentences/technique definitions from being split across chunk boundaries, losing retrieval quality.

**Implementation:** `src/services/rag/knowledge-ingestion.service.ts`

---

## 8. Knowledge ingestion pipeline

```
JSON knowledge file
    ↓
Upsert KnowledgeDocument (by source + title)
    ↓
Delete old chunks, re-chunk content
    ↓
Insert DocumentChunk rows with chunkIndex
    ↓
FTS trigger populates search_vector
    ↓
embedAllMissingChunks() — Gemini batch embed → JSONB
```

**Commands:**

- `npm run db:seed:knowledge` — ingest JSON files
- `npm run db:embed` — backfill embeddings

---

## 9. RAG query construction

From `analysis-orchestrator.ts`:

1. Scan logs for keywords: `failed`, `password`, `brute`, `admin`, `attack`, `login`
2. If any match → join matched keywords as retrieval query
3. Else → use first **200 characters** of log text

This keeps the retrieval query focused on attack-relevant terms rather than sending entire logs to the retriever.

---

## 10. Context injection limits

- Top-K = **5** chunks
- Total injected context capped at **8000 characters**
- Format per chunk: `[source] title\ncontent`

Prevents prompt overflow and controls Gemini token cost.

---

## 11. Design patterns (for viva)

| Pattern | Where |
|---------|-------|
| **Strategy** | `Retriever` interface — swap FTS/vector/hybrid |
| **Factory** | `getKnowledgeRetriever(mode)` |
| **Null object** | `NullRetriever` when RAG disabled |
| **Dependency injection** | Orchestrator receives retriever via factory |

Interfaces: `src/lib/rag/retriever.interface.ts`, `embedding.interface.ts`, `knowledge-store.interface.ts`

---

## 12. Trade-offs to defend

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| JSONB not pgvector | Works on any Postgres; no extension management | O(n) cosine scan, max ~200 chunks |
| Hybrid default | Best accuracy in experiments | 2× retrieval cost vs FTS-only |
| 800-char chunks | Fits embedding model context | May split long MITRE sections |
| English FTS config | Standard Postgres | Non-English logs less searchable |

---

## 13. Key file paths

| Component | Path |
|-----------|------|
| Hybrid retriever | `src/services/rag/hybrid-knowledge-retriever.ts` |
| FTS retriever | `src/services/rag/fts-knowledge-retriever.ts` |
| Vector retriever | `src/services/rag/vector-knowledge-retriever.ts` |
| Retriever factory | `src/services/rag/retriever-factory.ts` |
| Ingestion | `src/services/rag/knowledge-ingestion.service.ts` |
| Embeddings | `src/services/rag/chunk-embedding.service.ts` |
| Constants | `src/lib/constants.ts` (`RAG_TOP_K`, `RRF_RANK_CONSTANT`) |
| Orchestrator RAG hook | `src/services/ai/analysis-orchestrator.ts` |
