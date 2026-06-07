# Argus

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

**Argus** is an AI-powered Security Operations Center (SOC) analyst assistant. It ingests security logs and helps analysts with incident summaries, threat classification, attack timelines, retrieval-augmented investigation, and a public research evaluation lab.

**Repository:** [github.com/Zaid-Ahmed-Ansari/Argus](https://github.com/Zaid-Ahmed-Ansari/Argus)

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind, shadcn/ui |
| Backend | Next.js Route Handlers |
| Database | **Supabase** (PostgreSQL) + Prisma |
| AI | Google Gemini (structured JSON analysis) |
| RAG | Hybrid FTS + semantic embeddings (`gemini-embedding-001`) |
| Auth | Better Auth (sessions in Postgres) |
| Uploads | UploadThing (production) / local disk (dev) |
| Hosting | Vercel |

## Quick start

### Prerequisites

- Node.js 20+
- PostgreSQL (local) **or** a [Supabase](https://supabase.com) project
- [Google AI Studio](https://aistudio.google.com) API key

### Setup

```bash
git clone https://github.com/Zaid-Ahmed-Ansari/Argus.git
cd Argus
npm install
cp .env.example .env
```

Edit `.env` — at minimum:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection (Supabase transaction pooler in prod) |
| `DIRECT_URL` | Migration connection (same as above for local Postgres) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Gemini analysis + embeddings |

**Local Docker Postgres:**

```bash
docker compose up -d
```

**Supabase (production):** see [docs/supabase-setup.md](docs/supabase-setup.md) — you only need two database URLs, not Supabase API keys.

```bash
npm run db:migrate
npm run db:seed:knowledge
npm run db:embed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Local production build |
| `npm run vercel-build` | Vercel build (migrate + Next.js) |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:setup:prod` | Migrate + seed knowledge + embed |
| `npm run experiment:all` | Run all research experiment fixtures |
| `npm run experiment:baseline` | Export results for deploy |

## Public research lab

Visit **`/research`** — no login required. Pre-computed experiment baselines ship in `experiments/baseline/`.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/supabase-setup.md](docs/supabase-setup.md) | **Supabase database setup** |
| [docs/production-deployment.md](docs/production-deployment.md) | GitHub + Vercel checklist |
| [docs/architecture.md](docs/architecture.md) | System design |
| [docs/experiments.md](docs/experiments.md) | Experiment methodology |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting |

## Project structure

```text
├── docs/              # Technical documentation
├── datasets/          # Sample logs + eval ground truth
├── experiments/       # Configs + baseline results
├── prisma/            # Schema and migrations
├── scripts/           # Batch experiment runner
└── src/
    ├── app/           # Pages and API routes
    ├── features/      # Domain modules
    └── services/      # AI, RAG, eval metrics
```

## Security

- Never commit `.env` or API keys
- Report vulnerabilities per [SECURITY.md](SECURITY.md)
- Do not upload real production logs with PII to public deployments without redaction

## License

MIT — see [LICENSE](LICENSE).
