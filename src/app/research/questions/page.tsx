import { QuestionCard } from "@/features/research/components/question-card";
import { ResearchPageHeader } from "@/features/research/components/research-page-header";
import { getResearchSnapshot } from "@/lib/research-snapshot";

export default async function ResearchQuestionsPage() {
  const snapshot = await getResearchSnapshot();
  const answered = snapshot.questions.filter((q) => q.status === "answered").length;
  const inProgress = snapshot.questions.filter(
    (q) => q.status === "in_progress",
  ).length;

  return (
    <>
      <ResearchPageHeader
        title="Research questions"
        description="Fifteen hypotheses with empirical findings when runs exist, or documented research positions when awaiting batch evaluation."
      />
      <div className="px-6 py-8 lg:px-10">
        <div className="mb-8 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="font-mono text-2xl font-semibold text-success">
              {answered}
            </span>
            <span className="ml-2 text-muted-foreground">answered</span>
          </div>
          <div>
            <span className="font-mono text-2xl font-semibold text-warning">
              {inProgress}
            </span>
            <span className="ml-2 text-muted-foreground">in progress</span>
          </div>
          <div>
            <span className="font-mono text-2xl font-semibold text-muted-foreground">
              {snapshot.questions.length - answered - inProgress}
            </span>
            <span className="ml-2 text-muted-foreground">awaiting runs</span>
          </div>
        </div>
        <div className="surface-card px-2">
          {snapshot.questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </>
  );
}
