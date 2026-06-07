import { requireSession } from "@/lib/auth-session";
import {
  MAX_LOG_BYTES,
  MAX_UPLOAD_PER_MINUTE,
} from "@/lib/constants";
import {
  jsonError,
  jsonServerError,
  jsonSuccess,
  jsonTooManyRequests,
  jsonUnauthorized,
} from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { cleanupStaleUploads } from "@/services/analysis/analyze-incident.service";
import { logUploadRepository } from "@/services/repositories/log-upload.repository";
import {
  ensureStorageDirs,
  saveStagingUpload,
} from "@/services/storage/log-file-storage.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!session) {
      return jsonUnauthorized();
    }

    const ip = getClientIp(request);
    const limit = rateLimit(
      `upload:${session.user.id}:${ip}`,
      MAX_UPLOAD_PER_MINUTE,
      60_000,
    );
    if (!limit.allowed) {
      return jsonTooManyRequests("Rate limit exceeded for uploads", limit.resetAt);
    }

    await ensureStorageDirs();
    void cleanupStaleUploads(session.user.id);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return jsonError("Missing file field", 400);
    }

    if (file.size === 0) {
      return jsonError("File is empty", 400);
    }

    if (file.size > MAX_LOG_BYTES) {
      return jsonError(
        `File exceeds ${(MAX_LOG_BYTES / 1_000_000).toFixed(1)} MB limit`,
        400,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadId = crypto.randomUUID();

    const saved = await saveStagingUpload({
      userId: session.user.id,
      uploadId,
      filename: file.name,
      mimeType: file.type || null,
      buffer,
      maxBytes: MAX_LOG_BYTES,
    });

    const record = await logUploadRepository.create({
      id: uploadId,
      userId: session.user.id,
      originalFilename: saved.originalFilename,
      storagePath: saved.relativePath,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      lineCount: saved.lineCount,
    });

    return jsonSuccess({
      uploadId: record.id,
      filename: record.originalFilename,
      sizeBytes: record.sizeBytes,
      lineCount: record.lineCount ?? 0,
      storagePath: record.storagePath,
    });
  } catch (error) {
    console.error("[POST /api/logs/upload]", error);

    if (error instanceof Error) {
      if (
        error.message.includes("allowed") ||
        error.message.includes("exceeds") ||
        error.message.includes("Unsupported")
      ) {
        return jsonError(error.message, 400);
      }
    }

    return jsonServerError("Failed to upload file");
  }
}
