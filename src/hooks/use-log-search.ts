"use client";

import { useQuery } from "@tanstack/react-query";
import type { LogSearchResponse } from "@/types/search";

async function searchLogs(
  query: string,
  limit = 20,
): Promise<LogSearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`/api/logs/search?${params}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Search failed");
  }
  return res.json() as Promise<LogSearchResponse>;
}

export function useLogSearch(query: string, enabled = true) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["log-search", trimmed],
    queryFn: () => searchLogs(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
  });
}
