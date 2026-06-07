import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { IncidentList } from "@/features/incidents";
import { LogSearchPanel } from "@/features/logs";
import { SeverityFilterNav } from "@/features/incidents/components/severity-filter-nav";
import { IncidentPaginationNav } from "@/features/incidents/components/incident-pagination-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireSession } from "@/lib/auth-session";
import { getIncidentsListData } from "@/services/incidents/get-incidents-list-data";
import type { SeverityLevel } from "@/types/incident";
import { IncidentsBoneyardFallback } from "@/components/boneyard/incidents-boneyard-fallback";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 6;

type IncidentsPageProps = {
  searchParams: Promise<{
    severity?: string;
    offset?: string;
  }>;
};

function parseSeverity(value?: string): SeverityLevel | undefined {
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

async function IncidentsResults({
  userId,
  severity,
  offset,
}: {
  userId: string;
  severity?: SeverityLevel;
  offset: number;
}) {
  const data = await getIncidentsListData(userId, {
    limit: PAGE_SIZE,
    offset,
    severity,
  });

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={<Skeleton className="h-10 w-72 rounded-md" />}>
          <SeverityFilterNav value={severity ?? "ALL"} />
        </Suspense>
        <p className="text-sm text-muted-foreground">
          {data.meta.total} incident{data.meta.total === 1 ? "" : "s"}
        </p>
      </div>

      <IncidentList incidents={data.incidents} />

      {data.meta.total > 0 ? (
        <div className="mt-6">
          <Suspense fallback={<Skeleton className="h-10 w-full rounded-md" />}>
            <IncidentPaginationNav
              total={data.meta.total}
              limit={data.meta.limit}
              offset={data.meta.offset}
            />
          </Suspense>
        </div>
      ) : null}
    </>
  );
}

export default async function IncidentsPage({ searchParams }: IncidentsPageProps) {
  const session = await requireSession();
  if (!session) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const severity = parseSeverity(params.severity);
  const offset = Math.max(0, Number(params.offset ?? 0) || 0);

  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Security incidents analyzed from your uploaded logs."
        action={
          <Link href="/upload" className={cn(buttonVariants({ size: "lg" }))}>
            New analysis
          </Link>
        }
      />

      <LogSearchPanel />

      <Suspense
        key={`${severity ?? "ALL"}-${offset}`}
        fallback={<IncidentsBoneyardFallback />}
      >
        <IncidentsResults
          userId={session.user.id}
          severity={severity}
          offset={offset}
        />
      </Suspense>
    </div>
  );
}
