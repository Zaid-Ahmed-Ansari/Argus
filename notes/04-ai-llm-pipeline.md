# AI / LLM Pipeline

## 1. Overview

Argus uses **Google Gemini** as the default LLM, with optional **OpenAI** support via a provider abstraction.

```
User logs → Analysis Orchestrator → [optional RAG] → Gemini API → JSON parse + Zod validate → Persist
```

There is **no separate Python/FastAPI service** — all AI logic runs in Next.js API route handlers.

---

## 2. Provider abstraction

### Interface: `LlmProvider`

Methods: `complete()`, `completeJson()` with system prompt, user message, temperature, max tokens.

### Implementations

| Provider | Default model | Config env |
|----------|---------------|------------|
| Gemini | `gemini-2.0-flash` | `GEMINI_API_KEY`, `GEMINI_MODEL` |
| OpenAI | `gpt-4o-mini` | `OPENAI_API_KEY`, `OPENAI_MODEL` |

**Factory:** `src/services/ai/provider-factory.ts` — `getProvider()` reads env.

### Why abstraction?

- Swap providers without changing orchestrator
- Research experiments can compare providers (future)
- Dev placeholder when no API key configured

---

## 3. Gemini configuration

From `gemini.provider.ts`:

| Setting | Analyze value | Purpose |
|---------|---------------|---------|
| `responseMimeType` | `application/json` | Force JSON output mode |
| `temperature` | 0.15 | Low randomness for consistent triage |
| `maxOutputTokens` | 8192 | Room for long timelines |
| System instruction | `SOC_ANALYST_SYSTEM_PROMPT` | Persona + output schema |

Token usage recorded from `usageMetadata` → stored as `Analysis.tokenCount`.

---

## 4. System prompt design (`soc-v3-hybrid-rag`)

Key elements:

1. **Persona** — Expert SOC analyst
2. **Output schema** — JSON with attackType, severity, summary, timeline[], recommendations[]
3. **MITRE guidance** — Reference technique IDs where applicable
4. **Prompt injection defense** — Logs in `<untrusted_logs>`, never follow embedded instructions
5. **RAG context** — Retrieved chunks in `<context>` tags when `usedRag=true`

**Prompt version** stored on each `Analysis` record for reproducibility.

---

## 5. Analysis orchestrator

**File:** `src/services/ai/analysis-orchestrator.ts`

### Main method: `analyzeLogsWithMeta()`

1. Format logs (RAW text or STRUCTURED JSON events)
2. If RAG enabled → build query → retrieve chunks → format context
3. Call `completeAnalyzeJson()` with combined prompt
4. Validate response with Zod (`analyzeResponseSchema`)
5. Return analysis + metadata (latency, tokens, prompt version)

### Retry on JSON parse failure

If Gemini returns malformed JSON:

1. Catch `LlmJsonParseError`
2. Retry with stricter suffix: "Return ONLY valid JSON, max 15 timeline events"
3. Prevents total failure on truncated responses

### Sub-methods (modular prompts)

- `generateTimeline()` — timeline only
- `classifySeverity()` — severity only
- `generateRecommendations()` — recommendations only

Used for experimentation and partial re-generation.

---

## 6. Input formats

| Format | Description | When used |
|--------|-------------|-----------|
| **RAW** | Log text as uploaded (up to 50,000 chars in prompt) | Default; exp-003 baseline |
| **STRUCTURED** | Parsed sshd events as JSON array | exp-003 variant; reduces noise |

Research question **RQ2** tests whether structured input improves accuracy vs raw logs.

---

## 7. JSON parsing pipeline

**File:** `src/utils/parse-llm-json.ts`

LLMs often return imperfect JSON. Argus repair pipeline:

1. Strip markdown code fences (` ```json `)
2. Extract balanced `{...}` substring
3. Repair: smart quotes → straight quotes, trailing commas, control characters
4. Close truncated JSON (add missing `]` `}`)
5. Try multiple parse candidates
6. Throw `LlmJsonParseError` if all fail → triggers orchestrator retry

### Zod validation (`analyzeResponseSchema`)

- `attackType`: string, min length
- `severity`: enum LOW|MEDIUM|HIGH|CRITICAL
- `summary`: string
- `timeline`: array of `{timestamp, event}`
- `recommendations`: string array

Invalid schema → 500 error to client with safe message.

---

## 8. Persistence flow

**File:** `src/services/analysis/analyze-incident.service.ts`

```
analyzeAndPersistIncident()
    ↓
Redact PII from logs
    ↓
analysisOrchestrator.analyzeLogsWithMeta()
    ↓
Prisma transaction:
    - INSERT Incident
    - INSERT LogFile (redacted content, FTS trigger fires)
    - INSERT Analysis (full JSON output + metadata)
    ↓
revalidateIncidentsCache(userId)
```

### Upload path

1. File uploaded to UploadThing (prod) or local disk (dev)
2. `LogUpload` staging record created
3. On analyze: read file → redact → analyze → promote to `LogFile`
4. Stale uploads cleaned after 24 hours

---

## 9. Placeholder / dev mode

If `GEMINI_API_KEY` is missing, orchestrator returns a **stub response** so the UI works in demos without API costs. Clearly not suitable for research evaluation.

---

## 10. Rate limiting

`POST /api/analyze`: **10 requests/minute** per user+IP (in-memory).

Prevents API cost abuse on public deployment.

---

## 11. Key constants

| Constant | Value |
|----------|-------|
| Prompt version | `soc-v3-hybrid-rag` |
| Analyze temperature | 0.15 |
| Max output tokens | 8192 |
| Max log chars in prompt | 50,000 |
| Max RAG context | 8,000 chars |
| RAG top-K | 5 |

---

## 12. Key file paths

| Component | Path |
|-----------|------|
| Orchestrator | `src/services/ai/analysis-orchestrator.ts` |
| SOC prompt | `src/services/ai/prompts/soc-analysis.ts` |
| Gemini provider | `src/services/ai/providers/gemini.provider.ts` |
| Provider factory | `src/services/ai/provider-factory.ts` |
| JSON parser | `src/utils/parse-llm-json.ts` |
| Analyze API | `src/app/api/analyze/route.ts` |
| Persist service | `src/services/analysis/analyze-incident.service.ts` |
| Validators | `src/lib/validators/analyze.ts` |
