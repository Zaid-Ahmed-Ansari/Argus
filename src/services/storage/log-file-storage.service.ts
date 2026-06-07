import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  getStorageRoot,
  resolveStoragePath,
  sanitizeFilename,
  toRelativeStoragePath,
} from "@/lib/storage-paths";
import { countLogLines } from "@/utils/format";

const ALLOWED_EXTENSIONS = new Set([".log", ".txt", ".csv"]);
const ALLOWED_MIME = new Set([
  "text/plain",
  "text/csv",
  "application/octet-stream",
]);

export type SavedUpload = {
  relativePath: string;
  absolutePath: string;
  originalFilename: string;
  mimeType: string | null;
  sizeBytes: number;
  lineCount: number;
  content: string;
};

function assertAllowedFile(filename: string, mimeType: string | null): void {
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Only .log, .txt, and .csv files are allowed");
  }
  if (mimeType && !ALLOWED_MIME.has(mimeType)) {
    throw new Error("Unsupported file type");
  }
}

export async function saveStagingUpload(input: {
  userId: string;
  uploadId: string;
  filename: string;
  mimeType: string | null;
  buffer: Buffer;
  maxBytes: number;
}): Promise<SavedUpload> {
  if (input.buffer.length > input.maxBytes) {
    throw new Error(`File exceeds maximum size of ${input.maxBytes} bytes`);
  }

  assertAllowedFile(input.filename, input.mimeType);

  const safeName = sanitizeFilename(input.filename);
  const relativePath = path.join(
    "uploads",
    "staging",
    input.userId,
    input.uploadId,
    safeName,
  );
  const absolutePath = resolveStoragePath(relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, input.buffer);

  const content = input.buffer.toString("utf-8");
  if (content.length > input.maxBytes) {
    await rm(absolutePath, { force: true });
    throw new Error("File content exceeds maximum allowed size");
  }

  return {
    relativePath: toRelativeStoragePath(absolutePath),
    absolutePath,
    originalFilename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.length,
    lineCount: countLogLines(content),
    content,
  };
}

export function isExternalStorageRef(ref: string): boolean {
  return ref.startsWith("https://") || ref.startsWith("http://");
}

export async function readStoredLog(storageRef: string): Promise<string> {
  if (isExternalStorageRef(storageRef)) {
    const response = await fetch(storageRef);
    if (!response.ok) {
      throw new Error("Failed to fetch log from external storage");
    }
    return response.text();
  }

  const absolutePath = resolveStoragePath(storageRef);
  return readFile(absolutePath, "utf-8");
}

export async function promoteToIncidentStorage(input: {
  userId: string;
  incidentId: string;
  stagingRelativePath: string;
  filename: string;
}): Promise<string> {
  const stagingAbsolute = resolveStoragePath(input.stagingRelativePath);
  const safeName = sanitizeFilename(input.filename);
  const destRelative = path.join(
    "uploads",
    "incidents",
    input.userId,
    input.incidentId,
    safeName,
  );
  const destAbsolute = resolveStoragePath(destRelative);

  await mkdir(path.dirname(destAbsolute), { recursive: true });
  await rename(stagingAbsolute, destAbsolute);

  // Remove empty staging directory if possible
  const stagingDir = path.dirname(stagingAbsolute);
  await rm(stagingDir, { recursive: true, force: true }).catch(() => {});

  return toRelativeStoragePath(destAbsolute);
}

export async function savePastedLog(input: {
  userId: string;
  incidentId: string;
  content: string;
}): Promise<{ relativePath: string; sizeBytes: number }> {
  const relativePath = path.join(
    "uploads",
    "incidents",
    input.userId,
    input.incidentId,
    "pasted-logs.txt",
  );
  const absolutePath = resolveStoragePath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(input.content, "utf-8");
  await writeFile(absolutePath, buffer);

  return {
    relativePath: toRelativeStoragePath(absolutePath),
    sizeBytes: buffer.length,
  };
}

export async function deleteStoredFile(storageRef: string): Promise<void> {
  if (isExternalStorageRef(storageRef)) {
    return;
  }
  const absolutePath = resolveStoragePath(storageRef);
  await rm(absolutePath, { force: true });
}

export async function ensureStorageDirs(): Promise<void> {
  await mkdir(path.join(getStorageRoot(), "uploads", "staging"), {
    recursive: true,
  });
  await mkdir(path.join(getStorageRoot(), "uploads", "incidents"), {
    recursive: true,
  });
}
