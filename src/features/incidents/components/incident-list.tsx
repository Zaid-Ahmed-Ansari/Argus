import { IncidentCard } from "@/features/incidents/components/incident-card";
import { EmptyState } from "@/components/ui/empty-state";
import { IncidentListLoading } from "@/features/incidents/components/incident-list-loading";
import type { IncidentSummary } from "@/types/incident";

type IncidentListProps = {
  incidents: IncidentSummary[];
  isLoading?: boolean;
};

export function IncidentList({ incidents, isLoading }: IncidentListProps) {
  if (isLoading) {
    return <IncidentListLoading />;
  }

  if (incidents.length === 0) {
    return (
      <EmptyState
        title="No incidents"
        description="Upload authentication logs to generate your first incident analysis."
        action={{ label: "Upload logs", href: "/upload" }}
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
