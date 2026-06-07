import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SeverityBadge } from "@/features/incidents";
import { IncidentList } from "@/features/incidents";
import { getDashboardData } from "@/services/dashboard/get-dashboard-data";
import { formatDate, formatSeverity } from "@/utils/format";

type DashboardContentProps = {
  userId: string;
};

export async function DashboardContent({ userId }: DashboardContentProps) {
  const data = await getDashboardData(userId);
  const severityCounts = data.meta.severityCounts;
  const total = data.meta.total;

  return (
    <>
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total incidents" value={total} />
        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((level) => (
          <StatCard
            key={level}
            label={formatSeverity(level)}
            value={severityCounts[level] ?? 0}
          />
        ))}
      </div>

      <section className="mb-10">
        <SectionHeader title="Recent analyses" />
        {data.recentAnalyses.length === 0 ? (
          <EmptyState
            title="No analyses yet"
            description="Upload logs to generate your first AI-assisted incident report."
            action={{ label: "Upload logs", href: "/upload" }}
          />
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {data.recentAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-lg font-medium">
                    {analysis.summary}
                  </p>
                  <p className="mt-1 text-base text-muted-foreground">
                    {formatDate(analysis.createdAt)} · {analysis.provider}
                  </p>
                </div>
                <SeverityBadge severity={analysis.severity} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Recent incidents"
          action={
            <Link
              href="/incidents"
              className="text-base text-muted-foreground hover:text-foreground hover:underline"
            >
              View all
            </Link>
          }
        />
        <IncidentList incidents={data.incidents} />
      </section>
    </>
  );
}
