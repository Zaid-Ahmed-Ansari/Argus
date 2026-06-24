"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ArgusResearchOverviewData } from "@/lib/argus-research/types";
import { AnimatedMetric } from "@/features/research/components/animated-metric";
import { ProgressTimeline } from "@/features/research/components/progress-timeline";
import { ResearchLimitations } from "@/features/research/components/research-limitations";

type ArgusOverviewSectionsProps = {
  data: ArgusResearchOverviewData;
  answeredCount: number;
  questionTotal: number;
};

export function ArgusOverviewSections({
  data,
  answeredCount,
  questionTotal,
}: ArgusOverviewSectionsProps) {
  const { overview } = data;

  return (
    <div className="research-section-gap px-6 py-8 lg:px-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AnimatedMetric label="Incidents" value={overview.totalIncidents} />
        <AnimatedMetric label="Attack categories" value={overview.attackCategories} />
        <AnimatedMetric label="Models evaluated" value={overview.modelsEvaluated} />
        <AnimatedMetric
          label="Best accuracy"
          value={overview.bestAccuracy}
          format="percent"
          tone={overview.bestAccuracy >= 0.95 ? "success" : "default"}
        />
        <AnimatedMetric
          label="Best macro F1"
          value={overview.bestMacroF1}
          format="percent"
          tone={overview.bestMacroF1 >= 0.95 ? "success" : "default"}
        />
      </section>

      <section className="surface-card p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Research trajectory</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ARGUS-1000 dataset → Qwen3-4B baseline → LoRA fine-tuning →
              benchmark analysis
            </p>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {answeredCount}/{questionTotal} hypotheses answered
          </p>
        </div>
        <ProgressTimeline steps={data.progressSteps} />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="surface-card p-4">
          <h2 className="mb-1 text-lg font-semibold">Class distribution</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Balanced 100 incidents per attack category
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.classDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 9 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={72}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-4">
          <h2 className="mb-1 text-lg font-semibold">Experiment progression</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Input representation and fine-tuning stages
          </p>
          <ol className="space-y-4">
            {data.experimentProgression.map((step, i) => (
              <li key={step.stage} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{step.stage}</p>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Leaderboard</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Best: {overview.bestExperiment}
            </p>
          </div>
          <Link href="/research/results" className="text-sm underline">
            Full results →
          </Link>
        </div>
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Dataset</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">F1</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.map((row) => (
                <tr key={row.model} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium">{row.model}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {row.dataset}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {(row.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold">
                    {(row.f1 * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ResearchLimitations />
    </div>
  );
}
