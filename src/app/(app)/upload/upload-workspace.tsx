"use client";

import { useRouter } from "next/navigation";
import { LogUploadForm } from "@/features/logs";
import { useAnalyzeLogs } from "@/hooks/use-incidents";
import { useUploadStore } from "@/stores/upload-store";
import { toast } from "@/lib/toast";

type UploadWorkspaceProps = {
  ragModeLabel?: string;
};

export function UploadWorkspace({ ragModeLabel = "hybrid search" }: UploadWorkspaceProps) {
  const router = useRouter();
  const {
    logs,
    uploadId,
    inputMode,
    usedRag,
    setIsAnalyzing,
    setLastIncidentId,
    setUsedRag,
  } = useUploadStore();
  const analyze = useAnalyzeLogs();

  const handleSubmit = () => {
    const isFile = inputMode === "file" && uploadId;
    const isPaste = logs.trim().length > 0;
    if (!isFile && !isPaste) return;

    setIsAnalyzing(true);
    analyze.mutate(
      isFile
        ? { uploadId: uploadId!, usedRag }
        : { logs, usedRag },
      {
        onSuccess: (data) => {
          toast.success("Analysis complete");
          if (data.incidentId) {
            setLastIncidentId(data.incidentId);
            router.push(`/incidents/${data.incidentId}`);
          }
        },
        onSettled: () => setIsAnalyzing(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-start gap-3 text-base">
        <input
          type="checkbox"
          checked={usedRag}
          onChange={(e) => setUsedRag(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border"
        />
        <span>
          <span className="font-medium">Include knowledge base context</span>
          <span className="mt-0.5 block text-base text-muted-foreground">
            Retrieves MITRE-aligned playbook excerpts via {ragModeLabel}.
          </span>
        </span>
      </label>
      <LogUploadForm onSubmit={handleSubmit} isLoading={analyze.isPending} />
    </div>
  );
}
