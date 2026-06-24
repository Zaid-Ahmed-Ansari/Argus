# Security Architecture

## 1. Threat model (what Argus defends against)

| Threat | Mitigation |
|--------|------------|
| Unauthenticated access | Better Auth sessions; `requireSession()` on protected APIs |
| Cross-user data access | All queries scoped by `userId` |
| API abuse / cost explosion | Rate limiting per endpoint |
| Prompt injection via logs | `<untrusted_logs>` wrapper + system prompt instruction |
| XSS in search snippets | DOMPurify sanitization |
| PII leakage to LLM/DB | Regex redaction before storage and inference |
| CSRF | Better Auth trusted origins |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |

### Out of scope / known limitations

- Not a certified SIEM or DLP product
- Rate limits are **in-memory** (reset on Vercel cold start)
- PII redaction is best-effort, not exhaustive
- Logs still sent to Google Gemini API after redaction

---

## 2. Authentication (Better Auth)

### Why Better Auth, not Supabase Auth?

- Single Prisma schema for users + incidents + RAG
- Server-first API route pattern fits Next.js App Router
- No split between Supabase Auth JWT and app database user IDs

### Session model

- HTTP-only cookies (not localStorage tokens)
- `requireSession()` reads session from request headers via Better Auth API
- React `cache()` deduplicates session reads per request

### Password policy

- Minimum 8 characters (Zod validation)
- Email/password sign-up and sign-in

### Trusted origins

`BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, Vercel preview URL — prevents CSRF from unknown origins.

**Files:** `src/lib/auth.ts`, `src/lib/auth-session.ts`, `src/lib/auth-origins.ts`

---

## 3. Authorization

Every protected resource checks `session.user.id`:

- `Incident` queries: `where: { userId }`
- Log search: `AND i."userId" = $userId`
- Upload staging: `LogUpload.userId`

### Public routes (no auth)

- `/`, `/sign-in`, `/sign-up`
- `/research/*` (read-only research dashboard)
- `/api/auth/*`, `/api/experiments/results`

---

## 4. Rate limiting

**File:** `src/lib/rate-limit.ts` — in-memory sliding window per key.

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/analyze` | 10 | 1 minute |
| Upload | 20 | 1 minute |
| Log search | 30 | 1 minute |
| Evaluate | 20 | 1 minute |

Key format: `{endpoint}:{userId}:{clientIp}`

**Production note:** Docs recommend Upstash Redis for persistent rate limits across serverless instances.

---

## 5. Input validation

All API bodies validated with **Zod** schemas:

| Route | Validator |
|-------|-----------|
| Analyze | `analyzeRequestSchema` — logs or uploadId, usedRag boolean |
| Incidents list | `incidentsQuerySchema` — severity enum, limit, offset |
| Incident by ID | `incidentIdSchema` — CUID pattern |

### Size limits

- Max log size: **1 MB** / **1,000,000 characters**
- Upload file types: `.log`, `.txt`, `.csv` only
- MIME whitelist on upload

---

## 6. PII redaction

**File:** `src/utils/redact-pii.ts`

Applied in:

1. `log-file-storage.service.ts` — before `LogFile.content` INSERT
2. `analyze-incident.service.ts` — before LLM prompt

### Patterns redacted

Emails, IPv4/IPv6, auth usernames, SSN, credit cards, phones, JWTs, MACs, PEM blocks.

Replacement tokens: `[REDACTED_EMAIL]`, `[REDACTED_IP]`, etc.

---

## 7. Security headers

**File:** `src/proxy.ts` (Next.js middleware)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: (restricts scripts; allows UploadThing domains)
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 8. Secrets management

| Secret | Storage |
|--------|---------|
| `GEMINI_API_KEY` | Server env only — never `NEXT_PUBLIC_*` |
| `BETTER_AUTH_SECRET` | Min 32 chars, Zod validated |
| `DATABASE_URL` | Server env only |
| `UPLOADTHING_TOKEN` | Server env only |

`.env.example` documents all variables. `SECURITY.md` has responsible disclosure policy.

---

## 9. API response caching headers

`jsonSuccess()` sets `Cache-Control: no-store` — API responses are not cached by browsers/CDN (user-specific data).

Server-side `unstable_cache` is separate (Next.js data cache, not HTTP cache).

---

## 10. Upload security

- UploadThing in production (Vercel has no persistent disk)
- Local filesystem in Docker dev (`storage/uploads/`)
- Files scanned by extension/MIME only (no antivirus integration)
- Staging uploads auto-deleted after 24 hours if not analyzed

---

## 11. Key file paths

| Topic | Path |
|-------|------|
| Auth config | `src/lib/auth.ts` |
| Session helper | `src/lib/auth-session.ts` |
| Middleware | `src/proxy.ts` |
| Rate limit | `src/lib/rate-limit.ts` |
| PII redaction | `src/utils/redact-pii.ts` |
| Sanitize (XSS) | `src/lib/sanitize.ts` |
| Env validation | `src/lib/env.ts` |
| Security policy | `SECURITY.md` |
