import Link from "next/link";
import { notFound } from "next/navigation";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getArgusExperiments } from "@/lib/argus-research/snapshot";

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResearchExperimentDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const data = await getArgusExperiments();

  const experiment = data.families
    .flatMap((f) => f.experiments)
    .find((e) => e.id === decoded);
  const family = data.families.find((f) =>
    f.experiments.some((e) => e.id === decoded),
  );

  if (!experiment || !family) notFound();

  const relatedRuns = data.runs.filter((run) => {
    if (experiment.id.startsWith("exp-a-")) {
      const variant = experiment.id.replace("exp-a-", "") as
        | "raw"
        | "condensed"
        | "rag";
      return run.modelType === "base" && run.datasetVariant === variant;
    }
    if (experiment.id === "exp-b-base") return run.modelType === "base";
    if (experiment.id === "exp-b-lora-raw")
      return run.modelType === "lora" && run.datasetVariant === "raw";
    if (experiment.id === "exp-b-lora-condensed")
      return run.modelType === "lora" && run.datasetVariant === "condensed";
    if (experiment.id === "exp-b-lora-rag")
      return run.modelType === "lora" && run.datasetVariant === "rag";
    return false;
  });

  return (
    <>
      <ResearchPageHeader
        title={experiment.name}
        description={experiment.goal}
        action={
          <Link
            href="/research/experiments"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← All experiments
          </Link>
        }
      />
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Family
            </h2>
            <p className="mt-2 text-base font-medium">{family.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {family.description}
            </p>
          </div>
          <div className="surface-card p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Methodology
            </h2>
            <p className="mt-2 text-sm leading-relaxed">{experiment.methodology}</p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="surface-card p-4">
            <p className="text-xs uppercase text-muted-foreground">Dataset</p>
            <p className="mt-2 text-sm font-medium">{experiment.dataset}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs uppercase text-muted-foreground">Model</p>
            <p className="mt-2 text-sm font-medium">{experiment.model}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs uppercase text-muted-foreground">Metrics</p>
            <p className="mt-2 text-sm font-medium">{experiment.metrics}</p>
          </div>
        </section>

        {experiment.findings ? (
          <section className="surface-card border-success/30 p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-success">
              Findings
            </h2>
            <p className="mt-2 text-sm leading-relaxed">{experiment.findings}</p>
          </section>
        ) : null}

        {relatedRuns.length > 0 ? (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Evaluation runs</h2>
            <div className="surface-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3">Run</th>
                    <th className="px-4 py-3">Accuracy</th>
                    <th className="px-4 py-3">F1</th>
                    <th className="px-4 py-3">Parse failures</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedRuns.map((run) => (
                    <tr key={run.id} className="border-b border-border/60">
                      <td className="px-4 py-3 font-medium">{run.label}</td>
                      <td className="px-4 py-3 font-mono">
                        {(run.metrics.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {(run.metrics.f1 * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {(run.metrics.parseFailureRate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              <Link href="/research/results" className="underline">
                Open results laboratory
              </Link>{" "}
              for confusion matrices and per-class charts.
            </p>
          </section>
        ) : null}
      </div>
    </>
  );
}
