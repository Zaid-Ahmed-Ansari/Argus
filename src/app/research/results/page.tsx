import { ArgusResultsLaboratory } from "@/features/research/components/argus-results-laboratory";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getArgusResultsLab } from "@/lib/argus-research/snapshot";

export const revalidate = 86400;

type PageProps = {
  searchParams: Promise<{ model?: string }>;
};

export default async function ResearchResultsPage({ searchParams }: PageProps) {
  const { model } = await searchParams;
  const data = await getArgusResultsLab();

  return (
    <>
      <ResearchPageHeader
        title="Results laboratory"
        description="Classification leaderboard, confusion matrices, and per-class accuracy across Base vs LoRA and Raw vs Condensed vs RAG."
      />
      <div className="px-6 py-8 lg:px-10">
        <ArgusResultsLaboratory data={data} initialModel={model} />
      </div>
    </>
  );
}
