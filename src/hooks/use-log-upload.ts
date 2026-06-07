"use client";

import { useMutation } from "@tanstack/react-query";

export type LogUploadResult = {
  uploadId: string;
  filename: string;
  sizeBytes: number;
  lineCount: number;
  storagePath: string;
};

async function uploadLogFile(file: File): Promise<LogUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/logs/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Upload failed");
  }

  return res.json() as Promise<LogUploadResult>;
}

export function useLogUpload() {
  return useMutation({
    mutationFn: uploadLogFile,
  });
}
