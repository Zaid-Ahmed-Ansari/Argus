import type { LogFileSummary } from "@/types/incident";

export type LogSearchResult = LogFileSummary & {
  incidentId: string;
  incidentTitle: string;
  rank: number;
  snippet: string;
};

export type LogSearchResponse = {
  query: string;
  results: LogSearchResult[];
  total: number;
};
