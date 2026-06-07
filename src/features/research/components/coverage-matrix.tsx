"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { COVERAGE_AXES } from "@/lib/research-constants";
import { RESEARCH_SCENARIOS } from "@/lib/research-catalog";
import type { CoverageCell } from "@/lib/research-types";
import { cn } from "@/lib/utils";

type CoverageMatrixProps = {
  cells: CoverageCell[];
};

export function CoverageMatrix({ cells }: CoverageMatrixProps) {
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="px-4 py-3 font-medium text-muted-foreground">Scenario</th>
            {COVERAGE_AXES.map((axis) => (
              <th
                key={axis.id}
                className="px-4 py-3 text-center font-medium text-muted-foreground"
              >
                {axis.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESEARCH_SCENARIOS.map((scenario) => (
            <tr key={scenario.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/research/datasets?id=${scenario.id}`}
                  className="font-medium hover:underline"
                >
                  {scenario.name}
                </Link>
                <p className="text-xs capitalize text-muted-foreground">
                  {scenario.difficulty}
                </p>
              </td>
              {COVERAGE_AXES.map((axis) => {
                const cell = cells.find(
                  (c) => c.scenarioId === scenario.id && c.axis === axis.id,
                );
                const hasData = cell && cell.runs > 0;
                const score = cell?.score;
                return (
                  <td key={axis.id} className="px-4 py-3 text-center">
                    {hasData ? (
                      <Link
                        href={`/research/results?scenario=${scenario.id}`}
                        className="inline-flex flex-col items-center gap-1"
                      >
                        <span
                          className={cn(
                            "inline-flex size-7 items-center justify-center rounded-full",
                            (score ?? 0) >= 0.7
                              ? "finding-success"
                              : (score ?? 0) >= 0.5
                                ? "finding-warning"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Check className="size-3.5" />
                        </span>
                        <span className="font-mono text-xs tabular-nums">
                          {score != null ? `${(score * 100).toFixed(0)}%` : "—"}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
