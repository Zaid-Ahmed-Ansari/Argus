import { PAPER_SECTIONS } from "@/lib/research-catalog";

export function PaperOutline() {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">
        Research paper outline
      </h2>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
        Target publication structure for open-source SOC model evaluation.
      </p>
      <ol className="mt-8 space-y-3">
        {PAPER_SECTIONS.map((section, index) => (
          <li
            key={section.title}
            className="flex gap-4 rounded-xl border border-border bg-card px-5 py-4"
          >
            <span className="font-mono text-sm text-muted-foreground">
              {index + 1}.
            </span>
            <div>
              <p className="font-medium">{section.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.summary}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
