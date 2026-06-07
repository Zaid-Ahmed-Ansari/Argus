export function MethodologySection() {
  const steps = [
    {
      title: "Labeled fixtures",
      body: "10 synthetic log files with ground-truth JSON: attack type, severity, MITRE IDs, required keywords, forbidden terms, entities, and playbook themes.",
    },
    {
      title: "Controlled variants",
      body: "Each experiment compares explicit axes — RAG on/off, raw vs structured input, or cross-scenario baselines — with fixed temperature and prompt version.",
    },
    {
      title: "Automated scoring",
      body: "Batch runner invokes Gemini via AnalysisOrchestrator, then scores outputs with 8+ cybersecurity-specific metrics including MITRE mapping and analyst utility.",
    },
    {
      title: "Reproducibility",
      body: "Results persist as JSON under experiments/results/. Re-run with npm run experiment:all for full corpus evaluation.",
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">Methodology</h2>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
        Argus evaluates LLM-assisted SOC triage under controlled
        conditions — not ad-hoc chat responses.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="font-mono text-sm text-muted-foreground">
              Step {index + 1}
            </p>
            <h3 className="mt-1 text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
