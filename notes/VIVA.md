# Viva — Possible Questions & Answers

**Project:** Argus — AI SOC Analyst Assistant  
**Author:** Zaid Ahmed Ansari  
**Live:** https://argus-gules.vercel.app | **Code:** https://github.com/Zaid-Ahmed-Ansari/Argus

Use this document to prepare for mentor defense. Answers are concise but complete — expand with examples from the live demo when asked.

---

## A. Project overview & motivation

### Q1. What is Argus in one sentence?

**A:** Argus is an AI-assisted Security Operations Center platform that converts raw security logs into structured incident records — with attack classification, MITRE ATT&CK mapping, timelines, and playbook-aligned recommendations — backed by a reproducible research lab for evaluating LLM-based triage.

---

### Q2. What problem are you solving?

**A:** SOC analysts spend a large portion of their time manually parsing raw log lines before they can classify an incident or decide containment steps. Argus automates **first-pass triage** so analysts start from a structured incident record instead of unstructured text.

---

### Q3. Is Argus a SIEM replacement?

**A:** No. Argus is an **AI-assisted triage and investigation tool**. It does not ingest live network telemetry at scale, correlate across enterprise data sources, or replace Splunk/Elastic/QRadar. It complements SOC workflows by analyzing uploaded log exports.

---

### Q4. What makes Argus different from "just asking ChatGPT to read logs"?

**A:** Four things: (1) **Hybrid RAG** grounds outputs in MITRE ATT&CK and SOC playbooks; (2) **Persistent incidents** with auth, search, and investigation workspace; (3) **PII redaction** before storage and inference; (4) **Reproducible evaluation** with 10 labeled scenarios, ground truth, and automated metrics — not anecdotal demos.

---

### Q5. Who are the target users?

**A:** Three audiences: (1) SOC analysts and security students using the live demo; (2) developers who want a full-stack reference implementation; (3) researchers evaluating LLM accuracy on security triage tasks.

---

### Q6. What is the live deployment URL and tech stack?

**A:** https://argus-gules.vercel.app — Next.js 16, React 19, TypeScript, PostgreSQL (Supabase), Prisma 7, Google Gemini, Better Auth, deployed on Vercel.

---

### Q7. Why did you build this as a research platform AND a product?

**A:** A demo-only tool cannot defend accuracy claims. By embedding labeled datasets, experiment configs, and public metrics at `/research`, every design decision (RAG mode, input format, temperature) can be measured against ground truth — not just shown in a screenshot.

---

## B. Cybersecurity & SOC

### Q8. What is a SOC?

**A:** A Security Operations Center — a team and facility that monitors, detects, analyzes, and responds to cybersecurity incidents 24/7 using tools like SIEMs, EDR, and playbooks.

---

### Q9. What is incident triage?

**A:** The initial assessment of a security event: determining if it is a true incident, classifying attack type, assigning severity, and prioritizing response. Argus automates this first pass.

---

### Q10. What log types does Argus support?

**A:** Enum types: AUTH, FIREWALL, WEB_SERVER, SIEM, OTHER. The evaluation corpus and primary demo focus on **SSH/sshd authentication logs** in syslog format.

---

### Q11. Explain the four severity levels.

**A:**
- **LOW** — isolated failures, no confirmed compromise
- **MEDIUM** — suspicious pattern, limited impact
- **HIGH** — confirmed attack or successful unauthorized access
- **CRITICAL** — admin/root compromise, lateral movement, or data exfiltration

---

### Q12. What is MITRE ATT&CK?

**A:** A globally maintained knowledge base of adversary **tactics** (why) and **techniques** (how). Techniques have IDs like `T1110` (Brute Force) with sub-techniques like `T1110.001` (Password Guessing). Argus maps incidents to these IDs using RAG + LLM prompting.

---

### Q13. Give an example of brute force vs password spray.

**A:**
- **Brute force:** Many login attempts against **one account** (`admin`) from one IP until success.
- **Password spray:** One or few attempts each against **many accounts** (`user1`, `user2`, `user3`) with a common password — avoids per-account lockout thresholds.

Argus has separate labeled scenarios for each (T1110.001 vs T1110.003).

---

### Q14. What is credential stuffing?

**A:** Attackers use username:password pairs leaked from one breach to log into other services. Logs show **distributed IPs** each trying the same credential pair — scenario `credential_stuffing` (T1110.004).

---

### Q15. What is lateral movement?

**A:** After initial compromise, an attacker moves through the network to other hosts — e.g. via SMB or RDP. Argus scenario `lateral_movement` maps to T1021.

---

### Q16. What is a SOC playbook?

**A:** A documented step-by-step procedure for investigating and responding to a specific incident type. Argus seeds SSH investigation and password spray playbooks into the RAG knowledge base so LLM recommendations align with standard SOC procedure.

---

### Q17. What incident statuses does Argus track?

**A:** OPEN → INVESTIGATING → RESOLVED → ARCHIVED. Stored as a Postgres enum on the `Incident` table.

---

### Q18. What is prompt injection in the context of log analysis?

**A:** An attacker embeds instructions in log lines (e.g. `IGNORE PREVIOUS INSTRUCTIONS`) hoping the LLM follows them. Argus wraps logs in `<untrusted_logs>` tags and instructs the model to treat log content as data only, never as instructions.

---

### Q19. What PII do you redact and when?

**A:** Emails, IPs, usernames, SSNs, credit cards, phones, JWTs, MACs, PEM keys — redacted **before database storage** and **before sending to Gemini**. Implementation is regex-based (`redact-pii.ts`); it is best-effort, not certified DLP.

---

### Q20. Can Argus be used with real production logs?

**A:** Technically yes for a private deployment. The **public demo** should not receive real production data — redacted logs still go to Google's API. For production use, you need organizational approval, a Google Cloud data processing agreement, and ideally on-prem LLM deployment.

---

## C. RAG & retrieval

### Q21. What is RAG?

**A:** Retrieval-Augmented Generation — at query time, retrieve relevant documents from a knowledge base and inject them into the LLM prompt so the model grounds its answer in real references instead of relying solely on training data.

---

### Q22. Why does Argus need RAG for SOC analysis?

**A:** LLMs hallucinate MITRE technique IDs and invent playbook steps. RAG retrieves actual MITRE write-ups and SOC runbooks so recommendations reference real procedures. Experiment **exp-002** (RQ1) measures whether RAG improves accuracy.

---

### Q23. What knowledge sources are in the RAG database?

**A:** Four seeded JSON documents: MITRE brute force techniques, MITRE credential access, SSH investigation playbook, password spray playbook. Ingested into `KnowledgeDocument`, chunked into `DocumentChunk`.

---

### Q24. Explain the three retrieval modes.

**A:**
- **FTS** — PostgreSQL full-text search; good for exact keywords and MITRE IDs
- **Vector** — Gemini embeddings + cosine similarity; good for semantic paraphrases
- **Hybrid** (default) — runs both in parallel, merges with Reciprocal Rank Fusion

Set via `RAG_RETRIEVER_MODE` environment variable.

---

### Q25. What is Reciprocal Rank Fusion (RRF)?

**A:** A score-free merging algorithm: `RRF_score(d) = Σ 1/(k + rank_i(d))` where k=60. Chunks appearing in both FTS and vector lists get summed scores and rank higher. Avoids normalizing incompatible score scales between retrievers.

---

### Q26. Why k=60 in RRF?

**A:** Standard constant from RRF literature (Cormack et al.). It dampens the advantage of rank-1 over rank-2 so documents ranked moderately in multiple lists can outrank a document ranked first in only one list.

---

### Q27. How are documents chunked?

**A:** Sliding window: **800 characters** per chunk, **100 characters overlap**. Overlap prevents technique definitions from being split across boundaries, which would hurt retrieval quality.

---

### Q28. What embedding model do you use?

**A:** Google `gemini-embedding-001`, 768 dimensions, batched 16 chunks at a time. Stored as JSONB arrays on `DocumentChunk.embedding`.

---

### Q29. Why JSONB instead of pgvector?

**A:** Portability — works on any Postgres without installing the pgvector extension. Our corpus is small (dozens of chunks), so in-memory cosine similarity over 200 chunks is acceptable. Trade-off: does not scale to millions of chunks without an ANN index.

---

### Q30. How is the RAG query built from logs?

**A:** Scan logs for keywords: `failed`, `password`, `brute`, `admin`, `attack`, `login`. If found, join them as the retrieval query. Otherwise use the first 200 characters of the log. This focuses retrieval on attack-relevant terms.

---

### Q31. How many chunks are retrieved and how much context is injected?

**A:** Top-K = **5** chunks. Total injected context capped at **8000 characters**, formatted as `[source] title\ncontent` per chunk.

---

### Q32. What is the difference between FTS and vector search in practice?

**A:** FTS finds "T1110.001" exactly. Vector search finds a chunk about "repeated authentication failures from a single source" even if the query says "many failed logins." Hybrid gets both.

---

### Q33. What happens if embeddings are missing?

**A:** Vector retriever returns empty list. Hybrid falls back to FTS-only results. `npm run db:embed` backfills missing embeddings.

---

### Q34. What design patterns did you use in the RAG layer?

**A:** Strategy pattern (`Retriever` interface), Factory (`getKnowledgeRetriever(mode)`), Null Object (`NullRetriever` when RAG disabled). Interfaces in `src/lib/rag/`.

---

## D. Database & PostgreSQL

### Q35. Why PostgreSQL?

**A:** Native full-text search (tsvector/GIN) for log search and RAG; JSONB for timelines, recommendations, and embeddings; mature Prisma support; Supabase provides managed hosting with connection pooling.

---

### Q36. Why two database URLs for Supabase?

**A:**
- `DATABASE_URL` — transaction pooler (port 6543, `?pgbouncer=true`) for app runtime on Vercel serverless
- `DIRECT_URL` — session pooler (port 5432) for Prisma migrations (DDL needs session-level connection)

---

### Q37. What is PgBouncer / transaction pooling?

**A:** A connection pooler that multiplexes many client connections onto fewer Postgres connections. Transaction mode releases the connection after each transaction — efficient for serverless but breaks prepared statements and migrations.

---

### Q38. Describe the main database tables.

**A:**
- `Incident` — attack record (title, type, severity, summary, status)
- `LogFile` — log content + FTS search_vector
- `Analysis` — AI output (timeline JSON, recommendations JSON, metadata)
- `KnowledgeDocument` / `DocumentChunk` — RAG knowledge + embeddings
- `user` / `session` — Better Auth (not Supabase Auth)

---

### Q39. How does log full-text search work?

**A:** `LogFile.content` has a `search_vector` tsvector column maintained by a Postgres trigger. Search uses `@@ plainto_tsquery('english', query)` with `ts_rank` for relevance and `ts_headline` for UI snippets. Scoped to the authenticated user's incidents.

---

### Q40. What is a GIN index?

**A:** Generalized Inverted Index — Postgres index type optimized for composite values like tsvector. Enables fast `@@` (containment) queries on full-text search columns.

---

### Q41. What is `plainto_tsquery`?

**A:** Converts plain text `"failed password admin"` into a tsquery `'fail' & 'password' & 'admin'` with English stemming. All terms must match (AND semantics).

---

### Q42. How do you ensure data isolation between users?

**A:** Every incident query includes `where: { userId: session.user.id }`. Log search joins `Incident` and filters `i."userId" = $userId`. Upload staging records are also user-scoped.

---

### Q43. What indexes did you add for performance?

**A:** Composite index `(userId, createdAt DESC)` on Incident for dashboard/incidents list. GIN indexes on both `search_vector` columns. Separate indexes on `severity`, `incidentId`, `userId`.

---

### Q44. How is analysis persistence atomic?

**A:** Prisma `$transaction` creates Incident + LogFile + Analysis in one transaction. If any step fails, all roll back — no orphan records.

---

## E. AI / LLM pipeline

### Q45. Why Google Gemini?

**A:** Native JSON output mode (`responseMimeType: application/json`), competitive quality on structured extraction tasks, embedding API in the same ecosystem, and generous free tier for research. OpenAI is supported as an alternative via provider factory.

---

### Q46. What model and temperature do you use?

**A:** Default `gemini-2.0-flash`, temperature **0.15** for analysis (low randomness for consistent triage). Prompt version `soc-v3-hybrid-rag` stored per Analysis record.

---

### Q47. How do you force JSON output from the LLM?

**A:** Gemini `responseMimeType: "application/json"` + system prompt defining the exact schema + Zod validation after parsing. On parse failure, retry with stricter instructions.

---

### Q48. What if Gemini returns malformed JSON?

**A:** `parse-llm-json.ts` repair pipeline: strip markdown fences, extract balanced braces, fix smart quotes and trailing commas, close truncated JSON. If still failing, orchestrator retries once with "max 15 timeline events, ONLY valid JSON" suffix.

---

### Q49. What is RAW vs STRUCTURED input format?

**A:**
- **RAW** — log text sent as-is to the LLM
- **STRUCTURED** — sshd lines parsed into typed JSON events (`failed_login`, `successful_login`, `session_opened`) before prompting

Experiment exp-003 tests which produces better accuracy (RQ2).

---

### Q50. What does the system prompt contain?

**A:** SOC analyst persona, required JSON output schema, MITRE reference guidance, prompt injection defense (untrusted logs), and optional RAG context in `<context>` tags.

---

### Q51. How do you measure LLM latency?

**A:** Wall-clock time from orchestrator start to JSON validation complete, stored as `Analysis.latencyMs`. Reported per experiment run and in research dashboard.

---

### Q52. What happens without a Gemini API key?

**A:** Orchestrator returns a placeholder stub response so the UI works for demos. Research experiments require a real key.

---

## F. Research & evaluation

### Q53. How many evaluation scenarios do you have?

**A:** **10** labeled scenarios: brute force, password spray, credential stuffing, privilege escalation, lateral movement, suspicious admin, account takeover, data exfiltration, web shell, insider threat. Each has `sample.log` + `ground-truth.json`.

---

### Q54. What is ground truth?

**A:** A JSON specification of the correct answer: expected attack type, severity, MITRE IDs, required keywords, forbidden keywords (hallucination check), minimum timeline events, recommendation themes, and required entities (users, IPs, hosts).

---

### Q55. What are the active experiments?

**A:**
- **exp-002** — RAG on vs off (RQ1)
- **exp-003** — RAW vs STRUCTURED input (RQ2)
- **exp-004** — hybrid RAG across all 10 scenarios (RQ4)
- **exp-005** — 2×2 factorial: RAG × input format (RQ7)

---

### Q56. How is attack type accuracy scored?

**A:** Exact match = 1.0; substring match = 0.75; otherwise token overlap ratio between predicted and expected attack type strings.

---

### Q57. How is hallucination rate measured?

**A:** Count how many `forbiddenKeywords` from ground truth appear in the LLM output blob. Rate = hits / total forbidden keywords. Lower is better. Example: if ground truth forbids "SQL injection" in a brute force scenario and the model mentions it, that counts as hallucination.

---

### Q58. What is analyst utility score?

**A:** `0.30×accuracy + 0.25×investigation_quality + 0.25×recommendation_quality + 0.20×(1 - hallucination_rate)` — a single number representing how useful the output would be to a human analyst.

---

### Q59. What is investigation quality?

**A:** `0.4×timeline_score + 0.3×keyword_score + 0.3×entity_recall` — measures whether the investigation narrative covers the right events, keywords, and entities from ground truth.

---

### Q60. Are LLM results deterministic?

**A:** No. Even at temperature 0.15, outputs vary slightly between runs. Baselines are single-run snapshots. Rigorous publication would require multiple runs and confidence intervals.

---

### Q61. How do you run experiments?

**A:** `npm run experiment:run` executes `scripts/run-experiment.ts` — loads config, runs each fixture through the orchestrator, computes metrics, writes JSON to `experiments/results/`. Baselines committed to `experiments/baseline/` for the public research UI.

---

### Q62. What is RQ1 and what did you find?

**A:** RQ1 asks whether hybrid RAG improves triage accuracy over no-RAG baseline (exp-002). Refer to `/research/results` for committed baseline numbers — RAG typically improves keyword, MITRE, and recommendation scores on scenarios where playbook context is relevant.

---

### Q63. Why 15 research questions?

**A:** They cover the full evaluation space: accuracy, latency, hallucination, MITRE mapping, input format, scenario difficulty, factorial interactions, and analyst utility — providing a structured research narrative beyond a single accuracy number.

---

## G. Security & auth

### Q64. How does authentication work?

**A:** Better Auth with email/password. HTTP-only session cookies. `requireSession()` on protected API routes. Middleware (`proxy.ts`) redirects unauthenticated users to `/sign-in`.

---

### Q65. Why Better Auth instead of Supabase Auth?

**A:** Single Prisma schema for users and domain data; no split identity between Supabase JWT and app user IDs; fits the server-first Next.js API route architecture.

---

### Q66. What rate limits do you enforce?

**A:** Analyze: 10/min; Upload: 20/min; Search: 30/min; Evaluate: 20/min — per user+IP, in-memory. Resets on Vercel cold start; production hardening would use Redis (Upstash).

---

### Q67. What security headers do you set?

**A:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, Content-Security-Policy, Permissions-Policy disabling camera/mic/geo.

---

### Q68. How do you prevent XSS in search results?

**A:** FTS snippets from `ts_headline` are sanitized with DOMPurify before rendering in the UI (`src/lib/sanitize.ts`).

---

### Q69. Where are API keys stored?

**A:** Server environment variables only — `GEMINI_API_KEY`, `BETTER_AUTH_SECRET`, `DATABASE_URL` never exposed as `NEXT_PUBLIC_*`.

---

## H. Infrastructure & deployment

### Q70. How is Argus deployed?

**A:** GitHub → Vercel (Next.js 16 serverless). Database on Supabase Postgres. File uploads via UploadThing (Vercel has no persistent disk). Gemini API called from API route handlers.

---

### Q71. Why UploadThing?

**A:** Vercel serverless functions have no persistent filesystem. UploadThing provides CDN-backed file storage; only the external URL/key is stored in `LogFile.storagePath`. Log content is also copied to Postgres for FTS search.

---

### Q72. What runs during Vercel build?

**A:** `prisma generate && prisma migrate deploy && next build` — database migrations apply automatically on each deploy if `DIRECT_URL` is configured.

---

### Q73. Why is dev mode slower than production?

**A:** `next dev` compiles routes on demand (Turbopack). First visit to each page can take 10–20 seconds. Production pre-builds all routes; warm requests target 200–450ms excluding Supabase RTT.

---

### Q74. How did you optimize database fetch latency?

**A:** Merged count+groupBy into single `getUserStats()`; slim column selects on list queries; composite index `(userId, createdAt DESC)`; React Query client cache (60s); server `unstable_cache` (60s); Supabase transaction pooler with pool max=3.

---

### Q75. What is CI/CD setup?

**A:** GitHub Actions on push/PR to main: `npm ci` → lint → build with dummy env vars. Validates compile; does not run live Gemini integration tests.

---

## I. Design decisions & critique

### Q76. What are the main limitations of Argus?

**A:**
1. SSH/auth log focus — limited generalization to firewall/SIEM logs
2. Small RAG corpus — 4 knowledge documents, not enterprise-scale
3. JSONB embeddings — doesn't scale beyond ~hundreds of chunks
4. In-memory rate limits — not durable on serverless
5. Best-effort PII redaction — not certified DLP
6. LLM non-determinism — results vary between runs
7. English FTS config — weaker on non-English logs

---

### Q77. What would you do differently with more time?

**A:** pgvector with HNSW index for scalable retrieval; Redis rate limiting; multi-provider LLM comparison in experiments; expand corpus to 50+ scenarios; on-prem LLM option for air-gapped deployments; automated integration tests with mocked Gemini.

---

### Q78. How do you validate that recommendations are actually useful?

**A:** `recommendation_quality` metric checks theme keyword overlap with ground truth (e.g. "block IP", "MFA", "disable account"). `analyst_utility_score` combines this with accuracy and hallucination. Qualitative review of outputs on `/research` supplements automated scores.

---

### Q79. Why temperature 0.15 and not 0?

**A:** Temperature 0 can still have provider-side variability; 0.15 allows minimal phrasing variation while keeping classifications stable. Low enough for reproducible research, not so rigid that the model fails on ambiguous logs.

---

### Q80. Is the attack chain graph real or mock?

**A:** The investigation workspace attack chain visualization uses structured data from the analysis. Some workspace sections use enriched/mock data for demonstration when the analyze API returns minimal structure — the research evaluation uses the actual API output, not mock data.

---

### Q81. How does Argus handle false positives?

**A:** Argus is a **decision support tool**, not an autonomous blocker. Analysts review AI output before action. Severity and attack type are suggestions. The investigation workspace is designed for human verification. False positive rate is not yet a formal metric but could be added with benign log fixtures.

---

### Q82. What ethical considerations apply?

**A:** (1) Do not upload real PII to public demo; (2) LLM bias may misclassify attacks on underrepresented log formats; (3) Over-reliance on AI triage without human review is dangerous; (4) Data sent to Google API even after redaction requires user consent in enterprise settings.

---

## J. Quick-fire technical round

| Question | Short answer |
|----------|--------------|
| ORM? | Prisma 7 with pg adapter |
| Auth library? | Better Auth |
| Default LLM? | gemini-2.0-flash |
| Embedding dims? | 768 |
| RAG top-K? | 5 |
| Chunk size? | 800 chars, 100 overlap |
| RRF k? | 60 |
| Prompt version? | soc-v3-hybrid-rag |
| Scenarios? | 10 |
| Research questions? | 15 |
| Cache TTL? | 60 seconds |
| Max log size? | 1 MB |
| Analyze rate limit? | 10/min |
| Pooler port? | 6543 (app), 5432 (migrations) |
| License? | MIT |

---

## K. Demo walkthrough script (if mentor asks live demo)

1. Open https://argus-gules.vercel.app — explain landing page value proposition
2. Sign in → **Dashboard** — severity stat cards, recent analyses, incident list
3. **Upload** — paste sample SSH log or upload `.log` file → analyze with RAG on
4. View generated incident — attack type, severity, timeline, recommendations
5. Open **Investigation workspace** — attack chain, MITRE section, timeline
6. **Incidents** — filter by severity (note instant switch from client cache)
7. **Log search** — FTS query across stored logs
8. **Research** — show 10 scenarios, experiment results, RQ1–RQ15
9. Mention GitHub source, MIT license, PII redaction, reproducible experiments

---

## L. Questions to ask YOUR mentor (shows maturity)

1. How would you evaluate false positive rate for a triage tool in a real SOC?
2. Is RRF the right fusion method vs learned re-rankers for security knowledge retrieval?
3. What ground truth annotation process would you trust for publishing LLM security benchmarks?
4. Would you deploy this as decision support or require human-in-the-loop for all actions?

---

*Last updated: June 2026 — matches Argus commit on `main` with hybrid RAG, PII redaction, incidents caching, and Vercel production deployment.*
