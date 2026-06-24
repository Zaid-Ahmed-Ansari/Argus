import { ArgusReportsCenter } from "@/features/research/components/argus-reports-center";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getFullResearchReport } from "@/lib/argus-research/report";
import { getArgusReports } from "@/lib/argus-research/snapshot";

export const revalidate = 86400;

export default async function ResearchReportsPage() {
  const [data, fullReportMarkdown] = await Promise.all([
    getArgusReports(),
    getFullResearchReport(),
  ]);

  return (
    <>
      <ResearchPageHeader
        title="Reports"
        description="Exportable academic report covering ARGUS-1000, experimental setup, leaderboard, and research question findings."
      />
      <div className="px-6 py-8 lg:px-10">
        <ArgusReportsCenter
          data={data}
          fullReportMarkdown={fullReportMarkdown}
        />
      </div>
    </>
  );
}
