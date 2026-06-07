"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import type { TimelineStage } from "@/types/investigation";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

type StagedTimelineProps = {
  stages: TimelineStage[];
  filterStageId: string | null;
};

export function StagedTimeline({ stages, filterStageId }: StagedTimelineProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const visibleStages = filterStageId
    ? stages.filter((s) => s.id === filterStageId)
    : stages;

  function toggle(stageId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }

  return (
    <InvestigationSection
      id="timeline"
      title="Detailed Timeline"
      description="Events grouped by attack stage. Collapse sections or filter via the attack chain."
      action={
        filterStageId ? (
          <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs">
            Filtered to one stage
          </span>
        ) : null
      }
    >
      <div className="space-y-6">
        {visibleStages.map((stage) => {
          const isCollapsed = collapsed.has(stage.id);
          return (
            <div key={stage.id}>
              <button
                type="button"
                onClick={() => toggle(stage.id)}
                className="flex w-full items-center gap-2 border-b border-border pb-2 text-left"
              >
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  {stage.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({stage.events.length} events)
                </span>
              </button>

              {!isCollapsed ? (
                <ol className="mt-4 space-y-4">
                  {stage.events.map((event) => (
                    <li
                      key={event.id}
                      className={cn(
                        "grid gap-1 border-l-2 pl-4",
                        filterStageId === stage.id
                          ? "border-foreground"
                          : "border-border",
                      )}
                    >
                      <time className="font-mono text-xs text-muted-foreground">
                        {formatDate(event.timestamp)}
                      </time>
                      <p className="text-sm text-foreground">{event.event}</p>
                      {event.source ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          {event.source}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          );
        })}
      </div>
    </InvestigationSection>
  );
}
