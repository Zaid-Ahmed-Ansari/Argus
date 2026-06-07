"use client";

import { useMemo, useState } from "react";
import type {
  EnrichedExperiment,
  LeaderboardRow,
  TimelineEntry,
} from "@/lib/research-types";
import { ResultsCharts } from "@/features/research/components/results-charts";
import { ResultsLeaderboard } from "@/features/research/components/results-leaderboard";
import { ExperimentComparison } from "@/features/research/components/experiment-comparison";
import type { StoredExperimentResult } from "@/lib/experiment-results";

type ResultsFiltersProps = {
  leaderboard: LeaderboardRow[];
  experiments: EnrichedExperiment[];
  results: StoredExperimentResult[];
  timeline: TimelineEntry[];
  initialScenario?: string;
  initialExperiment?: string;
};

export function ResultsLaboratory({
  leaderboard,
  experiments,
  results,
  timeline,
  initialScenario,
  initialExperiment,
}: ResultsFiltersProps) {
  const [experiment, setExperiment] = useState(initialExperiment ?? "all");
  const [scenario, setScenario] = useState(initialScenario ?? "all");

  const scenarios = useMemo(
    () => [...new Set(leaderboard.map((r) => r.scenario))].sort(),
    [leaderboard],
  );

  const filtered = useMemo(() => {
    return leaderboard.filter((row) => {
      if (experiment !== "all") {
        const exp = experiments.find((e) => e.id === experiment);
        if (exp && row.experiment !== exp.name) return false;
      }
      if (scenario !== "all" && row.scenario !== scenario) return false;
      return true;
    });
  }, [leaderboard, experiment, scenario, experiments]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <select
          value={experiment}
          onChange={(e) => setExperiment(e.target.value)}
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
        >
          <option value="all">All experiments</option>
          {experiments.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name}
            </option>
          ))}
        </select>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
        >
          <option value="all">All scenarios</option>
          {scenarios.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="flex items-center text-sm text-[#6B7280]">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <ResultsCharts leaderboard={filtered} timeline={timeline} />
      <ResultsLeaderboard rows={filtered} />
      <ExperimentComparison experiments={experiments} results={results} />
    </div>
  );
}
