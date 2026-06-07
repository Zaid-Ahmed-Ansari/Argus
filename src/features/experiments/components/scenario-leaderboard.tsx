import type { ScenarioAggregate } from "@/lib/experiment-results";

type ScenarioLeaderboardProps = {
  aggregates: ScenarioAggregate[];
};

export function ScenarioLeaderboard({ aggregates }: ScenarioLeaderboardProps) {
  if (aggregates.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Scenario leaderboard
        </h2>
        <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-base text-muted-foreground">
          Run{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            npm run experiment:all
          </code>{" "}
          to populate cross-scenario results.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">
        Scenario leaderboard
      </h2>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
        Mean evaluation scores aggregated across all recorded experiment runs per
        scenario.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Scenario</th>
              <th className="pb-3 pr-4 font-medium">Difficulty</th>
              <th className="pb-3 pr-4 font-medium">Runs</th>
              <th className="pb-3 pr-4 font-medium">Accuracy</th>
              <th className="pb-3 pr-4 font-medium">Attack type</th>
              <th className="pb-3 pr-4 font-medium">Utility</th>
              <th className="pb-3 font-medium">Hallucination</th>
            </tr>
          </thead>
          <tbody>
            {aggregates.map((row) => (
              <tr key={row.fixtureId} className="border-b border-border/60">
                <td className="py-3 pr-4 font-medium">
                  {row.scenario ?? row.fixtureId}
                </td>
                <td className="py-3 pr-4 capitalize text-muted-foreground">
                  {row.difficulty ?? "—"}
                </td>
                <td className="py-3 pr-4 tabular-nums">{row.runs}</td>
                <td className="py-3 pr-4 tabular-nums">
                  {row.accuracy !== undefined
                    ? `${(row.accuracy * 100).toFixed(1)}%`
                    : "—"}
                </td>
                <td className="py-3 pr-4 tabular-nums">
                  {row.attack_type_accuracy !== undefined
                    ? `${(row.attack_type_accuracy * 100).toFixed(1)}%`
                    : "—"}
                </td>
                <td className="py-3 pr-4 tabular-nums">
                  {row.analyst_utility_score !== undefined
                    ? `${(row.analyst_utility_score * 100).toFixed(1)}%`
                    : "—"}
                </td>
                <td className="py-3 tabular-nums">
                  {row.hallucination_rate !== undefined
                    ? `${(row.hallucination_rate * 100).toFixed(1)}%`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
