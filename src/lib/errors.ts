export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
}

export function isNotFoundError(error: unknown): boolean {
  const message = getErrorMessage(error, "").toLowerCase();
  return message.includes("not found");
}
