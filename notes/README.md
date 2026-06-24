# Argus — Mentor & Viva Notes

Study material for defending **Argus** (AI SOC analyst assistant).  
Focus: cybersecurity, RAG, databases, AI/ML, research methodology, security, and infrastructure — **not JavaScript/React**.

**Live demo:** https://argus-gules.vercel.app  
**Repository:** https://github.com/Zaid-Ahmed-Ansari/Argus

---

## How to use these notes

| File | Contents |
|------|----------|
| [01-cybersecurity.md](./01-cybersecurity.md) | SOC workflows, MITRE ATT&CK, attack scenarios, log types, severity, PII |
| [02-rag-retrieval.md](./02-rag-retrieval.md) | Hybrid RAG, FTS, embeddings, chunking, retrieval modes |
| [03-database-postgresql.md](./03-database-postgresql.md) | Schema, Prisma, Supabase pooler, FTS indexes |
| [04-ai-llm-pipeline.md](./04-ai-llm-pipeline.md) | Gemini, prompts, JSON parsing, orchestration |
| [05-research-experiments.md](./05-research-experiments.md) | Ground truth, metrics, experiments, RQs |
| [06-security-architecture.md](./06-security-architecture.md) | Auth, rate limits, redaction, headers, validation |
| [07-infrastructure-deployment.md](./07-infrastructure-deployment.md) | Vercel, Supabase, CI, storage, env vars |
| [08-algorithms-and-formulas.md](./08-algorithms-and-formulas.md) | RRF, ts_rank, cosine similarity, metric formulas |
| **[VIVA.md](./VIVA.md)** | **Possible mentor questions with model answers** |

---

## 30-second elevator pitch

> Argus is an AI-assisted SOC platform that ingests security logs (mainly SSH auth logs), runs Google Gemini analysis optionally augmented by hybrid RAG over MITRE ATT&CK and SOC playbooks, and persists structured incidents with timelines and recommendations. It doubles as a reproducible research lab with 10 labeled attack scenarios, 4 active experiments, and 15 research questions — all evaluated against ground-truth JSON with automated metrics.

---

## Key numbers to remember

| Item | Value |
|------|-------|
| Attack scenarios | 10 |
| Research questions | 15 (RQ1–RQ15) |
| Active experiments | 4 (exp-002 … exp-005) |
| Evaluation metrics | 10+ |
| RAG top-K | 5 chunks |
| Chunk size / overlap | 800 / 100 characters |
| RRF constant k | 60 |
| Embedding dimensions | 768 (Gemini) |
| Severity levels | LOW, MEDIUM, HIGH, CRITICAL |
| Default LLM | gemini-2.0-flash |
| Prompt version | soc-v3-hybrid-rag |
| Analyze temperature | 0.15 |
| Max log size | 1 MB / 1M characters |
| Cache TTL (incidents) | 60 seconds |
