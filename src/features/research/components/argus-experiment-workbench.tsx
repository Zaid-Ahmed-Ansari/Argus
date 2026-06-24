"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ArgusExperimentsData } from "@/lib/argus-research/types";

type ArgusExperimentWorkbenchProps = {
  data: ArgusExperimentsData;
};

export function ArgusExperimentWorkbench({ data }: ArgusExperimentWorkbenchProps) {
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return data.families
      .filter((f) => familyFilter === "all" || f.id === familyFilter)
      .map((family) => ({
        ...family,
        experiments: family.experiments.filter((exp) => {
          const q = query.toLowerCase();
          if (!q) return true;
          return (
            exp.name.toLowerCase().includes(q) ||
            exp.goal.toLowerCase().includes(q) ||
            exp.findings.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((f) => f.experiments.length > 0);
  }, [data.families, query, familyFilter]);

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search experiments…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm"
        />
        <select
          value={familyFilter}
          onChange={(e) => setFamilyFilter(e.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="all">All families</option>
          {data.families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.map((family) => (
        <section key={family.id}>
          <h2 className="text-lg font-semibold">{family.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{family.description}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {family.experiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/research/experiments/${exp.id}`}
                className="surface-card block p-5 transition-colors hover:border-primary/40"
              >
                <p className="font-medium">{exp.name}</p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {exp.goal}
                </p>
                <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <div>
                    <dt className="inline font-medium text-foreground">Dataset: </dt>
                    <dd className="inline">{exp.dataset}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-foreground">Model: </dt>
                    <dd className="inline">{exp.model}</dd>
                  </div>
                </dl>
                {exp.findings ? (
                  <p className="mt-3 text-sm text-success">{exp.findings}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
