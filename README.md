# Argus — SOC Analyst Assistant

[![Live Demo](https://img.shields.io/badge/demo-live-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://argus-gules.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-API-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Research](https://img.shields.io/badge/research-15_RQs-8b5cf6?style=flat-square)](https://argus-gules.vercel.app/research)

**Argus** is an AI-assisted Security Operations Center (SOC) platform that turns noisy authentication and security logs into structured incident records — attack classification, MITRE ATT&CK mapping, investigation timelines, and playbook-aligned recommendations — backed by a reproducible research lab for evaluating LLM-based triage.

**Live application:** [https://argus-gules.vercel.app](https://argus-gules.vercel.app)  
**Source code:** [github.com/Zaid-Ahmed-Ansari/Argus](https://github.com/Zaid-Ahmed-Ansari/Argus)

---

## Table of contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Key capabilities](#key-capabilities)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Research platform](#research-platform)
- [Quick start (local)](#quick-start-local)
- [Database: Docker vs Supabase](#database-docker-vs-supabase)
- [Environment variables](#environment-variables)
- [Running experiments](#running-experiments)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Security](#security)
- [Documentation](#documentation)
- [Author](#author)
- [License](#license)

---

## Overview

SOC analysts spend significant time parsing raw log lines before they can classify an incident or decide next steps. Argus addresses that bottleneck with a unified workflow:

1. **Upload** SSH, VPN, web server, or SIEM log exports (paste or file upload).
2. **Analyze** with Google Gemini, optionally augmented by hybrid RAG over MITRE ATT&CK and SOC playbook knowledge.
3. **Investigate** on a persistent dashboard with timelines, severity counts, log search, and an interactive investigation workspace.
4. **Evaluate** reproducible benchmarks across 10 labeled attack scenarios and 15 research questions.

Argus is both a **production-style analyst tool** (auth, persistent incidents, upload pipeline) and a **research instrument** (ground-truth datasets, batch experiment runner, public metrics dashboard).

| Audience | What you get |
|----------|--------------|
| **Visitors & analysts** | Live demo, sign-up, upload sample logs, review structured triage output |
| **Developers** | Full-stack Next.js app you can run locally with Docker Postgres or deploy to Vercel + Supabase |
| **Researchers** | 10-scenario corpus, 4 active experiment axes, 10 evaluation metrics, baseline results at `/research` |

---

## Screenshots

### Product

| Homepage | Investigation workspace |
|----------|-------------------------|
| ![Argus homepage — landing page with analysis preview](public/screenshots/01-homepage.png) | ![Investigation workspace — incident summary and timeline](public/screenshots/02-investigation-workspace.png) |

| Attack chain graph | MITRE ATT&CK mapping |
|--------------------|----------------------|
| ![Attack chain visualization in investigation workspace](public/screenshots/03-attack-chain.png) | ![MITRE technique mapping panel](public/screenshots/04-mitre-mapping.png) |

### Research lab

| Research command center | Experiment comparison |
|-------------------------|----------------------|
| ![Research lab overview — scenarios, metrics, coverage matrix](public/screenshots/05-research-lab.png) | ![Experiment comparison charts and leaderboard](public/screenshots/06-experiment-comparison.png) |

---

## Key capabilities

### Analyst workflow

- **AI incident analysis** — Classifies attack patterns, assigns severity (`LOW` → `CRITICAL`), and builds event timelines from raw log lines.
- **Hybrid RAG** — Retrieves MITRE and playbook chunks via PostgreSQL full-text search, vector similarity (JSONB embeddings), or reciprocal-rank fusion (`RAG_RETRIEVER_MODE=hybrid`).
- **SOC-ready output** — Structured summaries, MITRE-style technique labels, and actionable investigation recommendations.
- **Log search** — Full-text search across stored log content and incident history.
- **Persistent records** — Every upload and analysis is saved per account with metadata, timelines, and audit-friendly storage.
- **PII redaction** — Emails, IPs, usernames, and tokens are masked before storage and before prompts are sent to the LLM (`src/utils/redact-pii.ts`).

### Research & evaluation

- **10 labeled scenarios** — Brute force through insider threat, each with `sample.log` + `ground-truth.json`.
- **4 active experiments** — RAG vs no-RAG, raw vs structured input, cross-scenario benchmark, 2×2 factorial matrix.
- **10 metrics** — Accuracy, attack-type/severity/MITRE accuracy, investigation quality, recommendation quality, hallucination rate, latency, and more.
- **Public research UI** — `/research` (overview), `/research/datasets`, `/research/experiments`, `/research/results`, `/research/questions`, `/research/legacy`.

---

## Architecture

Argus is a **single Next.js 16 application** (App Router). All server logic runs in Route Handlers — there is no separate Python or FastAPI service.

```mermaid
flowchart TB
  subgraph Client
    UI[Landing · Dashboard · Investigation · Research]
  end

  subgraph NextJS["Next.js 16 (App Router)"]
    API[API Route Handlers]
    Auth[Better Auth]
    Orch[Analysis Orchestrator]
    RAG[Hybrid RAG Retriever]
    Eval[Experiment Evaluator]
  end

  subgraph Data
  PG[(PostgreSQL)]
  UT[UploadThing]
  end

  subgraph External
  Gemini[Google Gemini API]
  end

  UI --> API
  API --> Auth
  API --> Orch
  Orch --> RAG
  Orch --> Gemini
  RAG --> PG
  API --> PG
  API --> UT
  Eval --> Orch
```

### Analysis pipeline

```text
Upload logs
  → validate + redact PII
  → persist LogFile (PostgreSQL FTS indexed)
  → AnalysisOrchestrator
      → [optional] Hybrid RAG: FTS + vector retrieval over DocumentChunk
      → GeminiProvider.complete()
  → persist Analysis (attackType, severity, timeline, recommendations)
  → Investigation workspace
```

### Layered codebase

```text
┌─────────────────────────────────────────────────────────┐
│  Presentation (src/app, src/components, src/features)   │
├─────────────────────────────────────────────────────────┤
│  API Routes (validate → delegate → respond)             │
├─────────────────────────────────────────────────────────┤
│  Services (AI, RAG, repositories, search, eval)         │
├─────────────────────────────────────────────────────────┤
│  Prisma ORM → PostgreSQL                                │
└─────────────────────────────────────────────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for SOLID mapping, extension points, and provider abstraction.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| Database | PostgreSQL 16 via Prisma 7 |
| Auth | Better Auth (sessions in Postgres) |
| AI | Google Gemini (`gemini-2.5-flash`, `gemini-embedding-001`) |
| RAG | PostgreSQL FTS + JSONB vector embeddings (no pgvector required) |
| Uploads | Local disk (dev) · UploadThing (Vercel production) |
| State / data | TanStack Query, Zustand, Recharts, React Flow |
| Hosting | Vercel (app) + Supabase or Docker (database) |

---

## Research platform

Argus ships a **reproducible evaluation framework** for LLM-based SOC triage. Researchers can explore results on the live site or replicate experiments locally.

### Research questions (RQ1–RQ15)

| ID | Question |
|----|----------|
| **RQ1** | Does hybrid RAG improve LLM-based SOC triage accuracy across diverse attack scenarios? |
| **RQ2** | Do structured security events improve attack classification compared to raw logs? |
| **RQ3** | Can LLMs reliably map incidents to MITRE ATT&CK techniques from sparse log evidence? |
| **RQ4** | Does hybrid (FTS + semantic) retrieval outperform no retrieval for recommendation quality? |
| **RQ5** | How does hallucination rate vary by scenario difficulty? |
| **RQ6** | Can LLMs distinguish password spray from brute force using auth logs alone? |
| **RQ7** | Does combining RAG and structured input produce additive gains? |
| **RQ8** | Are LLM-generated investigation timelines complete enough for analyst handoff? |
| **RQ9** | Do playbook-aligned recommendations score higher under ground-truth evaluation? |
| **RQ10** | Which attack scenarios produce the lowest attack-type accuracy? |
| **RQ11** | Is severity classification more reliable than attack-type classification? |
| **RQ12** | Does RAG reduce fabricated attack types on hard scenarios? |
| **RQ13** | What is the latency cost of hybrid retrieval per scenario? |
| **RQ14** | Can analyst utility score serve as a proxy for human-judged triage quality? |
| **RQ15** | How stable are cross-scenario benchmarks when re-run on the same fixtures? |

Full mapping to experiments: [`src/lib/research-catalog.ts`](src/lib/research-catalog.ts) · Live UI: [/research/questions](https://argus-gules.vercel.app/research/questions)

### Scenario corpus (10 fixtures)

| Scenario | MITRE | Difficulty |
|----------|-------|------------|
| Brute Force | T1110.001 | Easy |
| Password Spray | T1110.003 | Easy |
| Credential Stuffing | T1110.004 | Medium |
| Privilege Escalation | T1548 | Medium |
| Lateral Movement | T1021 | Hard |
| Suspicious Admin Activity | T1078.004 | Medium |
| Account Takeover | T1078 | Hard |
| Data Exfiltration | T1041 | Hard |
| Web Shell Activity | T1505.003 | Medium |
| Insider Threat | T1530 | Hard |

Each scenario lives under `datasets/<scenario_id>/` with `sample.log` and `ground-truth.json` (attack type, severity, MITRE IDs, required/forbidden keywords, timeline expectations, playbook themes).

### Active experiments

| ID | Name | What it compares |
|----|------|------------------|
| **exp-002** | RAG vs No RAG | `usedRag: false` vs hybrid RAG on |
| **exp-003** | Raw vs Structured | Raw log lines vs parsed security events |
| **exp-004** | Cross-Scenario Benchmark | Hybrid RAG across all 10 fixtures |
| **exp-005** | RAG × Input Matrix | 2×2 factorial (RAG × input format) |

### Evaluation metrics

| Metric | Description |
|--------|-------------|
| `accuracy` | Weighted composite score |
| `attack_type_accuracy` | Match against labeled attack type |
| `severity_accuracy` | Exact severity enum match |
| `mitre_mapping_accuracy` | Expected technique IDs in output |
| `investigation_quality` | Timeline depth, keywords, entity recall |
| `recommendation_quality` | SOC playbook theme overlap |
| `triage_completeness` | All output fields populated |
| `analyst_utility_score` | Human-proxy composite |
| `hallucination_rate` | Forbidden term hits (lower is better) |
| `latency_ms` | Analysis wall-clock time |

Implementation: [`src/services/eval/metrics.ts`](src/services/eval/metrics.ts)

### Paper outline (research artifact)

The public research lab documents ARGUS-1000 evaluation (leaderboard, confusion matrices, RQ1–RQ8) at `/research`. See [`docs/RESEARCH_PAGE.md`](docs/RESEARCH_PAGE.md).

### Baseline results on production

Committed baseline JSON under `experiments/baseline/` powers charts on Vercel (ephemeral serverless filesystem cannot persist batch runs). To refresh:

```bash
npm run experiment:all
npm run experiment:baseline
git add experiments/baseline/
```

---

## Quick start (local)

### Prerequisites

- **Node.js** 20.x or 22.x
- **npm** 10+
- **PostgreSQL** — via [Docker](#option-a-docker-recommended-for-local-dev) or a local install
- **Google AI Studio** API key ([get one here](https://aistudio.google.com/apikey))

### 1. Clone and install

```bash
git clone https://github.com/Zaid-Ahmed-Ansari/Argus.git
cd Argus
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — at minimum set `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, and `GEMINI_API_KEY`. See [Environment variables](#environment-variables).

### 3. Start PostgreSQL

**Docker (recommended):**

```bash
docker compose up -d
```

**Or** point `DATABASE_URL` / `DIRECT_URL` at an existing Postgres instance.

### 4. Initialize the database

```bash
npm run db:migrate          # apply Prisma migrations
npm run db:seed:knowledge   # seed MITRE + playbook knowledge
npm run db:embed            # generate Gemini embeddings (requires GEMINI_API_KEY)
```

Or run all production setup steps in one command:

```bash
npm run db:setup:prod
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Sign up** → **Upload** → paste or upload `datasets/brute_force/sample.log` → run analysis.

> **Note:** Without `GEMINI_API_KEY`, the app returns placeholder analysis text so you can still test the UI.

---

## Database: Docker vs Supabase

Argus uses **PostgreSQL only** for persistence. Authentication is handled by **Better Auth** (not Supabase Auth). You can use any Postgres host.

### Option A: Docker (recommended for local dev)

Use the included `docker-compose.yml` — no cloud account required.

```bash
# Start Postgres 16
docker compose up -d

# Verify health
docker compose ps
```

Set both URLs in `.env` to the Docker connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/argus"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/argus"
DATABASE_POOL_MAX=10
UPLOAD_DIR=storage
```

Then migrate and seed:

```bash
npm run db:setup:prod
npm run dev
```

**Stop / reset:**

```bash
docker compose down          # stop container
docker compose down -v       # stop + delete data volume (full reset)
```

| Docker | Supabase (production) |
|--------|------------------------|
| `localhost:5432` | Transaction pooler port **6543** (`?pgbouncer=true`) |
| Same URL for `DATABASE_URL` and `DIRECT_URL` | `DIRECT_URL` uses session pooler port **5432** for migrations |
| Local file uploads (`UPLOAD_DIR=storage`) | UploadThing required on Vercel |
| No SSL required | SSL enabled by default |

### Option B: Supabase (recommended for production)

Supabase provides managed PostgreSQL with backups, pooling, and a dashboard. Argus does **not** use Supabase Auth — only the database connection strings.

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Transaction pooler** (6543) → `DATABASE_URL` with `?pgbouncer=true`.
3. Copy **Session pooler** (5432) → `DIRECT_URL`.
4. Run `npm run db:setup:prod` once against the remote database.
5. Deploy to Vercel with env vars from [docs/supabase-setup.md](docs/supabase-setup.md).

Full step-by-step guide: **[docs/supabase-setup.md](docs/supabase-setup.md)**

### Why Better Auth + Postgres (not Supabase Auth)?

Argus is server-first: Prisma owns the schema, API routes enforce access, and Gemini keys never reach the browser. Better Auth stores users and sessions in the same Postgres database as incidents and RAG data — a natural fit for this architecture.

---

## Environment variables

Copy [`.env.example`](.env.example) and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection (app runtime) |
| `DIRECT_URL` | Yes | Postgres connection (Prisma migrations) |
| `BETTER_AUTH_SECRET` | Yes | Random secret, min 32 chars (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Yes | App origin, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `BETTER_AUTH_URL` (used for metadata/links) |
| `GEMINI_API_KEY` | Yes* | Google Gemini for analysis + embeddings |
| `UPLOADTHING_TOKEN` | Prod | Required on Vercel (no persistent disk) |
| `UPLOAD_DIR` | Local | `storage` — local upload directory |
| `RAG_RETRIEVER_MODE` | No | `fts` · `vector` · `hybrid` (default: `hybrid`) |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `GEMINI_EMBEDDING_MODEL` | No | Default: `gemini-embedding-001` |
| `DATABASE_POOL_MAX` | No | Default: `10` |

\*Without `GEMINI_API_KEY`, analysis returns a placeholder stub.

---

## Running experiments

```bash
# Single scenario (brute_force default)
npm run experiment:run

# All 10 scenarios × all experiment configs
npm run experiment:all

# Specific scenarios
npm run experiment:scenario -- brute_force password_spray

# RAG vs no-RAG only (exp-002)
npm run experiment:rag

# Export baseline for Vercel /research charts
npm run experiment:baseline
```

| Output | Location |
|--------|----------|
| Ephemeral run results | `experiments/results/*.json` (gitignored) |
| Committed baseline | `experiments/baseline/` (ships with deploy) |
| Public API | `GET /api/experiments/results` |
| Research UI | [localhost:3000/research](http://localhost:3000/research) |

See [docs/experiments.md](docs/experiments.md) and [datasets/README.md](datasets/README.md).

---

## Project structure

```text
argus/
├── src/
│   ├── app/                    # Next.js routes (pages + API)
│   ├── components/             # Shared UI (layout, shadcn)
│   ├── features/               # Feature modules
│   │   ├── landing/            # Marketing home page
│   │   ├── incidents/          # Incident list & cards
│   │   ├── investigation/      # Investigation workspace
│   │   ├── research/           # Research lab UI
│   │   └── experiments/        # Public experiments page
│   ├── services/               # AI, RAG, eval, repositories
│   └── lib/                    # Auth, metadata, research catalog
├── prisma/                     # Schema, migrations, seed scripts
├── datasets/                   # 10 labeled attack scenarios + knowledge
├── experiments/
│   ├── configs/                # Experiment JSON configs
│   ├── baseline/               # Committed baseline results
│   └── results/                # Local run output (gitignored)
├── scripts/                    # Batch experiment runner
├── docs/                       # Architecture, API, deployment guides
├── public/
│   └── screenshots/            # README screenshots
└── docker-compose.yml          # Local PostgreSQL
```

---

## API reference

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/analyze` | Yes | Run AI analysis on uploaded logs |
| `POST /api/upload` | Yes | Upload log file |
| `GET /api/incidents` | Yes | List user incidents |
| `GET /api/search/logs` | Yes | Full-text log search |
| `POST /api/evaluate` | Yes | Score prediction vs ground truth |
| `GET /api/experiments/results` | Public | Aggregated experiment metrics |

Full reference: [docs/api.md](docs/api.md)

---

## Deployment

Production stack: **GitHub → Vercel (Next.js) → Supabase (PostgreSQL) → Gemini + UploadThing**

```bash
# Vercel build (runs migrations automatically)
npm run vercel-build
```

Checklist and env vars: **[docs/production-deployment.md](docs/production-deployment.md)**  
Pre-launch QA: **[docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)**

| Production URL | Value |
|----------------|-------|
| App | `https://argus-gules.vercel.app` |
| `BETTER_AUTH_URL` | Same HTTPS origin |
| `NEXT_PUBLIC_APP_URL` | Same HTTPS origin |

---

## Security

- Sessions via Better Auth (HTTP-only cookies); protected routes in `src/proxy.ts`
- Rate limits on analyze, upload, search, and evaluate endpoints
- Security headers (CSP, `X-Frame-Options`) in middleware
- PII redaction before storage and LLM prompts
- Secrets only in environment variables — never committed

Report vulnerabilities privately: [SECURITY.md](SECURITY.md)

---

## Documentation

| Document | Topic |
|----------|-------|
| [docs/architecture.md](docs/architecture.md) | System design, RAG pipeline, extension points |
| [docs/api.md](docs/api.md) | REST route handlers |
| [docs/data-model.md](docs/data-model.md) | Prisma schema and enums |
| [docs/experiments.md](docs/experiments.md) | Experiment methodology |
| [docs/research-roadmap.md](docs/research-roadmap.md) | Research platform overview |
| [docs/rag-roadmap.md](docs/rag-roadmap.md) | RAG retrieval pipeline |
| [docs/supabase-setup.md](docs/supabase-setup.md) | Supabase PostgreSQL setup |
| [docs/production-deployment.md](docs/production-deployment.md) | Vercel production deploy |

---

## Author

**Zaid Ahmed Ansari** — [GitHub](https://github.com/Zaid-Ahmed-Ansari) · [Argus repository](https://github.com/Zaid-Ahmed-Ansari/Argus)

Built as a cybersecurity research and portfolio project: an analyst-facing SOC assistant with a reproducible evaluation lab for LLM-based log triage.

---

## License

[MIT](LICENSE) — see [LICENSE](LICENSE) for details.
