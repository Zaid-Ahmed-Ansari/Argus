import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import {
  LEGACY_RESEARCH_CACHE_TAG,
  RESEARCH_CACHE_SECONDS,
  RESEARCH_CACHE_TAG,
} from "@/lib/argus-research/cache";
import type {
  IncidentSample,
  ResearchAggregates,
} from "@/lib/argus-research/types";
import { RESEARCH_DATA_VERSION } from "@/lib/argus-research/types";

const RESEARCH_ROOT = path.join(process.cwd(), "research", "argus-v2");

async function readAggregatesFile(): Promise<ResearchAggregates> {
  const raw = await readFile(
    path.join(RESEARCH_ROOT, "aggregates.json"),
    "utf8",
  );
  return JSON.parse(raw) as ResearchAggregates;
}

export const loadAggregates = unstable_cache(
  readAggregatesFile,
  ["argus-research-aggregates", String(RESEARCH_DATA_VERSION)],
  {
    revalidate: RESEARCH_CACHE_SECONDS,
    tags: [RESEARCH_CACHE_TAG],
  },
);

async function readSamplesDir(): Promise<IncidentSample[]> {
  const dir = path.join(RESEARCH_ROOT, "samples");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const samples = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(dir, file), "utf8");
      return JSON.parse(raw) as IncidentSample;
    }),
  );
  return samples.sort((a, b) =>
    `${a.variant}-${a.category}`.localeCompare(`${b.variant}-${b.category}`),
  );
}

export const loadSampleIncidents = unstable_cache(
  readSamplesDir,
  ["argus-research-samples", String(RESEARCH_DATA_VERSION)],
  {
    revalidate: RESEARCH_CACHE_SECONDS,
    tags: [RESEARCH_CACHE_TAG],
  },
);

export async function loadLegacySnapshot() {
  const { getResearchSnapshot } = await import("@/lib/research-snapshot");
  return unstable_cache(
    getResearchSnapshot,
    ["argus-research-legacy-snapshot"],
    {
      revalidate: RESEARCH_CACHE_SECONDS,
      tags: [LEGACY_RESEARCH_CACHE_TAG],
    },
  )();
}
