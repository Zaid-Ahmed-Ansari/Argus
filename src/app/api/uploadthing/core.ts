import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { MAX_LOG_BYTES } from "@/lib/constants";
import { logUploadRepository } from "@/services/repositories/log-upload.repository";
import { countLogLines } from "@/utils/format";

const f = createUploadthing();

export const uploadRouter = {
  logUploader: f({
    text: {
      maxFileSize: "1MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new UploadThingError("You must be signed in to upload logs");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      const response = await fetch(url);
      if (!response.ok) {
        throw new UploadThingError("Failed to read uploaded file from storage");
      }

      const content = await response.text();
      if (content.length > MAX_LOG_BYTES) {
        throw new UploadThingError("File content exceeds maximum allowed size");
      }

      const uploadId = crypto.randomUUID();
      const record = await logUploadRepository.create({
        id: uploadId,
        userId: metadata.userId,
        originalFilename: file.name,
        storagePath: url,
        mimeType: file.type ?? null,
        sizeBytes: file.size,
        lineCount: countLogLines(content),
      });

      return {
        uploadId: record.id,
        filename: record.originalFilename,
        sizeBytes: record.sizeBytes,
        lineCount: record.lineCount ?? 0,
        provider: "uploadthing" as const,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
