import { METRIC_DEFINITIONS } from "@/lib/research-catalog";

export function MetricsGlossary() {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">Metrics glossary</h2>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
        Cybersecurity-specific evaluation beyond generic LLM benchmarks.
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        {METRIC_DEFINITIONS.map((metric) => (
          <div
            key={metric.key}
            className="rounded-xl border border-border bg-card p-5"
          >
            <dt className="font-medium">{metric.label}</dt>
            <dd className="mt-1 font-mono text-xs text-muted-foreground">
              {metric.key}
            </dd>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {metric.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
