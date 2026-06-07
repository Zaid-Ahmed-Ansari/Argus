// Prisma 7: connection URLs live here, not in schema.prisma.
// CLI (migrate, db push) uses DIRECT_URL — required for Supabase (non-pooled).
// App runtime uses DATABASE_URL via @/lib/pg-pool (pooled on Supabase).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
