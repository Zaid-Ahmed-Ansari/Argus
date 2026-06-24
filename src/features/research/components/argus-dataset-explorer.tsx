"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ArgusDatasetExplorerData,
  ArgusDatasetVariant,
} from "@/lib/argus-research/types";

type ArgusDatasetExplorerProps = {
  data: ArgusDatasetExplorerData;
  initialCategoryId?: string;
};

export function ArgusDatasetExplorer({
  data,
  initialCategoryId,
}: ArgusDatasetExplorerProps) {
  const [categoryId, setCategoryId] = useState(
    initialCategoryId ?? data.categories[0]?.id ?? "",
  );
  const [variant, setVariant] = useState<ArgusDatasetVariant>("raw");

  const category = data.categories.find((c) => c.id === categoryId);
  const sample = data.samples.find(
    (s) =>
      s.category === category?.name &&
      s.variant === variant,
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-5">
          <p className="metric-label">Total incidents</p>
          <p className="metric-value mt-2">{data.overview.totalIncidents}</p>
        </div>
        <div className="surface-card p-5">
          <p className="metric-label">Train / Val / Test</p>
          <p className="mt-2 font-mono text-lg">
            {data.overview.trainSamples} / {data.overview.validationSamples} /{" "}
            {data.overview.testSamples}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="metric-label">Attack categories</p>
          <p className="metric-value mt-2">{data.overview.attackCategories}</p>
        </div>
        <div className="surface-card p-5">
          <p className="metric-label">Token reduction</p>
          <p className="metric-value mt-2">{data.condensedReductionPct}%</p>
        </div>
      </section>

      <section className="surface-card p-6">
        <h2 className="text-lg font-semibold">Dataset variants</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4">Variant</th>
                <th className="pb-2 pr-4">Records</th>
                <th className="pb-2 pr-4">Avg tokens</th>
                <th className="pb-2">Range</th>
              </tr>
            </thead>
            <tbody>
              {data.variantStats.map((v) => (
                <tr key={v.variant} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">{v.label}</td>
                  <td className="py-3 pr-4">{v.recordCount}</td>
                  <td className="py-3 pr-4 font-mono">{v.averageTokens.toFixed(1)}</td>
                  <td className="py-3 font-mono text-muted-foreground">
                    {v.minTokens}–{v.maxTokens}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-4">
          <p className="mb-4 text-sm font-medium">Class distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.classDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 9 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={70}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="surface-card p-4">
          <p className="mb-4 text-sm font-medium">Telemetry source coverage</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data.sourceCoverage.slice(0, 10)}
              layout="vertical"
              margin={{ left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="label"
                width={88}
                tick={{ fontSize: 10 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#374151" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Attack categories</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`surface-card p-4 text-left transition-colors ${
                categoryId === cat.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <p className="font-medium">{cat.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {cat.count} incidents · {cat.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {category ? (
        <section className="surface-card p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["raw", "condensed", "rag"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`rounded-md border px-3 py-1.5 text-sm capitalize ${
                  variant === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {sample?.scenarioId} · {sample?.sourceCount} sources (
            {sample?.sources.join(", ")})
          </p>
          <pre className="mt-4 max-h-80 overflow-auto rounded-md border border-border bg-muted/30 p-4 text-xs leading-relaxed">
            {sample?.userContentPreview ?? "No sample available."}
          </pre>
          <p className="mt-3 font-mono text-sm">
            Label: {sample?.label ?? "—"}
          </p>
        </section>
      ) : null}
    </div>
  );
}
