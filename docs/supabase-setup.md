# Supabase Setup — Argus

Argus uses **Supabase as managed PostgreSQL** and **Better Auth** for application authentication. This is an intentional, production-grade split.

---

## Why Supabase Postgres + Better Auth (not Supabase Auth)

| Approach | Verdict for Argus |
|----------|-------------------|
| **Supabase Postgres + Better Auth** (current) | **Recommended** — already integrated; users/sessions live in your Prisma schema alongside incidents and RAG data |
| **Supabase Auth** | Large migration: replace middleware, sign-in UI, session checks, and user tables; split identity between `auth.users` and Prisma |

Supabase Auth shines when you rely on **Row Level Security (RLS)** and query Postgres directly from the browser with the Supabase client. Argus is a **Next.js server-first app**: Prisma owns the schema, API routes enforce auth, and Gemini keys never touch the client. Better Auth fits that model.

You still get Supabase benefits: backups, pooling, dashboard, and a standard Postgres host.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a region close to your Vercel deployment
3. Save the database password securely

---

## 2. Get connection strings

In Supabase → **Project Settings** → **Database** → **Connection string**:

### `DATABASE_URL` — app runtime (Vercel / serverless)

Use the **Transaction pooler** (port **6543**):

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

- Mode: **Transaction**
- Required for Prisma + serverless (short-lived connections)
- Set as `DATABASE_URL` in Vercel **and** local `.env` when testing against Supabase

### `DIRECT_URL` — migrations only

Use the **Session pooler** (port **5432**) or **Direct connection**:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

- Set as `DIRECT_URL` in Vercel and local `.env`
- Used by `prisma migrate deploy` (cannot run through transaction pooler)

| Variable | Used by | Pooler mode |
|----------|---------|-------------|
| `DATABASE_URL` | App (`pg` pool, Prisma queries) | Transaction (6543) |
| `DIRECT_URL` | `prisma migrate deploy` | Session (5432) or Direct |

---

## 3. Configure `.env`

```bash
DATABASE_URL="postgresql://postgres.[ref]:[pw]@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pw]@...pooler.supabase.com:5432/postgres"
BETTER_AUTH_SECRET="..."   # openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GEMINI_API_KEY="..."
UPLOADTHING_TOKEN="..."    # required for production uploads
```

For **local Postgres**, set `DATABASE_URL` and `DIRECT_URL` to the same local URL.

---

## 4. Run migrations and seed

From the project root:

```bash
npm run db:migrate:deploy
npm run db:seed:knowledge
npm run db:embed
```

Or in one step:

```bash
npm run db:setup:prod
```

`db:embed` calls Gemini — run it from your machine with `GEMINI_API_KEY` set.

---

## 5. Vercel environment variables

Set for **Production** and **Preview**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Transaction pooler (6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Session pooler (5432) |
| `BETTER_AUTH_SECRET` | Same secret as local (min 32 chars) |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same HTTPS URL |
| `GEMINI_API_KEY` | Google AI Studio key |
| `UPLOADTHING_TOKEN` | UploadThing dashboard |
| `DATABASE_POOL_MAX` | `10` |

Vercel build runs `prisma migrate deploy` via `vercel-build`. Prisma 7 reads `DIRECT_URL` from `prisma.config.ts` (not `schema.prisma`).

---

## 6. Verify

```bash
# Tables exist
npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname='public' LIMIT 5;"

# App smoke test
npm run dev
# → Sign up at /sign-up
# → Upload logs, run analysis
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `prepared statement "s0" already exists` | `DATABASE_URL` must use transaction pooler with `?pgbouncer=true` |
| Migration fails on Vercel | Ensure `DIRECT_URL` is set (session/direct, not transaction pooler) |
| `SSL connection required` | Connection string should target `*.supabase.com`; pool auto-enables SSL |
| Auth cookies fail in production | `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match your HTTPS domain |

---

## Security notes (public repo)

- Never commit `.env` or Supabase service-role keys
- Only `DATABASE_URL` and `DIRECT_URL` (database password) belong in server env — not `NEXT_PUBLIC_*`
- Supabase **anon** and **service_role** keys are for Supabase Auth/Client SDK — Argus does not need them with Better Auth
