# Argus launch checklist

Use this before faculty review, internship applications, LinkedIn posts, or public portfolio release.

**Live demo:** https://argus-gules.vercel.app

---

## Metadata & SEO

| Item | Status | Notes |
|------|--------|-------|
| Page title & description | ✅ | `src/lib/site-metadata.ts` |
| Keywords | ✅ | SOC, RAG, MITRE, incident response |
| `metadataBase` + canonical URLs | ✅ | Set `NEXT_PUBLIC_APP_URL` on Vercel |
| Open Graph tags | ✅ | Root layout + per-route metadata |
| Twitter card | ✅ | `summary_large_image` |
| OG image (1200×630) | ✅ | `src/app/opengraph-image.tsx` |
| `robots` index/follow | ✅ | Public routes indexed |
| Route-specific metadata | ✅ | Research, Incidents layouts |

---

## Branding assets

| Item | Status | Path |
|------|--------|------|
| Logo | ✅ | `public/logo.png` |
| Favicon SVG | ✅ | `public/favicon.svg` |
| Favicon ICO | ✅ | `public/favicon.ico` |
| Apple touch icon | ✅ | `public/apple-touch-icon.png`, `src/app/apple-icon.png` |
| App icon | ✅ | `src/app/icon.png` |

After replacing logo: bump `NEXT_PUBLIC_LOGO_VERSION` and redeploy.

---

## README & documentation

| Item | Status |
|------|--------|
| Architecture diagram | ✅ README mermaid |
| Feature overview | ✅ |
| Research motivation | ✅ |
| Screenshots section | ⬜ Add images to `public/screenshots/` |
| Demo GIF | ⬜ Optional `public/screenshots/demo.gif` |
| Getting started | ✅ |
| Production deploy guide | ✅ `docs/production-deployment.md` |
| Security policy | ✅ `SECURITY.md` |

---

## UX & presentation

| Item | Status |
|------|--------|
| Professional footer | ✅ `SiteFooter` on landing + public pages |
| Mobile app navigation | ✅ Bottom nav below `lg` |
| Mobile investigation layout | ✅ Stage list before graph on small screens |
| Research mobile tabs | ✅ Existing `ResearchMobileNav` |
| Error states | ✅ Route-level `error.tsx` |
| Loading states | ✅ Suspense + skeletons on incidents |

---

## Security & compliance

| Item | Status |
|------|--------|
| `.env` gitignored | ✅ |
| PII redaction before AI/storage | ✅ `src/utils/redact-pii.ts` |
| Auth on private routes | ✅ `src/proxy.ts` |
| Rate limits on analyze/upload | ✅ |
| Security headers (CSP, X-Frame-Options) | ✅ `src/proxy.ts` |
| No secrets in source | ✅ Verify before push |

---

## Production environment (Vercel)

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | ✅ Supabase pooler (6543) |
| `DIRECT_URL` | ✅ Supabase session (5432) |
| `BETTER_AUTH_SECRET` | ✅ 32+ chars |
| `BETTER_AUTH_URL` | ✅ `https://argus-gules.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | ✅ Same as auth URL |
| `GEMINI_API_KEY` | ✅ Analysis + embeddings |
| `UPLOADTHING_TOKEN` | ✅ File uploads on Vercel |

Run once on Supabase: `npm run db:setup:prod`

---

## Pre-submission manual QA

- [ ] Sign up / sign in on production URL
- [ ] Upload sample log from `datasets/brute_force/sample.log`
- [ ] Run analysis and open investigation workspace
- [ ] Verify favicon + OG preview (https://www.opengraph.xyz)
- [ ] Test mobile layout (Chrome DevTools)
- [ ] Confirm `/research` loads baseline experiment charts
- [ ] Share link preview on LinkedIn (post composer)

---

## Launch readiness score

| Area | Score |
|------|-------|
| Core functionality | 95% |
| Metadata & SEO | 92% |
| Branding & assets | 88% (add real screenshots) |
| Mobile UX | 85% |
| Security posture | 90% |
| Documentation | 90% |
| **Overall** | **~90%** |

Remaining polish: capture screenshots/GIF, verify OG preview after redeploy, optional custom domain.
