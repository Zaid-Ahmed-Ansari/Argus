<div align="center">


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#argus)

# ➤ Argus
<p align="center">
		<a href="https://david-dm.org/Zaid-Ahmed-Ansari/Argus"><img alt="Dependencies" src="https://img.shields.io/david/Zaid-Ahmed-Ansari/Argus.svg" height="20"/></a>
<a href="https://github.com/Zaid-Ahmed-Ansari/Argus/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/Zaid-Ahmed-Ansari/Argus.svg" height="20"/></a>
<a href="https://nextjs.org"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" height="20"/></a>
<a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" height="20"/></a>
<a href="https://www.postgresql.org/"><img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" height="20"/></a>
<a href="https://opensource.org/licenses/MIT"><img alt="License MIT" src="https://img.shields.io/badge/License-MIT-blue.svg" height="20"/></a>
	</p>

<p align="center">
  <b>AI-powered SOC analyst assistant and cybersecurity research platform with hybrid RAG, investigation workspace, and reproducible experiment baselines.</b></br>
  <sub>Upload security logs, run AI-assisted triage, and explore incidents in a purpose-built SOC Investigation Workspace — or benchmark RAG and log-structuring strategies in the public Research Lab. Go here to see a demo <a href="https://github.com/Zaid-Ahmed-Ansari/Argus">https://github.com/Zaid-Ahmed-Ansari/Argus</a>.<sub>
</p>

<br />

* **Incident intelligence** — classification, severity, timelines, MITRE mapping, and tiered recommendations
* **Investigation workspace** — command center, attack-chain graph, staged timeline, and floating section navigator
* **Hybrid RAG** — full-text + semantic retrieval over seeded SOC and MITRE knowledge
* **Research reproducibility** — committed experiment baselines, datasets, and evaluation scripts

</div>


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#table-of-contents)

## ➤ Table of Contents

* [➤ Argus](#-argus)
	* [➤ What is Argus?](#-what-is-argus)
	* [➤ Features](#-features)
		* [Incident analysis](#incident-analysis)
		* [SOC Investigation Workspace](#soc-investigation-workspace)
		* [Research laboratory](#research-laboratory)
	* [➤ How it works](#-how-it-works)
		* [Tech stack](#tech-stack)
	* [➤ Getting Started](#-getting-started)
		* [Prerequisites](#prerequisites)
		* [1. Clone and install](#1-clone-and-install)
		* [2. Configure environment](#2-configure-environment)
		* [3. Start the database](#3-start-the-database)
		* [4. Run the app](#4-run-the-app)
	* [➤ Project structure](#-project-structure)
	* [➤ Documentation](#-documentation)
	* [➤ Production deploy](#-production-deploy)
		* [Security notice](#security-notice)
	* [➤ Contributors](#-contributors)
	* [➤ License](#-license)


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#what-is-argus)

## ➤ What is Argus?

Argus helps security analysts **triage incidents faster** without replacing human judgment. It is built for **defensive security**, education, and reproducible AI research — not as a SIEM replacement.

| Role | What Argus does |
|------|-----------------|
| **SOC analyst** | Upload logs → get structured incident reports → investigate in a multi-section workspace |
| **Researcher** | Run controlled experiments (RAG on/off, raw vs structured logs) and compare against committed baselines |
| **Developer** | Extend prompts, datasets, retrievers, or UI sections on a modern Next.js + Prisma stack |

**Core promise:** turn noisy auth and security telemetry into actionable intelligence — attack type, severity, timeline, MITRE context, root-cause notes, and prioritized next steps.


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#features)

## ➤ Features

### Incident analysis

| Capability | Description |
|------------|-------------|
| **Log ingestion** | Upload `.log` / `.txt` files — local disk in dev, UploadThing on Vercel |
| **Threat classification** | MITRE-aligned attack type and severity (`LOW` → `CRITICAL`) |
| **Timeline extraction** | Chronological events reconstructed from raw telemetry |
| **Hybrid RAG** | Full-text + vector search over seeded SOC/MITRE knowledge |
| **Recommendations** | Prioritized investigation and remediation steps |

### SOC Investigation Workspace

Open any incident at `/incidents/[id]`:

- **Command center** — confidence, incident count, key metrics
- **Incident breakdown** — detected threats with severity badges
- **Attack chain graph** — interactive React Flow stage map
- **MITRE mapping** — technique linkage
- **Staged timeline** — filter events by attack stage
- **Root cause & tiered recommendations**
- **Analysis metadata** — model version, latency, RAG usage
- **Floating navigator** — jump between sections without scrolling back to the top

### Research laboratory

Public UI at `/research` with baseline JSON in `experiments/baseline/`:

- **RAG vs no-RAG** — does retrieval improve classification?
- **Raw vs structured logs** — impact of log normalization
- **Scenario benchmarks** — ten attack datasets (brute force, lateral movement, web shell, …)
- **RAG × input matrix** — combined factor analysis

Run locally: `npm run experiment:run` · export baselines: `npm run experiment:baseline`


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#how-it-works)

## ➤ How it works

```mermaid
flowchart LR
  A[Security logs] --> B[Upload & parse]
  B --> C[Analysis engine]
  C --> D[Gemini LLM]
  C --> E[Hybrid RAG]
  D --> F[Investigation report]
  E --> F
  F --> G[Incident workspace]
  F --> H[Research evaluation]
```

**Pipeline in plain language:**

1. Logs are uploaded and sanitized; auth lines can be structured for cleaner prompts.
2. If RAG is enabled, Argus retrieves relevant knowledge chunks (Postgres FTS + pgvector).
3. Gemini returns **strict JSON** — attack type, severity, summary, timeline, recommendations.
4. Results are validated with Zod, stored in Postgres, and rendered in the investigation UI.
5. Experiments log the same outputs to JSON for the research dashboard.

### Tech stack

| Layer | Technology |
|-------|------------|
| App | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| API | Next.js Route Handlers |
| Database | PostgreSQL + Prisma 7 |
| Auth | Better Auth (sessions in Postgres) |
| AI | Google Gemini (`gemini-2.5-flash`) |
| Embeddings | `gemini-embedding-001` + pgvector |
| RAG | Hybrid full-text + semantic search |
| Storage | Local disk (dev) · UploadThing (Vercel) |
| Deploy | Vercel + Supabase Postgres |


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#getting-started)

## ➤ Getting Started

### Prerequisites

- **Node.js 20+**
- **Docker** (recommended for local Postgres)
- **Gemini API key** — [Google AI Studio](https://aistudio.google.com/apikey)

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

Minimum local values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/argus"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/argus"
BETTER_AUTH_SECRET="your-32-char-minimum-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GEMINI_API_KEY="your-key"
```

### 3. Start the database

```bash
docker compose up -d
npm run db:migrate
npm run db:seed:knowledge
npm run db:embed
```

### 4. Run the app

```bash
npm run dev
```

Open **http://localhost:3000** → sign up → upload `datasets/brute_force/sample.log` → analyze → open the incident workspace.

> Without `GEMINI_API_KEY`, analysis returns placeholder results so you can still explore the UI.


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#project-structure)

## ➤ Project structure

```
argus/
├── datasets/           # Attack scenarios, ground truth, knowledge docs
├── docs/               # Architecture, deployment, Supabase setup
├── experiments/        # Experiment configs + baseline JSON results
├── prisma/             # Schema, migrations, seed scripts
├── scripts/            # Experiment runner, baseline export
└── src/
    ├── app/            # Routes & API handlers
    ├── features/       # Investigation workspace, research UI
    └── services/       # AI orchestration, RAG, repositories
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#documentation)

## ➤ Documentation

| Guide | Description |
|-------|-------------|
| [docs/architecture.md](docs/architecture.md) | System design & data flow |
| [docs/data-model.md](docs/data-model.md) | Prisma schema overview |
| [docs/experiments.md](docs/experiments.md) | Research methodology & metrics |
| [docs/supabase-setup.md](docs/supabase-setup.md) | Supabase Postgres setup |
| [docs/production-deployment.md](docs/production-deployment.md) | Vercel deploy checklist |
| [SECURITY.md](SECURITY.md) | Security policy & responsible use |


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#production-deploy)

## ➤ Production deploy

1. Import [github.com/Zaid-Ahmed-Ansari/Argus](https://github.com/Zaid-Ahmed-Ansari/Argus) in [Vercel](https://vercel.com)
2. Create Supabase Postgres → set `DATABASE_URL` (pooler, port 6543) and `DIRECT_URL` (port 5432)
3. Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GEMINI_API_KEY`, `UPLOADTHING_TOKEN`
4. Deploy — Vercel runs `npm run vercel-build` (migrations + build)
5. Update auth URLs to your production domain and redeploy

Full checklist: [docs/production-deployment.md](docs/production-deployment.md)

### Security notice

Argus is for **educational, research, and defensive** use only. Logs are **best-effort PII-redacted** (emails, IPs, usernames, tokens) before storage and AI analysis — still avoid real production data on public deployments. Keep `.env` out of version control.





[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#contributors)

## ➤ Contributors
	

| [<img alt="Zaid Ahmed Ansari" src="https://github.com/Zaid-Ahmed-Ansari.png" width="100">](https://github.com/Zaid-Ahmed-Ansari) |
|:--------------------------------------------------:|
| [Zaid Ahmed Ansari](https://github.com/Zaid-Ahmed-Ansari) |
| Author & maintainer                              |


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#license)

## ➤ License
	
Licensed under [MIT](https://opensource.org/licenses/MIT).
