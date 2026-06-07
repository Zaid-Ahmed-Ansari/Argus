import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperimentComparisonPanel } from "@/features/experiments/components/experiment-comparison-panel";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { aggregateResultsByVariant } from "@/lib/experiment-results";
import { getResearchSnapshot } from "@/lib/research-snapshot";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResearchExperimentDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const snapshot = await getResearchSnapshot();
  const experiment = snapshot.experiments.find((e) => e.id === decoded);
  const config = snapshot.configs.find((c) => c.id === decoded);

  if (!experiment || !config) notFound();

  const aggregates = aggregateResultsByVariant(snapshot.results, decoded);
  const linkedQuestions = snapshot.questions.filter((q) =>
    q.experiments.includes(decoded),
  );

  return (
    <>
      <ResearchPageHeader
        title={experiment.name}
        description={experiment.description}
        action={
          <Link
            href="/research/experiments"
            className="text-sm text-[#6B7280] hover:text-[#111827]"
          >
            ← All experiments
          </Link>
        }
      />
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[#E5E7EB] p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#6B7280]">
              Research question
            </h2>
            <p className="mt-2 text-base leading-relaxed text-[#111827]">
              {experiment.researchQuestion}
            </p>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#6B7280]">
              Methodology
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#374151]">
              Batch evaluation via{" "}
              <code className="rounded bg-[#F3F4F6] px-1 font-mono text-xs">
                scripts/run-experiment.ts
              </code>
              . Ground-truth scoring with composite accuracy, MITRE mapping,
              and analyst utility metrics. Model: Gemini. Temperature: 0.2.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Variants compared</h2>
          <div className="flex flex-wrap gap-2">
            {experiment.variants.map((v, i) => (
              <span
                key={i}
                className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1.5 text-sm"
              >
                {v.label}
                {v.usedRag !== undefined
                  ? ` · RAG ${v.usedRag ? "on" : "off"}`
                  : ""}
                {v.inputFormat ? ` · ${v.inputFormat}` : ""}
              </span>
            ))}
          </div>
        </section>

        <ExperimentComparisonPanel config={config} aggregates={aggregates} />

        {linkedQuestions.length > 0 ? (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Linked hypotheses</h2>
            <div className="space-y-3">
              {linkedQuestions.map((q) => (
                <Link
                  key={q.id}
                  href="/research/questions"
                  className="block rounded-lg border border-[#E5E7EB] p-4 hover:bg-[#FAFAFA]"
                >
                  <p className="font-mono text-xs text-[#6B7280]">{q.id}</p>
                  <p className="mt-1 text-sm">{q.question}</p>
                  {q.finding ? (
                    <p className="mt-2 text-sm text-[#16A34A]">{q.finding}</p>
                  ) : (
                    <p className="mt-2 text-sm text-[#9CA3AF] capitalize">
                      {q.status.replace("_", " ")}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
