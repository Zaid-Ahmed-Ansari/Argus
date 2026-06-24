import { ArgusExperimentWorkbench } from "@/features/research/components/argus-experiment-workbench";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getArgusExperiments } from "@/lib/argus-research/snapshot";

export const revalidate = 86400;

export default async function ResearchExperimentsPage() {
  const data = await getArgusExperiments();

  return (
    <>
      <ResearchPageHeader
        title="Experiment workbench"
        description="Families A–C: dataset representation, base vs LoRA fine-tuning, and structured output reliability."
      />
      <ArgusExperimentWorkbench data={data} />
    </>
  );
}
