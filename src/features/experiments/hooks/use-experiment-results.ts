"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExperimentConfig } from "@/types/experiment";

async function fetchExperimentConfigs(): Promise<ExperimentConfig[]> {
  const configs = await Promise.all([
    fetch("/experiments/configs/rag-vs-no-rag.json").then((r) => r.json()),
    fetch("/experiments/configs/raw-vs-structured.json").then((r) => r.json()),
  ]);
  return configs as ExperimentConfig[];
}

export function useExperimentConfigs() {
  return useQuery({
    queryKey: ["experiment-configs"],
    queryFn: fetchExperimentConfigs,
  });
}
