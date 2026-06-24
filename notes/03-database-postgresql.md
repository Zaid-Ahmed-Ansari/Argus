# Database & PostgreSQL (Supabase)

## 1. Technology choices

| Layer | Choice |
|-------|--------|
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Driver | `@prisma/adapter-pg` + `pg` connection pool |
| Production host | Supabase (managed Postgres) |
| Local dev | Docker Compose Postgres on port 5432 |

Argus uses **one database** for auth (Better Auth tables), incidents, logs, RAG knowledge, and embeddings.

---

## 2. Supabase connection architecture

### Two URLs required

| Variable | Pooler type | Port | Used for |
|----------|-------------|------|----------|
| `DATABASE_URL` | **Transaction** pooler (PgBouncer) | 6543 | App runtime queries |
| `DIRECT_URL` | **Session** pooler or direct | 5432 | `prisma migrate deploy` only |

### Why two URLs?

- **Transaction pooler** multiplexes many serverless connections efficiently (Vercel functions)
- **Migrations** need session-level features (DDL, prepared statements) that transaction pooling breaks
- `DATABASE_URL` must include `?pgbouncer=true`

### Connection pool settings (`pg-pool.ts`)

- SSL auto-enabled for `supabase.com` hosts
- `DATABASE_POOL_MAX`: default **3** on PgBouncer, **10** on direct/local
- `idleTimeoutMillis`: 30s
- `connectionTimeoutMillis`: 10s

---

## 3. Core schema tables

### Authentication (Better Auth — not Supabase Auth)

| Table | Purpose |
|-------|---------|
| `user` | id, name, email, emailVerified |
| `session` | token, expiresAt, userId |
| `account` | OAuth/password credentials |
| `verification` | Email verification tokens |

### Domain tables

| Table | Key columns |
|-------|-------------|
| `Incident` | title, attackType, severity, summary, status, userId |
| `LogUpload` | Staged upload before analysis (storagePath, sizeBytes, userId) |
| `LogFile` | Permanent log content, logType, lineCount, `search_vector` |
| `Analysis` | timeline (JSON), recommendations (JSON), provider, usedRag, latencyMs |
| `KnowledgeDocument` | source, title, content, metadata (JSONB) |
| `DocumentChunk` | chunkIndex, content, `search_vector`, embedding (JSONB) |

---

## 4. Enums

```sql
Severity:       LOW | MEDIUM | HIGH | CRITICAL
IncidentStatus: OPEN | INVESTIGATING | RESOLVED | ARCHIVED
LogType:        AUTH | FIREWALL | WEB_SERVER | SIEM | OTHER
AiProvider:     GEMINI | OPENAI
InputFormat:    RAW | STRUCTURED
```

---

## 5. Indexes (performance)

### Incident queries

```prisma
@@index([userId])
@@index([createdAt(sort: Desc)])
@@index([userId, createdAt(sort: Desc)])  // composite for per-user lists
@@index([severity])
```

### Foreign keys

- `LogFile.incidentId` → `Incident.id` (cascade delete)
- `Analysis.incidentId` → `Incident.id` (cascade delete)
- `DocumentChunk.documentId` → `KnowledgeDocument.id` (cascade delete)

---

## 6. Full-Text Search (FTS) in Postgres

### Two FTS use cases in Argus

| Table | Purpose | API |
|-------|---------|-----|
| `LogFile.search_vector` | User log search across incidents | `/api/logs/search` |
| `DocumentChunk.search_vector` | RAG knowledge retrieval | Internal retriever |

### How tsvector works

1. **Tokenization** — `to_tsvector('english', content)` splits text into lexemes (stemmed words)
2. **Indexing** — GIN index enables fast `@@` (match) operator
3. **Querying** — `plainto_tsquery('english', 'failed password')` → `'fail' & 'password'`
4. **Ranking** — `ts_rank(vector, query)` scores relevance
5. **Highlighting** — `ts_headline()` generates snippets for UI (log search only)

### Trigger-based maintenance

On INSERT/UPDATE of `content`, a Postgres trigger recomputes `search_vector`. Application code never manually updates tsvector.

**Migrations:** `prisma/migrations/20250607120000_restore_log_fts/`, `20260607102749_fts/`

---

## 7. Embeddings storage (JSONB)

```prisma
embedding Json?  // float[768] stored as JSON array
```

### Why not pgvector?

- No extension install required on Supabase free tier complications
- Portable across local Docker and cloud
- Corpus is small (~dozens of chunks) — in-memory cosine is acceptable

**Migration:** `prisma/migrations/20250608120000_pgvector_embeddings/` (column name historical; stores JSONB)

---

## 8. Data relationships (ER summary)

```
User 1──* Incident 1──* LogFile
                 └──* Analysis

KnowledgeDocument 1──* DocumentChunk

User 1──* LogUpload (staging, pre-analysis)
```

---

## 9. Transactions

`analyze-incident.service.ts` uses Prisma `$transaction` to atomically:

1. Create `Incident`
2. Create `LogFile` with redacted content
3. Create `Analysis` with AI output

If any step fails, entire analysis is rolled back — no orphan records.

---

## 10. Caching layer

Server-side `unstable_cache` (60s TTL) on:

- `getIncidentsListData(userId, options)`
- `getDashboardData(userId)`

Cache tag: `incidents-{userId}` — invalidated on new analysis via `revalidateTag` in analyze API route.

Client-side: React Query with 60s `staleTime` for incidents list UI.

---

## 11. Migrations workflow

| Command | When |
|---------|------|
| `npm run db:migrate` | Local dev — creates/applies migrations |
| `npm run db:migrate:deploy` | Production — `prisma migrate deploy` in Vercel build |
| `npm run db:seed:knowledge` | After migrate — ingest RAG documents |
| `npm run db:embed` | After seed — generate embeddings |

`prisma.config.ts` uses `DIRECT_URL` for migrations.

---

## 12. Key file paths

| Topic | Path |
|-------|------|
| Schema | `prisma/schema.prisma` |
| Migrations | `prisma/migrations/` |
| Pool | `src/lib/pg-pool.ts` |
| Prisma client | `src/lib/prisma.ts` |
| Repositories | `src/services/repositories/` |
| Supabase docs | `docs/supabase-setup.md` |
| Docker local DB | `docker-compose.yml` |
