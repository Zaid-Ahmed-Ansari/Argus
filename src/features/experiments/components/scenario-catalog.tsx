import { Badge } from "@/components/ui/badge";
import type { ResearchScenario } from "@/lib/research-catalog";
import { cn } from "@/lib/utils";

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  hard: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

type ScenarioCatalogProps = {
  scenarios: ResearchScenario[];
};

export function ScenarioCatalog({ scenarios }: ScenarioCatalogProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">
        Evaluation corpus — 10 labeled scenarios
      </h2>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
        Synthetic but realistic logs with ground-truth labels for attack type,
        severity, MITRE techniques, entities, and playbook themes.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <article
            key={scenario.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {scenario.mitre[0]}
              </Badge>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  DIFFICULTY_STYLE[scenario.difficulty],
                )}
              >
                {scenario.difficulty}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-medium">{scenario.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {scenario.description}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Severity</dt>
                <dd className="font-medium">{scenario.severity}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Log lines</dt>
                <dd className="font-medium">{scenario.logLines}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Sources</dt>
                <dd className="font-medium">{scenario.sources}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
