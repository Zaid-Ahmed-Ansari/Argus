"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ClassificationRun } from "@/lib/argus-research/types";

type ClassificationChartsProps = {
  runs: ClassificationRun[];
  classLabels: string[];
  selectedRunId?: string;
};

const COLORS = [
  "#111827",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#E5E7EB",
  "#F3F4F6",
  "#FEE2E2",
  "#FECACA",
  "#FCA5A5",
];

function ConfusionMatrix({
  run,
  classLabels,
}: {
  run: ClassificationRun;
  classLabels: string[];
}) {
  const matrix = run.confusionMatrix.matrix;
  const max = Math.max(...matrix.flat(), 1);

  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-sm font-medium">{run.label}</p>
      <table className="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-1 text-left text-muted-foreground">True \\ Pred</th>
            {classLabels.map((l) => (
              <th
                key={l}
                className="max-w-[4rem] truncate p-1 text-center font-normal text-muted-foreground"
                title={l}
              >
                {l.split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={classLabels[i]}>
              <td
                className="max-w-[5rem] truncate p-1 font-medium text-muted-foreground"
                title={classLabels[i]}
              >
                {classLabels[i]}
              </td>
              {row.map((cell, j) => {
                const intensity = cell / max;
                return (
                  <td
                    key={`${i}-${j}`}
                    className="p-1 text-center font-mono"
                    style={{
                      backgroundColor: `rgba(17, 24, 39, ${intensity * 0.85 + 0.05})`,
                      color: intensity > 0.4 ? "#fff" : "#111827",
                    }}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        Parse failure rate: {(run.metrics.parseFailureRate * 100).toFixed(1)}%
      </p>
    </div>
  );
}

export function ClassificationCharts({
  runs,
  classLabels,
  selectedRunId,
}: ClassificationChartsProps) {
  const activeRun =
    runs.find((r) => r.id === selectedRunId) ?? runs[0] ?? null;

  const perClassData = classLabels.map((label) => {
    const short = label.split(" ")[0] ?? label;
    const entry: Record<string, string | number> = { class: short };
    for (const run of runs) {
      entry[run.label] = (run.metrics.perClassAccuracy[label] ?? 0) * 100;
    }
    return entry;
  });

  const metricComparison = runs.map((run) => ({
    model: run.label.replace(" ", "\n"),
    accuracy: run.metrics.accuracy * 100,
    precision: run.metrics.precision * 100,
    recall: run.metrics.recall * 100,
    f1: run.metrics.f1 * 100,
  }));

  if (!activeRun) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-4">
          <p className="mb-4 text-sm font-medium">Accuracy / Precision / Recall / F1</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metricComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="model" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? `${value.toFixed(1)}%` : String(value ?? "")
                }
              />
              <Bar dataKey="accuracy" fill="#111827" name="Accuracy" />
              <Bar dataKey="f1" fill="#6B7280" name="F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-4">
          <p className="mb-4 text-sm font-medium">Per-class accuracy (%)</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perClassData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="class" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? `${value.toFixed(1)}%` : String(value ?? "")
                }
              />
              {runs.slice(0, 3).map((run, i) => (
                <Bar
                  key={run.id}
                  dataKey={run.label}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="surface-card p-4">
        <p className="mb-4 text-sm font-medium">Confusion matrix</p>
        <ConfusionMatrix run={activeRun} classLabels={classLabels} />
      </div>
    </div>
  );
}
