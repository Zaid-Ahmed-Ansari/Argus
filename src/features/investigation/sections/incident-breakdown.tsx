"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import { SeverityBadge } from "@/features/incidents/components/severity-badge";
import type { DetectedIncident } from "@/types/investigation";
import { cn } from "@/lib/utils";

type IncidentBreakdownProps = {
  incidents: DetectedIncident[];
};

export function IncidentBreakdown({ incidents }: IncidentBreakdownProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = incidents[0]?.id;
    return first ? new Set([first]) : new Set();
  });

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <InvestigationSection
      id="incidents"
      title="Incident Breakdown"
      description="Each detected incident with severity, confidence, MITRE mapping, and supporting evidence."
    >
      <div className="space-y-3">
        {incidents.map((incident) => {
          const isOpen = expanded.has(incident.id);
          return (
            <article
              key={incident.id}
              className="rounded-lg border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => toggle(incident.id)}
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {incident.title}
                    </h3>
                    <SeverityBadge severity={incident.severity} />
                    <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {incident.confidence}% confidence
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {incident.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {incident.mitreTechniques.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen ? (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Evidence
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                        {incident.evidence.map((e) => (
                          <li key={e} className="flex gap-2">
                            <span className="text-muted-foreground">·</span>
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Affected Users
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {incident.affectedUsers.map((u) => (
                          <span
                            key={u}
                            className="rounded-md bg-muted px-2 py-1 font-mono text-xs"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Source IPs
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {incident.sourceIps.map((ip) => (
                          <span
                            key={ip}
                            className="rounded-md bg-muted px-2 py-1 font-mono text-xs"
                          >
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </InvestigationSection>
  );
}
