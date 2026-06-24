# Infrastructure & Deployment

## 1. Production architecture

```
GitHub (main branch)
    ↓ push
Vercel — Next.js 16 serverless functions
    ├── Supabase PostgreSQL (transaction pooler :6543)
    ├── Google Gemini API (analysis + embeddings)
    └── UploadThing (file storage)
```

**Live URL:** https://argus-gules.vercel.app

---

## 2. Vercel deployment

### Build command (`vercel.json`)

```bash
npm run vercel-build
# = prisma generate && prisma migrate deploy && next build
```

Migrations run **during build** — `DIRECT_URL` must be set in Vercel env.

### Runtime

- Node.js 20+
- API routes: `export const runtime = "nodejs"` (not Edge — Prisma requires Node)

### Serverless constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| No persistent disk | Can't store uploads locally | UploadThing |
| Cold starts | First request slower | Connection pool max=3 |
| Ephemeral filesystem | Can't write experiment results at runtime | Baselines committed to git |
| In-memory rate limits | Reset on cold start | Document Upstash for prod hardening |

---

## 3. Supabase setup

### Required env vars

```
DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...@...pooler.supabase.com:5432/postgres
```

### Also set on Vercel

```
BETTER_AUTH_URL=https://argus-gules.vercel.app
NEXT_PUBLIC_APP_URL=https://argus-gules.vercel.app
BETTER_AUTH_SECRET=<32+ char random>
GEMINI_API_KEY=<key>
UPLOADTHING_TOKEN=<token>
RAG_RETRIEVER_MODE=hybrid
```

**Docs:** `docs/supabase-setup.md`, `docs/production-deployment.md`

---

## 4. Local development

### Option A: Docker Postgres

```bash
docker compose up -d
npm run db:migrate
npm run db:seed:knowledge
npm run db:embed
npm run dev
```

### Option B: Supabase remote

Point `DATABASE_URL` and `DIRECT_URL` to Supabase project.

---

## 5. CI pipeline

**File:** `.github/workflows/ci.yml`

On push/PR to `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run build` (with dummy env vars)

Validates TypeScript compile and Next.js build — does not run integration tests against real Gemini.

---

## 6. Storage architecture

| Environment | Upload storage | Path stored in DB |
|-------------|----------------|-------------------|
| Local dev | Filesystem `storage/uploads/` | Relative path |
| Vercel prod | UploadThing CDN | External URL/key |

Log **content** is also copied into `LogFile.content` (Postgres TEXT) for FTS search — storage path is for re-download only.

---

## 7. Caching architecture (performance)

### Server cache

- `unstable_cache` — 60s TTL, tag `incidents-{userId}`
- Invalidated on new analysis

### Client cache

- React Query — 60s `staleTime` for incidents list
- Prefetch all severity filters on incidents page mount
- `keepPreviousData` for instant filter switching

### Database

- Composite index `(userId, createdAt DESC)` on Incident
- GIN indexes on tsvector columns
- Merged count queries (`getUserStats` single groupBy)

---

## 8. Monitoring & ops

### What to check in production

- Vercel function logs for `[POST /api/analyze]` errors
- Supabase connection pool exhaustion (reduce `DATABASE_POOL_MAX` if needed)
- Gemini API quota/rate limits
- Migration failures in Vercel build logs

### Launch checklist

`docs/LAUNCH_CHECKLIST.md` — env vars, OG images, favicons, mobile QA, screenshots.

---

## 9. Region alignment (latency)

If Vercel region and Supabase region differ (e.g. US Vercel + EU Supabase), every DB query adds ~150–250ms RTT. Co-locate when possible.

Warm dashboard target: **200–450ms** production. Dev `next dev` is slower due to Turbopack compilation.

---

## 10. Key file paths

| Topic | Path |
|-------|------|
| Vercel config | `vercel.json` |
| Docker | `docker-compose.yml` |
| CI | `.github/workflows/ci.yml` |
| Env example | `.env.example` |
| Deployment docs | `docs/production-deployment.md` |
| Launch checklist | `docs/LAUNCH_CHECKLIST.md` |
| Architecture | `docs/architecture.md` |
