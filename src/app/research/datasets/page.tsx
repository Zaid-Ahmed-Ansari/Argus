import { ArgusDatasetExplorer } from "@/features/research/components/argus-dataset-explorer";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getArgusDatasetExplorer } from "@/lib/argus-research/snapshot";

export const revalidate = 86400;

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ResearchDatasetsPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const data = await getArgusDatasetExplorer();

  return (
    <>
      <ResearchPageHeader
        title="Dataset explorer"
        description="ARGUS-1000: 1000 synthetic SOC incidents across 10 attack categories with raw, condensed, and RAG-enhanced representations."
      />
      <div className="px-6 py-8 lg:px-10">
        <ArgusDatasetExplorer data={data} initialCategoryId={id} />
      </div>
    </>
  );
}
