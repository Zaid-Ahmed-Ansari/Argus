import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CATEGORIES = [
  "Benign Activity",
  "Brute Force",
  "Password Spray",
  "Credential Stuffing",
  "Reconnaissance",
  "Privilege Escalation",
  "Defense Evasion",
  "Malware Execution",
  "Data Exfiltration",
  "Insider Threat",
] as const;

const VARIANTS = [
  { key: "raw", file: "argus_raw_v2.jsonl" },
  { key: "condensed", file: "argus_condensed_v2.jsonl" },
  { key: "rag", file: "argus_rag_v2.jsonl" },
] as const;

const JSONL_ROOT =
  process.env.ARGUS_JSONL_ROOT ??
  path.join(
    process.cwd(),
    "..",
    "Argus Qwen training",
    "Argus Model Train",
    "datasets",
  );

const OUT_DIR = path.join(process.cwd(), "research", "argus-v2", "samples");

type JsonlRecord = {
  messages: { role: string; content: string }[];
  metadata: {
    scenario_id: string;
    category: string;
    split: string;
    variant: string;
    source_count: number;
    sources: string[];
  };
};

async function extractSamples() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const variant of VARIANTS) {
    const filePath = path.join(JSONL_ROOT, variant.file);
    const text = await readFile(filePath, "utf8");
    const lines = text.split("\n").filter(Boolean);

    for (const category of CATEGORIES) {
      const record = lines
        .map((line) => JSON.parse(line) as JsonlRecord)
        .find(
          (r) =>
            r.metadata.category === category && r.metadata.split === "train",
        );

      if (!record) {
        console.warn(`No train sample for ${variant.key} / ${category}`);
        continue;
      }

      const userMsg = record.messages.find((m) => m.role === "user");
      const assistantMsg = record.messages.find((m) => m.role === "assistant");
      const slug = category.toLowerCase().replace(/\s+/g, "-");

      const sample = {
        category,
        variant: variant.key,
        scenarioId: record.metadata.scenario_id,
        sources: record.metadata.sources,
        sourceCount: record.metadata.source_count,
        userContentPreview: (userMsg?.content ?? "").slice(0, 1200),
        label: assistantMsg?.content ?? "",
      };

      await writeFile(
        path.join(OUT_DIR, `${variant.key}-${slug}.json`),
        JSON.stringify(sample, null, 2),
      );
    }
  }

  console.log(`Wrote samples to ${OUT_DIR}`);
}

extractSamples().catch((err) => {
  console.error(err);
  process.exit(1);
});
