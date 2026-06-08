import { Pool } from "pg";

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined;
};

export function getPgPool(): Pool {
  if (!globalForPool.pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    const useSsl =
      connectionString.includes("supabase.com") ||
      connectionString.includes("sslmode=require") ||
      process.env.DATABASE_SSL === "true";

    const usesPgBouncer =
      connectionString.includes("pgbouncer=true") ||
      connectionString.includes(":6543");

    globalForPool.pool = new Pool({
      connectionString,
      // Supabase transaction pooler: keep connections low per serverless instance.
      max: Number(
        process.env.DATABASE_POOL_MAX ?? (usesPgBouncer ? 3 : 10),
      ),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  }

  return globalForPool.pool;
}
