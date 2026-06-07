import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type PlannedExperiment } from "@/lib/research-catalog";
import type { ExperimentCategory } from "@/types/experiment";

type ExperimentMatrixProps = {
  experiments: PlannedExperiment[];
};

export function ExperimentMatrix({ experiments }: ExperimentMatrixProps) {
  const grouped = experiments.reduce<Record<string, PlannedExperiment[]>>(
    (acc, exp) => {
      const key = exp.category;
      acc[key] = acc[key] ?? [];
      acc[key].push(exp);
      return acc;
    },
    {},
  );

  const order: ExperimentCategory[] = [
    "scenario",
    "rag",
    "input",
    "prompt",
    "model",
    "knowledge",
    "agent",
  ];

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">
        Experimental design matrix
      </h2>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
        Four experiment configs are active today; additional axes are planned
        for model, prompt, knowledge, and agent studies.
      </p>
      <div className="mt-8 space-y-6">
        {order.map((category) => {
          const items = grouped[category];
          if (!items?.length) return null;
          return (
            <div key={category}>
              <h3 className="text-lg font-medium">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <span className="text-sm font-medium">{exp.name}</span>
                    <Badge
                      variant={exp.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {exp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
