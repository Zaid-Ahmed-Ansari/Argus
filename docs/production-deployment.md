# Argus — Production Deployment Plan

**Target:** [GitHub](https://github.com/Zaid-Ahmed-Ansari/Argus) → Vercel (app) + Supabase (PostgreSQL)  
**Last updated:** June 2026

Step-by-step checklist before going live. Argus is a Next.js 16 full-stack app with Prisma, Better Auth, Gemini, hybrid RAG, and UploadThing storage.

---

## Overview

```
Developer → GitHub → Vercel (Next.js)
                      ↓
              Neon / Supabase (PostgreSQL)
                      ↓
         Gemini API · UploadThing (optional)
```

| Component | Production provider | Why |
|-----------|---------------------|-----|
| App hosting | **Vercel** | Native Next.js, HTTPS, previews |
| Database | **Supabase** | Managed Postgres + connection pooling ([setup guide](./supabase-setup.md)) |
| File uploads | **UploadThing** | Vercel has no persistent local disk |
| AI | **Google Gemini API** | Analysis + embeddings |
| Auth | **Better Auth** (in-app) | Sessions in Postgres |

---

## Phase 0 — Repository

**GitHub:** [github.com/Zaid-Ahmed-Ansari/Argus](https://github.com/Zaid-Ahmed-Ansari/Argus)  
Push the app as the **repo root** (Vercel root directory = `.`).

**Before first push:**

- [ ] Confirm `.env` is **not** tracked (in `.gitignore`)
- [ ] Confirm `.cursor/` is **not** tracked
- [ ] Confirm `storage/uploads/**` is gitignored
- [ ] Confirm `experiments/baseline/` is committed (research charts on Vercel)
- [ ] Confirm `SECURITY.md` and `LICENSE` are present
- [ ] No API keys or Supabase service-role keys in source code

---

## Phase 1 — Pre-push code & config fixes

These are small changes worth doing **before** production, not blockers for a first deploy but important for a serious launch.

### 1.1 Production database migrations in build

Current build script:

```json
"build": "prisma generate && next build"
```

For Vercel, use a dedicated build script so local `npm run build` still works without a live DB:

```json
"build": "prisma generate && next build",
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

`vercel.json` points Vercel at `npm run vercel-build`. `DATABASE_URL` must be set in Vercel **before** the first build (Phase 3).

### 1.2 Better Auth production URLs

`src/lib/auth-origins.ts` builds `trustedOrigins` from:

- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL` (when set)
- `https://${VERCEL_URL}` (Vercel preview deployments)
- `http://localhost:3000` (development only)

### 1.3 Auth env vars must match production domain

| Variable | Production value |
|----------|------------------|
| `BETTER_AUTH_URL` | `https://your-domain.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_APP_URL` | Same as above |

Both must use **HTTPS**. Mismatch causes sign-in/cookie failures.

### 1.4 File storage — UploadThing required on Vercel

Local disk (`storage/uploads/`) is **ephemeral** on Vercel serverless functions. Uploads are lost between invocations.

- [ ] Create an [UploadThing](https://uploadthing.com) account
- [ ] Set `UPLOADTHING_TOKEN` in Vercel env
- [ ] Verify upload flow on preview deploy before going live

Without UploadThing, log upload will fail or behave inconsistently in production.

### 1.5 Lock down dev-only routes

| Route | Action |
|-------|--------|
| `/dev/bones` | Remove from `PUBLIC_PATHS` in `src/proxy.ts` for production, or delete route before launch |
| Boneyard build | Dev-only; do not run in CI/production |

### 1.6 Environment validation

`src/lib/env.ts` already **throws** on invalid env in `NODE_ENV=production`. Ensure all required vars are set in Vercel (Phase 3).

---

## Phase 2 — GitHub setup

### 2.1 Create repository

```bash
cd argus
git init   # if not already a repo
git add .
git status   # verify no .env, no uploads, no secrets
git commit -m "Initial production-ready Argus"
git branch -M main
git remote add origin https://github.com/Zaid-Ahmed-Ansari/Argus.git
git push -u origin main
```

### 2.2 Repository hygiene

- [ ] Add a **LICENSE** (MIT is fine for portfolio/open research)
- [ ] Ensure `README.md` has setup + link to this doc
- [ ] Add **GitHub secret scanning** (enabled by default on public repos)
- [ ] Optional: branch protection on `main` (require PR reviews)

### 2.3 Never commit

| File / pattern | Reason |
|----------------|--------|
| `.env`, `.env.local` | Secrets |
| `storage/uploads/**` | User data |
| API keys in code | Secrets |
| `personal-not-to-commit/` | Private notes (parent folder) |

---

## Phase 3 — Supabase PostgreSQL

Full guide: **[docs/supabase-setup.md](./supabase-setup.md)**

### 3.1 Create project

1. [supabase.com](https://supabase.com) → New project
2. Copy **two** connection strings from Project Settings → Database

| Env var | Supabase pooler | Port |
|---------|-----------------|------|
| `DATABASE_URL` | **Transaction** pooler + `?pgbouncer=true` | 6543 |
| `DIRECT_URL` | **Session** pooler (migrations) | 5432 |

**Auth:** Argus uses **Better Auth**, not Supabase Auth. You only need database URLs — not Supabase anon/service keys.

### 3.2 Run migrations (first time)

```bash
# Set both URLs in .env or shell
npm run db:setup:prod
```

| Step | Purpose |
|------|---------|
| `migrate deploy` | Auth tables, incidents, FTS, RAG embeddings |
| `db:seed:knowledge` | MITRE + playbook knowledge |
| `db:embed` | Gemini embedding vectors (requires `GEMINI_API_KEY`) |

### 3.3 Postgres features used

| Feature | Supabase support |
|---------|------------------|
| Full-text search | Yes |
| JSONB embeddings | Yes (no pgvector extension required) |
| Prisma migrations | Via `DIRECT_URL` |

---

## Phase 4 — Vercel project setup

### 4.1 Import from GitHub

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Root directory = `.` (repo root)
4. Framework preset: **Next.js** (auto-detected)

### 4.2 Build settings

| Setting | Value |
|---------|-------|
| Build command | `npm run vercel-build` (via `vercel.json`; see 1.1) |
| Install command | `npm install` |
| Output directory | `.next` (default) |
| Node.js version | **20.x** or **22.x** |

`postinstall` already runs `prisma generate`.

### 4.3 Environment variables (Vercel dashboard)

Set for **Production**, **Preview**, and **Development** as appropriate:

#### Required

| Variable | Example / notes |
|----------|-----------------|
| `DATABASE_URL` | Supabase **transaction** pooler (6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **session** pooler (5432) — required for migrations |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` (min 32 chars) |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |
| `GEMINI_API_KEY` | From Google AI Studio |
| `NODE_ENV` | `production` (Vercel sets this automatically) |

#### Strongly recommended (production)

| Variable | Value |
|----------|-------|
| `UPLOADTHING_TOKEN` | From UploadThing dashboard |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-001` |
| `RAG_RETRIEVER_MODE` | `hybrid` |
| `DATABASE_POOL_MAX` | `10` |

#### Optional

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Only if using OpenAI provider |
| `NEXT_PUBLIC_LOGO_VERSION` | Bump when you change `public/logo.png` |
| `UPLOAD_DIR` | **Leave unset** on Vercel (use UploadThing) |

### 4.4 Deploy

```bash
# Or push to main — Vercel auto-deploys
git push origin main
```

Watch build logs for:

- Prisma migrate success
- Next.js build success
- No env validation errors

---

## Phase 5 — Post-deploy verification

Run through this checklist on the **production URL**:

### 5.1 Public pages (no login)

| URL | Expected |
|-----|----------|
| `/` | Landing page loads, logo visible |
| `/research` | Research lab loads |
| `/research/experiments` | Experiment search works |
| `/sign-in`, `/sign-up` | Auth forms render |

### 5.2 Authentication

- [ ] Sign up with new account
- [ ] Sign out and sign in again
- [ ] Session persists on refresh
- [ ] Protected routes redirect to `/sign-in` when logged out

### 5.3 Core app (logged in)

| Flow | Check |
|------|-------|
| Dashboard | Loads without 503 |
| Upload logs | Works via UploadThing |
| Analyze | Returns Gemini JSON (not placeholder stub) |
| Incidents | List + detail pages |
| Log search | FTS returns results |

### 5.4 API smoke tests

```bash
# Public experiments API
curl https://your-app.vercel.app/api/experiments/results

# Analyze requires auth — test via UI
```

### 5.5 AI not in placeholder mode

If you see *"Placeholder analysis — set GEMINI_API_KEY"*:

- `GEMINI_API_KEY` is missing or wrong in Vercel env
- Redeploy after fixing

---

## Phase 6 — Research lab on production

The `/research` page reads experiment results from `experiments/results/*.json` on the **server filesystem**.

**On Vercel:** that filesystem is ephemeral. Batch runs (`npm run experiment:all`) executed on Vercel will not persist across deploys unless you change storage.

**Options before launch:**

| Option | Effort | Good for |
|--------|--------|----------|
| **A** Commit a baseline `experiments/results/` snapshot to git | Low | Demo / portfolio with pre-filled charts |
| **B** Run experiments locally, commit JSON results, deploy | Low | Accurate numbers on `/research` |
| **C** Move results to Postgres or blob storage | High | Real production research platform |

For mentor/portfolio demo: **Option B** (implemented):

```bash
npm run experiment:all
npm run experiment:baseline   # copies → experiments/baseline/ (tracked in git)
git add experiments/baseline/
git commit -m "Add baseline experiment results for research dashboard"
```

`experiments/results/*.json` stays gitignored (ephemeral local runs). `experiments/baseline/` ships with deploys so `/research` has charts on Vercel.

---

## Phase 7 — Security hardening (before sharing widely)

| Item | Status in codebase | Action |
|------|-------------------|--------|
| Auth on app routes | ✅ `proxy.ts` | Verify production |
| Security headers | ✅ CSP, X-Frame-Options | Tighten CSP if needed |
| Rate limits | ✅ analyze, upload, search, evaluate | In-memory only — resets on cold start; consider Upstash Redis later |
| Input validation | ✅ Zod on API routes | Keep |
| XSS sanitization | ✅ DOMPurify | Keep |
| HTTPS | ✅ Vercel | Automatic |
| PII in logs sent to Gemini | ⚠️ Not implemented | Redact before public launch with real logs |
| Audit log table | ⚠️ Not implemented | Optional for v2 |
| `/dev/bones` public | ⚠️ Yes | Lock down (Phase 1.5) |

### CSP note

Current CSP allows `'unsafe-inline'` and `'unsafe-eval'` for scripts. Acceptable for v1; tighten when you remove dev tooling.

### Gemini API key

- Server-side only (route handlers) — never expose as `NEXT_PUBLIC_*`
- Set usage quotas in Google AI Studio
- Monitor billing

---

## Phase 8 — Custom domain (optional)

1. Vercel → Project → **Domains** → Add domain
2. Update DNS at your registrar (Vercel gives records)
3. Update env vars:
   - `BETTER_AUTH_URL=https://argus.yourdomain.com`
   - `NEXT_PUBLIC_APP_URL=https://argus.yourdomain.com`
4. Redeploy
5. Test auth cookies on custom domain

---

## Phase 9 — Ongoing operations

### Deploy workflow

```
feature branch → PR → Vercel preview URL → merge to main → production deploy
```

### Database changes

```bash
# Local: create migration
npm run db:migrate

# Commit prisma/migrations/
git push

# Vercel build runs prisma migrate deploy automatically (after Phase 1.1)
```

### Re-seed knowledge (after doc updates)

```bash
DATABASE_URL="neon-url" npm run db:seed:knowledge
DATABASE_URL="neon-url" GEMINI_API_KEY="..." npm run db:embed
```

### Monitoring

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Traffic, Web Vitals |
| Vercel Logs | Runtime errors |
| Neon dashboard | DB connections, storage |
| Google AI Studio | Gemini usage / quotas |

### Backups

- Neon: enable automatic backups (paid tiers) or periodic `pg_dump`
- Export experiment results from `/research/results` periodically

---

## Phase 10 — Production checklist (printable)

### Before first push

- [ ] No secrets in git
- [ ] `personal-not-to-commit/` not in repo
- [ ] README and docs updated
- [ ] Build passes locally: `npm run build`

### Before Vercel deploy

- [ ] Neon (or Supabase) database created
- [ ] Pooled `DATABASE_URL` in Vercel
- [ ] `BETTER_AUTH_SECRET` generated (32+ chars)
- [ ] `BETTER_AUTH_URL` + `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] `GEMINI_API_KEY` set
- [ ] `UPLOADTHING_TOKEN` set
- [ ] Build script includes `prisma migrate deploy`
- [ ] Migrations + knowledge seed + embed run once against prod DB

### After deploy

- [ ] Sign up / sign in works
- [ ] Upload + analyze works
- [ ] `/research` shows expected content
- [ ] No placeholder AI responses
- [ ] `/dev/bones` not publicly accessible
- [ ] Custom domain updated (if used)

### Before sharing with mentor / public

- [ ] Experiment results populated (local run + commit or DB)
- [ ] Full research report exports correctly
- [ ] Rate limits acceptable for expected traffic
- [ ] Privacy: no real PII in sample logs sent to Gemini

---

## Quick reference — all environment variables

```env
# Database (Neon pooler URL)
DATABASE_URL="postgresql://...@ep-xxx-pooler.../neondb?sslmode=require"
DATABASE_POOL_MAX=10

# Auth (production HTTPS URLs)
BETTER_AUTH_SECRET="<32+ random chars>"
BETTER_AUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Uploads (required on Vercel)
UPLOADTHING_TOKEN="sk_live_..."

# AI
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"
RAG_RETRIEVER_MODE="hybrid"

# Branding
NEXT_PUBLIC_LOGO_VERSION="1"
```

---

## Estimated timeline

| Phase | Time |
|-------|------|
| Code fixes (1.1–1.5) | 1–2 hours |
| GitHub + Neon setup | 1 hour |
| Vercel env + first deploy | 1 hour |
| Seed DB + smoke tests | 1 hour |
| Research results + polish | 2–4 hours |
| **Total to first production URL** | **~1 day** |

---

## Related docs

- [architecture.md](architecture.md) — system design
- [api.md](api.md) — API routes
- [experiments.md](experiments.md) — batch evaluation
- [research-roadmap.md](research-roadmap.md) — research platform

---

*This plan is specific to Argus as of June 2026. Revisit after major schema or auth changes.*
