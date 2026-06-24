"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ArgusResultsLabData } from "@/lib/argus-research/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ResearchLimitations } from "@/features/research/components/research-limitations";

const ClassificationCharts = dynamic(
  () =>
    import("@/features/research/components/classification-charts").then(
      (m) => m.ClassificationCharts,
    ),
  {
    loading: () => <Skeleton className="h-80 w-full rounded-lg" />,
    ssr: false,
  },
);

type ArgusResultsLaboratoryProps = {
  data: ArgusResultsLabData;
  initialModel?: string;
};

export function ArgusResultsLaboratory({
  data,
  initialModel,
}: ArgusResultsLaboratoryProps) {
  const [selectedRunId, setSelectedRunId] = useState(
    data.runs.find((r) => r.label === initialModel)?.id ??
      data.runs[0]?.id ??
      "",
  );
  const [sortKey, setSortKey] = useState<keyof ArgusResultsLabData["leaderboard"][0]>("f1");

  const sortedLeaderboard = useMemo(
    () =>
      [...data.leaderboard].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number)),
    [data.leaderboard, sortKey],
  );

  return (
    <div className="space-y-8">
      <section className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {(["model", "dataset", "accuracy", "precision", "recall", "f1"] as const).map(
                (col) => (
                  <th
                    key={col}
                    className="cursor-pointer px-4 py-3 capitalize hover:text-foreground"
                    onClick={() => col !== "model" && col !== "dataset" && setSortKey(col)}
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.map((row) => (
              <tr
                key={row.model}
                className="border-b border-border/60 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">{row.model}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {row.dataset}
                </td>
                <td className="px-4 py-3 font-mono">
                  {(row.accuracy * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 font-mono">
                  {(row.precision * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 font-mono">
                  {(row.recall * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 font-mono font-semibold">
                  {(row.f1 * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <ResearchLimitations />

      <section>
        <div className="mb-4 flex flex-wrap gap-2">
          {data.runs.map((run) => (
            <button
              key={run.id}
              type="button"
              onClick={() => setSelectedRunId(run.id)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                selectedRunId === run.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {run.label}
            </button>
          ))}
        </div>
        <ClassificationCharts
          runs={data.runs}
          classLabels={data.classLabels}
          selectedRunId={selectedRunId}
        />
      </section>

      <p className="text-sm text-muted-foreground">
        Compare configurations in{" "}
        <Link href="/research/experiments" className="underline">
          Experiment workbench
        </Link>
        .
      </p>
    </div>
  );
}
