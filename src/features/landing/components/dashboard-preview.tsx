import { MOCK_ANALYSIS } from "@/features/landing/constants";

export function DashboardPreview() {
  return (
    <section id="preview" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Dashboard output
        </h2>
        <p className="mt-3 max-w-lg text-lg text-muted-foreground md:text-xl">
          Analysis results persist to your account. Severity counts, timelines,
          and recommendations are available on the incident view.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
          {[
            { label: "Incidents", value: "12" },
            { label: "High", value: "3" },
            { label: "Medium", value: "5" },
            { label: "Low", value: "4" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="interactive-card bg-card px-5 py-4"
            >
              <p className="text-base text-muted-foreground">{stat.label}</p>
              <p className="mt-1.5 text-3xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <article className="mt-4 overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="text-base text-muted-foreground">Latest analysis</p>
              <h3 className="mt-1 text-xl font-semibold">
                {MOCK_ANALYSIS.attackType}
              </h3>
            </div>
            <span className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-sm font-medium">
              {MOCK_ANALYSIS.severity}
            </span>
          </header>

          <p className="border-b border-border px-5 py-4 text-lg leading-relaxed text-muted-foreground">
            {MOCK_ANALYSIS.summary}
          </p>

          <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-border">
            <div className="px-5 py-5">
              <h4 className="text-lg font-semibold">Timeline</h4>
              <ul className="mt-4 space-y-4">
                {MOCK_ANALYSIS.timeline.map((item) => (
                  <li
                    key={item.time}
                    className="grid grid-cols-[4.5rem_1fr] gap-3 text-lg"
                  >
                    <span className="font-mono text-base text-muted-foreground">
                      {item.time}
                    </span>
                    <span>{item.event}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-5 lg:border-t-0">
              <h4 className="text-lg font-semibold">Recommendations</h4>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-lg text-muted-foreground">
                {MOCK_ANALYSIS.recommendations.map((rec) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ol>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
