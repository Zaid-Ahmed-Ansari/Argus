import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    UPLOADTHING_TOKEN: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  OPENAI_API_KEY: z.string().optional(),
  AI_DEFAULT_PROVIDER: z.enum(["gemini", "openai"]).default("gemini"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  RAG_RETRIEVER_MODE: z.enum(["fts", "vector", "hybrid"]).default("hybrid"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== "production") return;

    if (!data.GEMINI_API_KEY?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["GEMINI_API_KEY"],
        message: "GEMINI_API_KEY is required in production",
      });
    }

    if (!data.UPLOADTHING_TOKEN?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["UPLOADTHING_TOKEN"],
        message:
          "UPLOADTHING_TOKEN is required in production (Vercel has no persistent disk)",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_DEFAULT_PROVIDER: process.env.AI_DEFAULT_PROVIDER ?? "gemini",
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    GEMINI_EMBEDDING_MODEL:
      process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001",
    RAG_RETRIEVER_MODE:
      (process.env.RAG_RETRIEVER_MODE as "fts" | "vector" | "hybrid") ??
      "hybrid",
    NODE_ENV: process.env.NODE_ENV ?? "development",
  });

  if (!result.success) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Invalid environment: ${JSON.stringify(result.error.flatten().fieldErrors)}`,
      );
    }
    console.warn("Environment validation warnings:", result.error.flatten());
    return envSchema.parse({
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://postgres:postgres@localhost:5432/argus",
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ??
        "dev-only-secret-min-32-chars-long!!",
      BETTER_AUTH_URL:
        process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      AI_DEFAULT_PROVIDER: process.env.AI_DEFAULT_PROVIDER ?? "gemini",
      OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      GEMINI_EMBEDDING_MODEL:
        process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001",
      RAG_RETRIEVER_MODE:
        (process.env.RAG_RETRIEVER_MODE as "fts" | "vector" | "hybrid") ??
        "hybrid",
      NODE_ENV: process.env.NODE_ENV ?? "development",
    });
  }

  return result.data;
}

export const env = parseEnv();
