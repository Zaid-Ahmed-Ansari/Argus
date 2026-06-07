"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AnalyzeResponse } from "@/types/api";

type AnalyzeInput = {
  logs?: string;
  uploadId?: string;
  usedRag?: boolean;
};

async function analyzeLogs(
  input: AnalyzeInput,
): Promise<AnalyzeResponse & { incidentId?: string }> {
  const body: AnalyzeInput = { usedRag: input.usedRag };
  if (input.uploadId) {
    body.uploadId = input.uploadId;
  } else if (input.logs) {
    body.logs = input.logs;
  }

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Analysis failed");
  }
  return res.json() as Promise<AnalyzeResponse & { incidentId?: string }>;
}

export function useAnalyzeLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyzeLogs,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["log-search"] });
    },
  });
}
