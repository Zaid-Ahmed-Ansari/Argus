import { ExperimentTimeline } from "@/features/research/components/experiment-timeline";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { ResultsLaboratory } from "@/features/research/components/results-filters";
import { getResearchSnapshot } from "@/lib/research-snapshot";

type PageProps = {
  searchParams: Promise<{ scenario?: string; experiment?: string }>;
};

export default async function ResearchResultsPage({ searchParams }: PageProps) {
  const { scenario, experiment } = await searchParams;
  const snapshot = await getResearchSnapshot();

  return (
    <>
      <ResearchPageHeader
        title="Results laboratory"
        description="Filter, sort, and compare evaluation runs. Leaderboard, charts, and side-by-side experiment comparison."
      />
      <div className="space-y-10 px-6 py-8 lg:px-10">
        <ResultsLaboratory
          leaderboard={snapshot.leaderboard}
          experiments={snapshot.experiments}
          results={snapshot.results}
          timeline={snapshot.timeline}
          initialScenario={scenario}
          initialExperiment={experiment}
        />
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#111827]">
            Experiment timeline
          </h2>
          <div className="rounded-lg border border-[#E5E7EB] px-4 py-2">
            <ExperimentTimeline entries={snapshot.timeline} />
          </div>
        </section>
      </div>
    </>
  );
}
