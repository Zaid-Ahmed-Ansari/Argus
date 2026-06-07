import { IncidentList } from "@/features/incidents";
import { SeverityFilter } from "@/features/incidents/components/severity-filter";
import { IncidentPagination } from "@/features/incidents/components/incident-pagination";
import type { IncidentSummary } from "@/types/incident";

const mockIncidents: IncidentSummary[] = Array.from({ length: 4 }, (_, i) => ({
  id: `fixture-incident-${i}`,
  title: `Incident record ${i + 1} — authentication anomaly`,
  status: "OPEN",
  severity: i % 2 === 0 ? "HIGH" : "MEDIUM",
  attackType: "Brute Force (T1110)",
  summary: "Sample incident summary for skeleton capture.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export function IncidentsListFixture() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SeverityFilter value="ALL" onChange={() => {}} />
        <p className="text-sm text-muted-foreground">12 incidents</p>
      </div>
      <IncidentList incidents={mockIncidents} />
      <div className="mt-6">
        <IncidentPagination total={12} limit={6} offset={0} onPageChange={() => {}} />
      </div>
    </>
  );
}
