"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LeaderboardRow, TimelineEntry } from "@/lib/research-types";

type ResultsChartsProps = {
  leaderboard: LeaderboardRow[];
  timeline: TimelineEntry[];
};

export function ResultsCharts({ leaderboard, timeline }: ResultsChartsProps) {
  const byScenario = Object.values(
    leaderboard.reduce<
      Record<string, { scenario: string; accuracy: number; count: number }>
    >((acc, row) => {
      const key = row.scenario;
      if (!acc[key]) acc[key] = { scenario: key, accuracy: 0, count: 0 };
      acc[key].accuracy += row.accuracy;
      acc[key].count += 1;
      return acc;
    }, {}),
  )
    .map((s) => ({
      scenario: s.scenario.replace(/_/g, " "),
      accuracy: Number(((s.accuracy / s.count) * 100).toFixed(1)),
    }))
    .slice(0, 8);

  const trend = timeline.map((t, i) => ({
    run: i + 1,
    accuracy: Number((t.accuracy * 100).toFixed(1)),
    label: t.scenario,
  }));

  if (leaderboard.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-[#E5E7EB] p-4">
        <p className="mb-4 text-sm font-medium text-[#111827]">
          Mean accuracy by scenario
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byScenario} margin={{ top: 4, right: 8, left: -16, bottom: 48 }}>
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="scenario"
              tick={{ fontSize: 10, fill: "#6B7280" }}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6B7280" }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Bar dataKey="accuracy" fill="#111827" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-[#E5E7EB] p-4">
        <p className="mb-4 text-sm font-medium text-[#111827]">
          Accuracy trend across runs
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="run" tick={{ fontSize: 10, fill: "#6B7280" }} />
            <YAxis
              tick={{ fontSize: 10, fill: "#6B7280" }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#111827"
              strokeWidth={2}
              dot={{ fill: "#111827", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
