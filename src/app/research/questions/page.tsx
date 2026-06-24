import { ArgusQuestionCard } from "@/features/research/components/argus-question-card";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getArgusQuestions } from "@/lib/argus-research/snapshot";

export const revalidate = 86400;

export default async function ResearchQuestionsPage() {
  const data = await getArgusQuestions();
  const openCount =
    data.questions.length - data.answeredCount - data.inProgressCount;

  return (
    <>
      <ResearchPageHeader
        title="Research questions"
        description="Eight primary hypotheses (RQ1–RQ8) with findings computed from the six Qwen3-4B evaluation runs."
      />
      <div className="px-6 py-8 lg:px-10">
        <div className="mb-8 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="font-mono text-2xl font-semibold text-success">
              {data.answeredCount}
            </span>
            <span className="ml-2 text-muted-foreground">answered</span>
          </div>
          <div>
            <span className="font-mono text-2xl font-semibold text-warning">
              {data.inProgressCount}
            </span>
            <span className="ml-2 text-muted-foreground">in progress</span>
          </div>
          <div>
            <span className="font-mono text-2xl font-semibold text-muted-foreground">
              {openCount}
            </span>
            <span className="ml-2 text-muted-foreground">open</span>
          </div>
        </div>
        <div className="surface-card px-2">
          {data.questions.map((q) => (
            <ArgusQuestionCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </>
  );
}
