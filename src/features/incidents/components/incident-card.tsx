import Link from "next/link";
import { SeverityBadge } from "@/features/incidents/components/severity-badge";
import { formatDate } from "@/utils/format";
import type { IncidentSummary } from "@/types/incident";

type IncidentCardProps = {
  incident: IncidentSummary;
};

export function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <Link
      href={`/incidents/${incident.id}`}
      className="interactive-card group block rounded-md border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-medium group-hover:text-primary">
            {incident.title}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {incident.attackType ?? "Unclassified"} ·{" "}
            {formatDate(incident.createdAt)}
          </p>
        </div>
        <SeverityBadge severity={incident.severity} />
      </div>
      {incident.summary ? (
        <p className="mt-3 line-clamp-2 text-base text-muted-foreground">
          {incident.summary}
        </p>
      ) : null}
    </Link>
  );
}
