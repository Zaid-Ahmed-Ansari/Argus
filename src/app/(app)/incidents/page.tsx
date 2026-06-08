import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { IncidentsLogSearchPanel } from "@/features/incidents/components/incidents-log-search-panel";
import { IncidentsPageContent } from "@/features/incidents/components/incidents-page-content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function IncidentsPage() {
  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Security incidents analyzed from your uploaded logs."
        action={
          <Link href="/upload" className={cn(buttonVariants({ size: "lg" }))}>
            New analysis
          </Link>
        }
      />

      <IncidentsLogSearchPanel />

      <IncidentsPageContent />
    </div>
  );
}
