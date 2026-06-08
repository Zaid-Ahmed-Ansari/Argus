"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { IncidentsListData } from "@/services/incidents/get-incidents-list-data";
import { INCIDENTS_CACHE_SECONDS } from "@/lib/incident-cache";
import type { SeverityLevel } from "@/types/incident";

export const INCIDENTS_LIST_QUERY_KEY = "incidents-list";

const SEVERITY_FILTERS: Array<SeverityLevel | "ALL"> = [
  "ALL",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export function incidentsListQueryKey(
  severity: SeverityLevel | undefined,
  offset: number,
  limit: number,
) {
  return [INCIDENTS_LIST_QUERY_KEY, severity ?? "ALL", offset, limit] as const;
}

type FetchIncidentsListParams = {
  severity?: SeverityLevel;
  offset: number;
  limit: number;
};

async function fetchIncidentsList(
  params: FetchIncidentsListParams,
): Promise<IncidentsListData> {
  const search = new URLSearchParams();
  if (params.severity) {
    search.set("severity", params.severity);
  }
  search.set("limit", String(params.limit));
  search.set("offset", String(params.offset));

  const res = await fetch(`/api/incidents?${search.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to load incidents");
  }

  return res.json() as Promise<IncidentsListData>;
}

type UseIncidentsListOptions = {
  severity?: SeverityLevel;
  offset: number;
  limit: number;
  /** Prefetch other severity tabs so filter switches feel instant. */
  prefetchFilters?: boolean;
};

export function useIncidentsList({
  severity,
  offset,
  limit,
  prefetchFilters = true,
}: UseIncidentsListOptions) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: incidentsListQueryKey(severity, offset, limit),
    queryFn: () => fetchIncidentsList({ severity, offset, limit }),
    staleTime: INCIDENTS_CACHE_SECONDS * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!prefetchFilters) return;

    for (const filter of SEVERITY_FILTERS) {
      const nextSeverity = filter === "ALL" ? undefined : filter;
      void queryClient.prefetchQuery({
        queryKey: incidentsListQueryKey(nextSeverity, 0, limit),
        queryFn: () =>
          fetchIncidentsList({ severity: nextSeverity, offset: 0, limit }),
        staleTime: INCIDENTS_CACHE_SECONDS * 1000,
      });
    }
  }, [queryClient, limit, prefetchFilters]);

  return query;
}
