# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` branch | Yes |
| Older tags / forks | Best effort |

## Reporting a vulnerability

**Do not open public GitHub issues for security vulnerabilities.**

If you discover a security issue in [Argus](https://github.com/Zaid-Ahmed-Ansari/Argus), please report it privately:

1. Open a [GitHub Security Advisory](https://github.com/Zaid-Ahmed-Ansari/Argus/security/advisories/new) (preferred), or
2. Contact the maintainer via GitHub with a clear description, reproduction steps, and impact assessment.

We aim to acknowledge reports within **72 hours** and provide a fix or mitigation plan within **14 days** for confirmed issues.

## Security practices in this project

- **Secrets** — API keys and database credentials belong in environment variables only (`.env`, never committed)
- **Authentication** — Better Auth with HTTP-only session cookies; protected routes enforced in `src/proxy.ts`
- **Uploads** — UploadThing in production (no local disk on Vercel); file type and size limits on upload routes
- **AI payloads** — Log content is sent to Google Gemini for analysis; do not upload real PII/production logs to public deployments without redaction
- **Dependencies** — Run `npm audit` periodically; CI runs on pushes to `main`

## Scope

The following are **out of scope** for this repository:

- Vulnerabilities in third-party services (Vercel, Supabase, UploadThing, Google Gemini)
- Social engineering or physical attacks
- Denial-of-service against deployed instances without a reproducible application-level flaw

## Safe harbor

We appreciate responsible disclosure. Reporters acting in good faith will not face legal action for discovery methods that comply with this policy.
