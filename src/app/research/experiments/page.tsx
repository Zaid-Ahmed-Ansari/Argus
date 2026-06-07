import { ExperimentWorkbench } from "@/features/research/components/experiment-workbench";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getResearchSnapshot } from "@/lib/research-snapshot";

export default async function ResearchExperimentsPage() {
  const snapshot = await getResearchSnapshot();

  return (
    <>
      <ResearchPageHeader
        title="Experiment workbench"
        description="Search and compare controlled experiments. Gemini baseline today — same protocol will evaluate a fine-tuned open-source model."
      />
      <ExperimentWorkbench experiments={snapshot.experiments} />
    </>
  );
}
