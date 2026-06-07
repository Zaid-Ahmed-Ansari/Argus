import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ExperimentConfig } from "@/types/experiment";

const CONFIG_FILES = [
  "rag-vs-no-rag.json",
  "raw-vs-structured.json",
  "scenario-benchmark.json",
  "rag-input-combined.json",
] as const;

export async function loadExperimentConfigs(): Promise<ExperimentConfig[]> {
  const configsDir = path.join(process.cwd(), "experiments", "configs");

  const configs = await Promise.all(
    CONFIG_FILES.map(async (file) => {
      const content = await readFile(path.join(configsDir, file), "utf-8");
      return JSON.parse(content) as ExperimentConfig;
    }),
  );

  return configs;
}
