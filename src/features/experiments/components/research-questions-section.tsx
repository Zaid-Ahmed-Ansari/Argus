import type { ResearchQuestion } from "@/lib/research-catalog";

type ResearchQuestionsSectionProps = {
  questions: ResearchQuestion[];
};

export function ResearchQuestionsSection({
  questions,
}: ResearchQuestionsSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">
        Research questions
      </h2>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
        Publishable hypotheses evaluated through controlled experiments and
        ground-truth metrics.
      </p>
      <ol className="mt-8 space-y-4">
        {questions.map((rq) => (
          <li
            key={rq.id}
            className="rounded-xl border border-border bg-card px-5 py-4"
          >
            <p className="font-mono text-sm font-medium text-muted-foreground">
              {rq.id}
            </p>
            <p className="mt-1 text-base leading-relaxed">{rq.question}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Experiments: {rq.experiments.join(", ")}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
