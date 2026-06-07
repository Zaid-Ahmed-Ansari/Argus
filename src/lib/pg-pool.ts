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

    globalForPool.pool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  }

  return globalForPool.pool;
}
