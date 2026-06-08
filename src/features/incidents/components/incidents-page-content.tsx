"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IncidentList } from "@/features/incidents";
import { SeverityFilterNav } from "@/features/incidents/components/severity-filter-nav";
import { IncidentPaginationNav } from "@/features/incidents/components/incident-pagination-nav";
import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { useIncidentsList } from "@/hooks/use-incidents-list";
import type { SeverityLevel } from "@/types/incident";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 6;

function parseSeverity(value: string | null): SeverityLevel | undefined {
  if (
    value === "LOW" ||
    value === "MEDIUM" ||
    value === "HIGH" ||
    value === "CRITICAL"
  ) {
    return value;
  }
  return undefined;
}

function IncidentsPageContentInner() {
  const searchParams = useSearchParams();
  const severity = parseSeverity(searchParams.get("severity"));
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);

  const { data, isLoading, isFetching, isPlaceholderData } = useIncidentsList({
    severity,
    offset,
    limit: PAGE_SIZE,
  });

  const incidents = data?.incidents ?? [];
  const total = data?.meta.total ?? 0;
  const showInitialSkeleton = isLoading && !data;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SeverityFilterNav value={severity ?? "ALL"} />
        <p className="text-sm text-muted-foreground">
          {showInitialSkeleton ? (
            <Skeleton className="inline-block h-4 w-24" />
          ) : (
            <>
              {total} incident{total === 1 ? "" : "s"}
              {isFetching && isPlaceholderData ? (
                <span className="ml-2 text-xs opacity-60">Updating…</span>
              ) : null}
            </>
          )}
        </p>
      </div>

      <IncidentList incidents={incidents} isLoading={showInitialSkeleton} />

      {total > 0 ? (
        <div className="mt-6">
          <Suspense fallback={<Skeleton className="h-10 w-full rounded-md" />}>
            <IncidentPaginationNav
              total={total}
              limit={PAGE_SIZE}
              offset={offset}
            />
          </Suspense>
        </div>
      ) : null}
    </>
  );
}

export function IncidentsPageContent() {
  return (
    <Suspense fallback={<AppPageSkeleton />}>
      <IncidentsPageContentInner />
    </Suspense>
  );
}
