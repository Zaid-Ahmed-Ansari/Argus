const steps = [
  {
    title: "Upload logs",
    description:
      "Paste or upload SSH, VPN, or SIEM exports. Files are validated, stored per account, and indexed for search.",
  },
  {
    title: "Run analysis",
    description:
      "Automated analysis produces attack type, severity, timeline, and recommendations for each upload.",
  },
  {
    title: "Review results",
    description:
      "Incidents persist on your dashboard. Search across log content and open any incident for full detail.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-border bg-muted/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          How it works
        </h2>
        <p className="mt-3 max-w-lg text-lg text-muted-foreground md:text-xl">
          From raw log lines to structured incident records in three steps.
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((item, index) => (
            <div
              key={item.title}
              className="interactive-card rounded-md border border-border bg-card p-6"
            >
              <p className="font-mono text-base text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-lg leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
