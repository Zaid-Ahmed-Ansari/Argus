import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AttackTypeLabel } from "@/features/analysis/components/attack-type-label";
import { SeverityBadge } from "@/features/incidents";

type AnalysisSummaryProps = {
  attackType: string;
  severity: string;
  summary: string;
};

export function AnalysisSummaryView({
  attackType,
  severity,
  summary,
}: AnalysisSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-medium">Summary</h2>
          <AttackTypeLabel attackType={attackType} />
          <SeverityBadge severity={severity} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
