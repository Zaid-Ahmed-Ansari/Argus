import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/argus";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SAMPLE_LOG_PATH = path.join(
  process.cwd(),
  "datasets",
  "sample-auth-bruteforce.log",
);

async function main() {
  const existing = await prisma.incident.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} incident(s) already exist.`);
    return;
  }

  const logContent = await readFile(SAMPLE_LOG_PATH, "utf-8");
  const lineCount = logContent.split("\n").filter(Boolean).length;

  const incident = await prisma.incident.create({
    data: {
      title: "Incident — Brute Force Attack",
      attackType: "Brute Force",
      severity: "HIGH",
      summary:
        "Multiple failed SSH login attempts against admin and root accounts from 192.168.1.50, 192.168.1.51, and 10.0.0.99 followed by a successful admin login.",
      status: "INVESTIGATING",
    },
  });

  await prisma.logFile.create({
    data: {
      incidentId: incident.id,
      filename: "sample-auth-bruteforce.log",
      logType: "AUTH",
      content: logContent,
      lineCount,
    },
  });

  await prisma.analysis.create({
    data: {
      incidentId: incident.id,
      provider: "GEMINI",
      usedRag: false,
      inputFormat: "RAW",
      attackType: "Brute Force",
      severity: "HIGH",
      summary:
        "Potential brute-force attack detected. 8 failed login attempts across 3 source IPs targeting admin and root. Successful admin authentication from 192.168.1.50 at 12:04:01.",
      timeline: [
        {
          timestamp: "2025-06-04T12:01:03Z",
          event: "Failed login attempt for admin from 192.168.1.50",
          source: "sshd",
        },
        {
          timestamp: "2025-06-04T12:02:01Z",
          event: "Failed login attempts for root from 10.0.0.99",
          source: "sshd",
        },
        {
          timestamp: "2025-06-04T12:04:01Z",
          event: "Successful admin login from 192.168.1.50",
          source: "sshd",
        },
      ],
      recommendations: [
        "Verify whether the successful admin login was legitimate",
        "Check MFA status for the admin account",
        "Review firewall rules for source IPs 192.168.1.50, 192.168.1.51, 10.0.0.99",
        "Search for privilege escalation activity after 12:04:01",
      ],
      modelVersion: "seed",
      promptVersion: "seed-v1",
      latencyMs: 0,
    },
  });

  console.log(`Seeded incident: ${incident.id}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
