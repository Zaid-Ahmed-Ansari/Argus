import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArgusOverviewSections } from "@/features/research/components/argus-overview-sections";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { RESEARCH_POSITIONING } from "@/lib/argus-research/catalog";
import {
  getArgusQuestions,
  getArgusResearchOverview,
} from "@/lib/argus-research/snapshot";

export const revalidate = 86400;

export default async function ResearchOverviewPage() {
  const [overview, questions] = await Promise.all([
    getArgusResearchOverview(),
    getArgusQuestions(),
  ]);

  return (
    <>
      <ResearchPageHeader
        title="Command center"
        description={RESEARCH_POSITIONING}
        action={
          <Link
            href="/research/results"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            View results
          </Link>
        }
      />
      <ArgusOverviewSections
        data={overview}
        answeredCount={questions.answeredCount}
        questionTotal={questions.questions.length}
      />
    </>
  );
}
