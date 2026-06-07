import { ReportsCenter } from "@/features/research/components/reports-center";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { buildFullResearchReport } from "@/lib/research-report";
import { getResearchSnapshot } from "@/lib/research-snapshot";

export default async function ResearchReportsPage() {
  const snapshot = await getResearchSnapshot();
  const fullReportMarkdown = buildFullResearchReport(snapshot);

  return (
    <>
      <ResearchPageHeader
        title="Reports"
        description="Exportable evaluation reports for mentor review — corpus, experiments, findings, and the open-source fine-tuning roadmap."
      />
      <div className="px-6 py-8 lg:px-10">
        <ReportsCenter
          reports={snapshot.reports}
          fullReportMarkdown={fullReportMarkdown}
        />
      </div>
    </>
  );
}
