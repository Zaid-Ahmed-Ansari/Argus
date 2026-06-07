"use client";

import { useMemo, useState } from "react";
import type { EnrichedExperiment } from "@/lib/research-types";
import type { StoredExperimentResult } from "@/lib/experiment-results";
import { cn } from "@/lib/utils";

type ExperimentComparisonProps = {
  experiments: EnrichedExperiment[];
  results: StoredExperimentResult[];
};

export function ExperimentComparison({
  experiments,
  results,
}: ExperimentComparisonProps) {
  const [a, setA] = useState(experiments[0]?.id ?? "");
  const [b, setB] = useState(experiments[1]?.id ?? "");

  const comparison = useMemo(() => {
    const expA = experiments.find((e) => e.id === a);
    const expB = experiments.find((e) => e.id === b);
    if (!expA || !expB) return null;

    const avg = (id: string, key: "accuracy" | "hallucination_rate") => {
      const vals = results
        .filter((r) => r.experimentId === id)
        .map((r) => r.metrics[key])
        .filter((v): v is number => typeof v === "number");
      return vals.length
        ? vals.reduce((s, v) => s + v, 0) / vals.length
        : null;
    };

    return {
      a: expA,
      b: expB,
      accuracyA: avg(a, "accuracy"),
      accuracyB: avg(b, "accuracy"),
      hallA: avg(a, "hallucination_rate"),
      hallB: avg(b, "hallucination_rate"),
    };
  }, [a, b, experiments, results]);

  if (experiments.length < 2) return null;

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-5">
      <p className="text-sm font-medium text-[#111827]">Comparison mode</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={a}
          onChange={(e) => setA(e.target.value)}
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
        >
          {experiments.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name}
            </option>
          ))}
        </select>
        <select
          value={b}
          onChange={(e) => setB(e.target.value)}
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
        >
          {experiments.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name}
            </option>
          ))}
        </select>
      </div>
      {comparison ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: comparison.a.name, acc: comparison.accuracyA, hall: comparison.hallA },
            { label: comparison.b.name, acc: comparison.accuracyB, hall: comparison.hallB },
          ].map((side) => (
            <div
              key={side.label}
              className="rounded-md border border-[#E5E7EB] bg-white p-4"
            >
              <p className="text-sm font-medium">{side.label}</p>
              <p className="mt-2 font-mono text-2xl tabular-nums">
                {side.acc !== null
                  ? `${(side.acc * 100).toFixed(1)}%`
                  : "—"}
              </p>
              <p className="text-xs text-[#6B7280]">mean accuracy</p>
              <p
                className={cn(
                  "mt-2 font-mono text-sm tabular-nums",
                  (side.hall ?? 0) > 0.2 ? "text-[#DC2626]" : "text-[#6B7280]",
                )}
              >
                {side.hall !== null
                  ? `${(side.hall * 100).toFixed(1)}%`
                  : "—"}{" "}
                hallucination
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
