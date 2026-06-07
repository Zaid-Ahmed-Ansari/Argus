import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/format";

type FileLoadSummaryProps = {
  fileName: string;
  fileSize: number;
  lineCount: number;
  storedOnServer?: boolean;
  storageLabel?: string;
  onClear: () => void;
};

export function FileLoadSummary({
  fileName,
  fileSize,
  lineCount,
  storedOnServer,
  storageLabel = "server storage",
  onClear,
}: FileLoadSummaryProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-muted/30 px-4 py-3">
      <div className="flex min-w-0 gap-3">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{fileName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {lineCount.toLocaleString()} lines · {formatFileSize(fileSize)}
            {storedOnServer ? ` · ${storageLabel}` : ""}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            File is stored on the server and ready for analysis. Content is not
            expanded here to keep the page fast with large logs.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClear}
        aria-label="Remove file"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
