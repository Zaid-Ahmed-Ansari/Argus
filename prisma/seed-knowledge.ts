import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ingestKnowledgeDocument } from "../src/services/rag/knowledge-ingestion.service";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/argus";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const KNOWLEDGE_FILES = [
  "mitre-brute-force.json",
  "mitre-credential-access.json",
  "soc-password-spray.json",
  "soc-ssh-investigation.json",
];

async function main() {
  for (const file of KNOWLEDGE_FILES) {
    const filePath = path.join(process.cwd(), "datasets", "knowledge", file);
    const raw = await readFile(filePath, "utf-8");
    const doc = JSON.parse(raw) as {
      source: string;
      title: string;
      content: string;
      metadata?: Record<string, string>;
    };

    const id = await ingestKnowledgeDocument(doc);
    console.log(`Ingested knowledge document: ${doc.title} (${id})`);
  }
}

main()
  .catch((error: unknown) => {
    console.error("Knowledge seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
