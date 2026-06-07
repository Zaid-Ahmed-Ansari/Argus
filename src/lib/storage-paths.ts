import path from "node:path";

const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

export function getStorageRoot(): string {
  const configured = process.env.UPLOAD_DIR;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "storage");
}

export function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).slice(0, 200);
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (cleaned && SAFE_FILENAME.test(cleaned)) {
    return cleaned;
  }
  return `upload-${Date.now()}.txt`;
}

export function resolveStoragePath(relativePath: string): string {
  const root = path.resolve(getStorageRoot());
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Invalid storage path");
  }
  return resolved;
}

export function toRelativeStoragePath(absolutePath: string): string {
  const root = path.resolve(getStorageRoot());
  const resolved = path.resolve(absolutePath);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Path outside storage root");
  }
  return path.relative(root, resolved).split(path.sep).join("/");
}
