export type UploadProvider = "uploadthing" | "local";

export function getUploadProvider(): UploadProvider {
  if (process.env.UPLOADTHING_TOKEN?.trim()) {
    return "uploadthing";
  }
  return "local";
}

export function isUploadThingEnabled(): boolean {
  return getUploadProvider() === "uploadthing";
}
