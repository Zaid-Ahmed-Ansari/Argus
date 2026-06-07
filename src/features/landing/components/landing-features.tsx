import {
  BrainCircuit,
  Database,
  Search,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI incident analysis",
    description:
      "Classifies attack patterns, assigns severity, and builds timelines from raw log lines.",
  },
  {
    icon: Search,
    title: "Log search",
    description:
      "Search stored log content and query incidents across your investigation history.",
  },
  {
    icon: ShieldCheck,
    title: "SOC-ready output",
    description:
      "Structured summaries, MITRE-style labels, and actionable recommendations per incident.",
  },
  {
    icon: Database,
    title: "Persistent records",
    description:
      "Every analysis is saved to your account with file metadata, timelines, and audit-friendly storage.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-base font-medium uppercase tracking-wider text-muted-foreground">
          Capabilities
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Built for security investigations
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Argus turns noisy authentication logs into reviewable incident
          records — without leaving your analyst workflow.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="interactive-card h-full rounded-lg border border-border bg-card p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-md bg-muted text-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-lg leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
