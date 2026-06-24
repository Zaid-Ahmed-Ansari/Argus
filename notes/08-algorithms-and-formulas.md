# Algorithms & Formulas Reference

Quick reference for mentor questions involving math, SQL, or ranking algorithms.

---

## 1. PostgreSQL Full-Text Search

### Document vectorization

```sql
to_tsvector('english', content)
-- 'Failed password for admin' → 'fail':1 'password':2 'admin':3
```

### Query parsing

```sql
plainto_tsquery('english', 'failed password admin')
-- → 'fail' & 'password' & 'admin'
```

### Match operator

```sql
WHERE search_vector @@ plainto_tsquery('english', $query)
```

### Relevance ranking

```sql
ts_rank(search_vector, plainto_tsquery('english', $query)) AS rank
ORDER BY rank DESC
```

Higher `ts_rank` = more relevant (considers term frequency and document length normalization).

### Snippet generation (log search UI)

```sql
ts_headline(
  'english',
  content,
  plainto_tsquery('english', $query),
  'MaxWords=24, MinWords=12, ShortWord=3'
)
```

Highlights matching terms in context for display.

---

## 2. Cosine similarity (vector retrieval)

For query vector **q** and chunk vector **c** (both length 768):

```
cosine_sim(q, c) = (q · c) / (||q|| × ||c||)

where:
  q · c = Σᵢ qᵢ × cᵢ        (dot product)
  ||q|| = √(Σᵢ qᵢ²)          (L2 norm)
```

- Range: **-1 to 1** (for normalized embeddings, typically 0 to 1)
- **1.0** = identical direction (most similar)
- Computed in Node.js over up to 200 chunks, sorted descending

---

## 3. Reciprocal Rank Fusion (RRF)

Used in hybrid RAG to merge FTS and vector ranked lists without normalizing their scores.

```
RRF_score(d) = Σᵢ  1 / (k + rankᵢ(d))
```

| Symbol | Meaning |
|--------|---------|
| d | Document/chunk ID |
| i | Retriever index (1=FTS, 2=vector) |
| rankᵢ(d) | 1-based rank of d in retriever i's list (0 if not in list) |
| k | **60** (`RRF_RANK_CONSTANT`) |

### Example

Chunk A: rank 1 in FTS, rank 3 in vector
```
RRF(A) = 1/(60+1) + 1/(60+3) = 0.01639 + 0.01587 = 0.03226
```

Chunk B: rank 2 in FTS only
```
RRF(B) = 1/(60+2) = 0.01613
```

Chunk A wins. Chunks appearing in **both** lists accumulate score.

### Why k=60?

From original RRF paper (Cormack et al.) — dampens the advantage of rank-1 vs rank-2, giving lower-ranked but dual-listed items a chance.

---

## 4. Chunking (sliding window)

```
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100

start = 0
while start < len(text):
    chunk = text[start : start + 800]
    start = start + 800 - 100  // advance by 700
```

Number of chunks for text length L:
```
n ≈ ceil((L - 800) / 700) + 1   (when L > 800)
```

---

## 5. Evaluation metric formulas

### Attack type accuracy

```
if pred == expected:     return 1.0
if substring match:       return 0.75
else:                    return matched_tokens / total_tokens
```

### Severity accuracy

```
return pred == expected ? 1.0 : 0.0
```

### Keyword score

```
matched_required_keywords / total_required_keywords
```

### Timeline score

```
events >= minTimelineEvents ? 1.0 : events / minTimelineEvents
```

### MITRE mapping accuracy

```
techniques_found_in_output / total_expected_techniques
```

### Entity recall

```
matched_entities / total_required_entities
(users + ips + hosts from ground truth)
```

### Investigation quality

```
0.4 × timeline_score + 0.3 × keyword_score + 0.3 × entity_recall
```

### Triage completeness (checklist)

| Field present | Points |
|---------------|--------|
| attackType (>2 chars) | 0.25 |
| valid severity enum | 0.25 |
| summary (>20 chars) | 0.20 |
| timeline (≥1 event) | 0.15 |
| recommendations (≥2) | 0.15 |

### Hallucination rate

```
forbidden_keywords_found / total_forbidden_keywords
```
Lower is better. A forbidden keyword is one that should NOT appear (e.g. wrong attack name).

### Composite accuracy

```
accuracy = 0.20×severity
         + 0.20×attack_type
         + 0.15×keywords
         + 0.10×timeline
         + 0.10×recommendations
         + 0.10×mitre
         + 0.10×investigation
         + 0.05×triage_completeness
```

### Analyst utility score

```
utility = 0.30×accuracy
        + 0.25×investigation_quality
        + 0.25×recommendation_quality
        + 0.20×(1 - hallucination_rate)
```

---

## 6. RAG context budget

```
injected_context = join(top_K_chunks, "\n\n")
if len(injected_context) > 8000:
    truncate to 8000 chars
```

Prevents exceeding Gemini context window limits on the knowledge portion.

---

## 7. Rate limit (sliding window)

In-memory counter per key:

```
if requests_in_window >= limit:
    return 429 Too Many Requests
else:
    increment counter
    if window_expired: reset counter
```

Window sizes: 60 seconds for all endpoints.

---

## 8. Connection pool sizing

```
if DATABASE_URL contains ":6543" or "pgbouncer=true":
    max_connections = 3   // serverless-safe for transaction pooler
else:
    max_connections = 10  // local dev
```

Rule of thumb: serverless instances × pool max should not exceed Supabase pooler limit (varies by plan).
