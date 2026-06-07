import { notFound, redirect } from "next/navigation";
import {
  InvestigationWorkspace,
  buildInvestigationReport,
} from "@/features/investigation";
import { EmptyState } from "@/components/ui/empty-state";
import { requireSession } from "@/lib/auth-session";
import { incidentRepository } from "@/services/repositories/incident.repository";
import { incidentIdSchema } from "@/lib/validators/incidents";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IncidentDetailPage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const idParsed = incidentIdSchema.safeParse(id);
  if (!idParsed.success) {
    notFound();
  }

  const incident = await incidentRepository.findById(
    idParsed.data,
    session.user.id,
  );

  if (!incident) {
    notFound();
  }

  const logLineCount = incident.logFiles.reduce(
    (sum, f) => sum + (f.lineCount ?? 0),
    0,
  );

  const report = buildInvestigationReport({
    incidentId: incident.id,
    title: incident.title,
    status: incident.status,
    analysis: incident.latestAnalysis,
    logLineCount: logLineCount || undefined,
  });

  if (!incident.latestAnalysis) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No analysis recorded"
          description="This incident exists but has no associated analysis yet. The workspace below shows the investigation layout with reference data."
          action={{ label: "Upload new logs", href: "/upload" }}
        />
        <InvestigationWorkspace report={report} />
      </div>
    );
  }

  return <InvestigationWorkspace report={report} />;
}
