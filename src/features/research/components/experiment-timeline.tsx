"use client";

import Link from "next/link";
import type { TimelineEntry } from "@/lib/research-types";

type ExperimentTimelineProps = {
  entries: TimelineEntry[];
};

export function ExperimentTimeline({ entries }: ExperimentTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-[#6B7280]">No experiment runs recorded.</p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-[#E5E7EB]" />
      {entries.map((entry) => (
        <Link
          key={`${entry.id}-${entry.recordedAt}`}
          href={`/research/experiments/${encodeURIComponent(entry.experimentId)}`}
          className="relative flex gap-4 py-3 pl-6 hover:bg-[#FAFAFA]"
        >
          <span className="absolute left-0 top-5 size-3.5 rounded-full border-2 border-[#111827] bg-white" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#111827]">
              {entry.experimentName}
            </p>
            <p className="text-xs text-[#6B7280]">
              {entry.scenario} · {entry.variant}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm tabular-nums text-[#111827]">
              {(entry.accuracy * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-[#9CA3AF]">
              {new Date(entry.recordedAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
