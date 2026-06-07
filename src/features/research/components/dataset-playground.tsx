"use client";

import { useMemo, useState } from "react";
import type { EnrichedScenario } from "@/lib/research-types";
import type { StoredExperimentResult } from "@/lib/experiment-results";
import { cn } from "@/lib/utils";

type DatasetPlaygroundProps = {
  scenarios: EnrichedScenario[];
  results: StoredExperimentResult[];
  initialId?: string;
};

type Panel = "logs" | "ground_truth" | "ai_output";

export function DatasetPlayground({
  scenarios,
  results,
  initialId,
}: DatasetPlaygroundProps) {
  const [selectedId, setSelectedId] = useState(
    initialId ?? scenarios[0]?.id ?? "",
  );
  const [panel, setPanel] = useState<Panel>("logs");

  const scenario = scenarios.find((s) => s.id === selectedId);
  const latestResult = useMemo(
    () =>
      results
        .filter((r) => r.fixtureId === selectedId)
        .sort(
          (a, b) =>
            new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
        )[0],
    [results, selectedId],
  );

  const panels: { id: Panel; label: string }[] = [
    { id: "logs", label: "Sample logs" },
    { id: "ground_truth", label: "Ground truth" },
    { id: "ai_output", label: "AI output" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="space-y-1">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={cn(
              "w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors",
              selectedId === s.id
                ? "bg-[#111827] font-medium text-white"
                : "text-[#374151] hover:bg-[#F3F4F6]",
            )}
          >
            {s.name}
            <span className="mt-0.5 block text-xs opacity-70 capitalize">
              {s.difficulty} · {s.mitre[0]}
            </span>
          </button>
        ))}
      </div>

      {scenario ? (
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4">
            {panels.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPanel(p.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  panel === p.id
                    ? "bg-[#111827] text-white"
                    : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            {panel === "logs" ? (
              <pre className="max-h-[420px] overflow-auto p-4 font-mono text-xs leading-relaxed text-[#374151]">
                {scenario.sampleLog || "No log file loaded."}
              </pre>
            ) : null}
            {panel === "ground_truth" ? (
              <pre className="max-h-[420px] overflow-auto p-4 font-mono text-xs leading-relaxed text-[#374151]">
                {JSON.stringify(scenario.groundTruth, null, 2)}
              </pre>
            ) : null}
            {panel === "ai_output" ? (
              <div className="p-4">
                {latestResult ? (
                  <pre className="max-h-[420px] overflow-auto font-mono text-xs leading-relaxed text-[#374151]">
                    {JSON.stringify(latestResult.prediction, null, 2)}
                  </pre>
                ) : (
                  <p className="py-8 text-center text-sm text-[#6B7280]">
                    No AI output for this scenario yet. Run batch evaluation.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[#6B7280]">Severity</dt>
              <dd className="font-medium">{scenario.severity}</dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">MITRE</dt>
              <dd className="font-mono text-xs">{scenario.mitre.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Runs</dt>
              <dd className="font-medium">{scenario.runCount}</dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Best accuracy</dt>
              <dd className="font-mono">
                {scenario.bestAccuracy !== null
                  ? `${(scenario.bestAccuracy * 100).toFixed(1)}%`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
