import { create } from "zustand";

type InputMode = "empty" | "paste" | "file";

type UploadState = {
  logs: string;
  inputMode: InputMode;
  fileName: string | null;
  fileSize: number | null;
  uploadId: string | null;
  lineCount: number | null;
  isUploading: boolean;
  isAnalyzing: boolean;
  lastIncidentId: string | null;
  usedRag: boolean;
  setLogs: (logs: string) => void;
  setUsedRag: (value: boolean) => void;
  setUploading: (value: boolean) => void;
  setUploadedFile: (input: {
    uploadId: string;
    fileName: string;
    fileSize: number;
    lineCount: number;
  }) => void;
  setIsAnalyzing: (value: boolean) => void;
  setLastIncidentId: (id: string | null) => void;
  reset: () => void;
};

export const useUploadStore = create<UploadState>((set) => ({
  logs: "",
  inputMode: "empty",
  fileName: null,
  fileSize: null,
  uploadId: null,
  lineCount: null,
  isUploading: false,
  isAnalyzing: false,
  lastIncidentId: null,
  usedRag: true,
  setLogs: (logs) =>
    set({
      logs,
      inputMode: logs.trim() ? "paste" : "empty",
      fileName: null,
      fileSize: null,
      uploadId: null,
      lineCount: null,
    }),
  setUsedRag: (usedRag) => set({ usedRag }),
  setUploading: (isUploading) => set({ isUploading }),
  setUploadedFile: ({ uploadId, fileName, fileSize, lineCount }) =>
    set({
      uploadId,
      fileName,
      fileSize,
      lineCount,
      logs: "",
      inputMode: "file",
    }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setLastIncidentId: (lastIncidentId) => set({ lastIncidentId }),
  reset: () =>
    set({
      logs: "",
      inputMode: "empty",
      fileName: null,
      fileSize: null,
      uploadId: null,
      lineCount: null,
      isUploading: false,
      isAnalyzing: false,
      lastIncidentId: null,
      usedRag: true,
    }),
}));
