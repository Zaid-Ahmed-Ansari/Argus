"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InvestigationNavigator } from "@/features/investigation/components/investigation-navigator";
import { CommandCenter } from "@/features/investigation/sections/command-center";
import { IncidentBreakdown } from "@/features/investigation/sections/incident-breakdown";
import { AttackChainGraph } from "@/features/investigation/sections/attack-chain-graph";
import { MitreMapping } from "@/features/investigation/sections/mitre-mapping";
import { StagedTimeline } from "@/features/investigation/sections/staged-timeline";
import { RootCause } from "@/features/investigation/sections/root-cause";
import { TieredRecommendationsSection } from "@/features/investigation/sections/tiered-recommendations";
import { AnalysisMetadataSection } from "@/features/investigation/sections/analysis-metadata";
import { ResearchInsights } from "@/features/investigation/sections/research-insights";
import { SeverityBadge } from "@/features/incidents/components/severity-badge";
import type { InvestigationReport } from "@/types/investigation";
import { INVESTIGATION_NAV_SECTIONS } from "@/types/investigation";

type InvestigationWorkspaceProps = {
  report: InvestigationReport;
};

export function InvestigationWorkspace({ report }: InvestigationWorkspaceProps) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const topSeverity = report.detectedIncidents.reduce<string>(
    (max, inc) => {
      const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const current = order[inc.severity as keyof typeof order] ?? 0;
      const best = order[max as keyof typeof order] ?? 0;
      return current > best ? inc.severity : max;
    },
    "LOW",
  );

  return (
    <div className="investigation-workspace -mx-4 bg-background px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <header
        id="investigation-workspace-header"
        className="mb-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            SOC Investigation Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {report.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs">
              {report.status}
            </span>
            <SeverityBadge severity={topSeverity} />
            <span>
              {report.commandCenter.totalIncidents} incidents ·{" "}
              {report.commandCenter.confidence}% confidence
            </span>
          </div>
        </div>
        <Link
          href="/incidents"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          All incidents
        </Link>
      </header>

      <InvestigationNavigator
        sections={INVESTIGATION_NAV_SECTIONS}
        variant="bar"
      />

      <div className="flex gap-10">
        <div className="min-w-0 flex-1 space-y-16">
          <CommandCenter
            metrics={report.commandCenter}
            generatedAt={report.generatedAt}
          />
          <IncidentBreakdown incidents={report.detectedIncidents} />
          <AttackChainGraph
            stages={report.attackChain}
            selectedStageId={selectedStageId}
            onStageSelect={setSelectedStageId}
          />
          <MitreMapping techniques={report.mitreTechniques} />
          <StagedTimeline
            stages={report.timelineStages}
            filterStageId={selectedStageId}
          />
          <RootCause findings={report.rootCauseFindings} />
          <TieredRecommendationsSection
            recommendations={report.recommendations}
          />
          <AnalysisMetadataSection metadata={report.metadata} />
          <ResearchInsights insights={report.researchInsights} />
        </div>

        <InvestigationNavigator
          sections={INVESTIGATION_NAV_SECTIONS}
          variant="rail"
        />
      </div>
    </div>
  );
}
