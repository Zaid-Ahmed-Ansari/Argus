"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { EnrichedExperiment } from "@/lib/research-types";
import { cn } from "@/lib/utils";

type ExperimentWorkbenchProps = {
  experiments: EnrichedExperiment[];
};

export function ExperimentWorkbench({ experiments }: ExperimentWorkbenchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(
    () => ["all", ...new Set(experiments.map((e) => e.category))],
    [experiments],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return experiments.filter((exp) => {
      if (category !== "all" && exp.category !== category) return false;
      if (!q) return true;
      return (
        exp.name.toLowerCase().includes(q) ||
        exp.id.toLowerCase().includes(q) ||
        exp.description.toLowerCase().includes(q) ||
        exp.researchQuestion.toLowerCase().includes(q) ||
        exp.variants.some((v) => v.label?.toLowerCase().includes(q))
      );
    });
  }, [experiments, query, category]);

  return (
    <div className="research-section-gap px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search experiments, variants, research questions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 bg-card pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-surface-interactive hover:text-foreground",
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {experiments.length} experiments
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((exp) => (
          <Link
            key={exp.id}
            href={`/research/experiments/${encodeURIComponent(exp.id)}`}
            className="surface-interactive group block p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{exp.id}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight group-hover:underline">
                  {exp.name}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground capitalize">
                {exp.status}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {exp.researchQuestion}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-4">
              <div>
                <dt className="metric-label">Runs</dt>
                <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">
                  {exp.runs}
                </dd>
              </div>
              <div>
                <dt className="metric-label">Best</dt>
                <dd
                  className={cn(
                    "mt-1 font-mono text-xl font-semibold tabular-nums",
                    exp.bestAccuracy !== null && exp.bestAccuracy >= 0.7
                      ? "text-success"
                      : exp.bestAccuracy !== null && exp.bestAccuracy >= 0.5
                        ? "text-warning"
                        : "text-foreground",
                  )}
                >
                  {exp.bestAccuracy !== null
                    ? `${(exp.bestAccuracy * 100).toFixed(1)}%`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="metric-label">Variants</dt>
                <dd className="mt-1 text-xl font-semibold">{exp.variants.length}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No experiments match your search.
        </p>
      ) : null}
    </div>
  );
}
