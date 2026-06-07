"use client";

import { useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileLoadSummary } from "@/features/logs/components/file-load-summary";
import { useLogUpload } from "@/hooks/use-log-upload";
import { useUploadConfig } from "@/hooks/use-upload-config";
import { useUploadThing } from "@/lib/uploadthing";
import { useUploadStore } from "@/stores/upload-store";
import { MAX_LOG_BYTES } from "@/lib/constants";
import { toast } from "@/lib/toast";

type LogUploadFormProps = {
  onSubmit: () => void;
  isLoading?: boolean;
};

type ServerUploadData = {
  uploadId: string;
  filename: string;
  sizeBytes: number;
  lineCount: number;
  provider?: "uploadthing" | "local";
};

export function LogUploadForm({ onSubmit, isLoading }: LogUploadFormProps) {
  const {
    logs,
    inputMode,
    fileName,
    fileSize,
    lineCount,
    uploadId,
    setLogs,
    setUploadedFile,
    setUploading,
    reset,
  } = useUploadStore();
  const { data: uploadConfig } = useUploadConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localUpload = useLogUpload();
  const [clearOpen, setClearOpen] = useState(false);

  const useUploadThingProvider = uploadConfig?.provider === "uploadthing";

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(
    "logUploader",
    {
      onClientUploadComplete: (res) => {
        const data = res[0]?.serverData as ServerUploadData | undefined;
        if (!data?.uploadId) {
          toast.error("Upload completed but server did not return an ID");
          return;
        }
        setUploadedFile({
          uploadId: data.uploadId,
          fileName: data.filename,
          fileSize: data.sizeBytes,
          lineCount: data.lineCount,
        });
        toast.success("File uploaded successfully");
      },
      onUploadError: (error) => {
        toast.error(error.message, "Upload failed");
      },
    },
  );

  const hasPasteContent = inputMode === "paste" && logs.trim().length > 0;
  const hasFileUpload = inputMode === "file" && uploadId !== null;
  const canAnalyze = hasPasteContent || hasFileUpload;
  const busy =
    isLoading || localUpload.isPending || isUploadThingUploading;

  const applyServerUpload = (data: ServerUploadData) => {
    setUploadedFile({
      uploadId: data.uploadId,
      fileName: data.filename,
      fileSize: data.sizeBytes,
      lineCount: data.lineCount,
    });
  };

  const handleLocalFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOG_BYTES) {
      toast.error(
        `File exceeds ${(MAX_LOG_BYTES / 1_000_000).toFixed(1)} MB limit.`,
      );
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const result = await localUpload.mutateAsync(file);
      applyServerUpload({ ...result, provider: "local" });
      toast.success("File uploaded successfully");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUploadThingPick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".log,.txt,.csv,text/plain";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > MAX_LOG_BYTES) {
        toast.error(
          `File exceeds ${(MAX_LOG_BYTES / 1_000_000).toFixed(1)} MB limit.`,
        );
        return;
      }
      setUploading(true);
      try {
        await startUpload([file]);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleFilePick = () => {
    if (useUploadThingProvider) {
      handleUploadThingPick();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleClearConfirm = () => {
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setClearOpen(false);
    toast.info("Log input cleared");
  };

  const displayLineCount =
    inputMode === "file"
      ? (lineCount ?? 0)
      : logs.split("\n").filter(Boolean).length;

  const storageLabel = useUploadThingProvider ? "cloud storage" : "server storage";

  return (
    <>
      <div className="flex flex-col gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".log,.txt,.csv"
          className="hidden"
          onChange={handleLocalFileChange}
        />

        {inputMode === "file" && fileName && fileSize !== null ? (
          <FileLoadSummary
            fileName={fileName}
            fileSize={fileSize}
            lineCount={displayLineCount}
            storedOnServer
            storageLabel={storageLabel}
            onClear={() => setClearOpen(true)}
          />
        ) : (
          <Textarea
            placeholder="Paste log lines here..."
            className="min-h-40 resize-y rounded-md font-mono text-sm"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            disabled={busy}
          />
        )}

        {busy && inputMode !== "file" ? (
          <p className="text-sm text-muted-foreground">
            Uploading to {storageLabel}...
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={onSubmit} disabled={!canAnalyze || busy}>
            {isLoading ? "Analyzing..." : "Analyze logs"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleFilePick}
            disabled={busy}
          >
            <Upload className="h-4 w-4" />
            {busy ? "Uploading..." : "Upload file"}
          </Button>
          {canAnalyze ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setClearOpen(true)}
              disabled={busy}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          ) : null}
          {canAnalyze ? (
            <span className="ml-auto text-xs text-muted-foreground">
              {displayLineCount.toLocaleString()} lines
              {hasFileUpload ? ` · ${storageLabel}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear log input?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes pasted text or the uploaded file reference from this
              form. Your saved incidents are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearConfirm}>
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
