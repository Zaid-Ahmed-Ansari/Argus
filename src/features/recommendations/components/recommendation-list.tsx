type RecommendationListProps = {
  recommendations: string[];
};

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No recommendations generated yet.
      </p>
    );
  }

  return (
    <ol className="list-decimal space-y-2 pl-5 text-sm">
      {recommendations.map((item, index) => (
        <li key={index} className="text-muted-foreground">
          {item}
        </li>
      ))}
    </ol>
  );
}
