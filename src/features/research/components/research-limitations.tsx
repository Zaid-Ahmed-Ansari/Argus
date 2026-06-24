import { RESEARCH_LIMITATIONS } from "@/lib/argus-research/catalog";

export function ResearchLimitations() {
  return (
    <section className="surface-card border-border/80 p-6">
      <h2 className="text-lg font-semibold">Limitations</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {RESEARCH_LIMITATIONS}
      </p>
    </section>
  );
}
