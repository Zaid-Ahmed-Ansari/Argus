"use client";

import { useQuery } from "@tanstack/react-query";

type UploadConfig = {
  provider: "uploadthing" | "local";
};

async function fetchUploadConfig(): Promise<UploadConfig> {
  const res = await fetch("/api/logs/upload/config", { credentials: "include" });
  if (!res.ok) {
    return { provider: "local" };
  }
  return res.json() as Promise<UploadConfig>;
}

export function useUploadConfig() {
  return useQuery({
    queryKey: ["upload-config"],
    queryFn: fetchUploadConfig,
    staleTime: 60_000,
  });
}
