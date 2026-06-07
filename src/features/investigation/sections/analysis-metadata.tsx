import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import type { AnalysisMetadata } from "@/types/investigation";

type AnalysisMetadataSectionProps = {
  metadata: AnalysisMetadata;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

export function AnalysisMetadataSection({
  metadata,
}: AnalysisMetadataSectionProps) {
  return (
    <InvestigationSection
      id="metadata"
      title="Analysis Metadata"
      description="Forensic transparency — model, knowledge sources, and processing statistics."
    >
      <div className="rounded-lg border border-border bg-card px-6 py-2 font-mono text-sm">
        <MetaRow label="Model" value={metadata.model} />
        <MetaRow
          label="Knowledge Sources"
          value={metadata.knowledgeSources.join(" · ")}
        />
        <MetaRow
          label="Logs Processed"
          value={String(metadata.logsProcessed)}
        />
        <MetaRow
          label="Incidents Detected"
          value={String(metadata.incidentsDetected)}
        />
        <MetaRow label="Confidence" value={`${metadata.confidence}%`} />
        <MetaRow
          label="Analysis Time"
          value={`${(metadata.analysisTimeMs / 1000).toFixed(1)}s`}
        />
        <MetaRow label="Prompt Version" value={metadata.promptVersion} />
        <MetaRow label="Provider" value={metadata.provider} />
        <MetaRow label="RAG Enabled" value={metadata.usedRag ? "Yes" : "No"} />
      </div>
    </InvestigationSection>
  );
}
