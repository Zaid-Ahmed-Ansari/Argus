import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { SeverityBadge } from "@/features/incidents";
import { IncidentList } from "@/features/incidents";
import type { IncidentSummary } from "@/types/incident";

const mockIncidents: IncidentSummary[] = [
  {
    id: "fixture-1",
    title: "SSH brute force attempt on admin account",
    status: "OPEN",
    severity: "HIGH",
    attackType: "Brute Force (T1110)",
    summary: "Multiple failed logins followed by successful authentication.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fixture-2",
    title: "Suspicious VPN login from new region",
    status: "OPEN",
    severity: "MEDIUM",
    attackType: "Credential Access",
    summary: "First-time login from unusual geography.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function DashboardFixture() {
  return (
    <>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total incidents" value={12} />
        <StatCard label="Low" value={4} />
        <StatCard label="Medium" value={5} />
        <StatCard label="High" value={2} />
        <StatCard label="Critical" value={1} />
      </div>

      <section className="mb-10">
        <SectionHeader title="Recent analyses" />
        <div className="divide-y divide-border rounded-md border border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-lg font-medium">
                Brute force pattern detected against privileged SSH accounts.
              </p>
              <p className="mt-1 text-base text-muted-foreground">
                Jun 4, 2025 · GEMINI
              </p>
            </div>
            <SeverityBadge severity="HIGH" />
          </div>
        </div>
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
        <IncidentList incidents={mockIncidents} />
      </section>
    </>
  );
}
