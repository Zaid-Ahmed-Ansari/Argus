import { DatasetPlayground } from "@/features/research/components/dataset-playground";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getResearchSnapshot } from "@/lib/research-snapshot";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ResearchDatasetsPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const snapshot = await getResearchSnapshot();

  return (
    <>
      <ResearchPageHeader
        title="Dataset explorer"
        description="Inspect labeled attack scenarios — sample logs, MITRE mapping, ground truth, and latest Gemini baseline outputs. Training pairs for open-source fine-tuning."
      />
      <div className="px-6 py-8 lg:px-10">
        <DatasetPlayground
          scenarios={snapshot.scenarios}
          results={snapshot.results}
          initialId={id}
        />
      </div>
    </>
  );
}
