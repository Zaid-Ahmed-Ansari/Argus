import { NextResponse } from "next/server";
import type { ApiError } from "@/types/api";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export function jsonSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

export function jsonError(
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status, headers: NO_STORE },
  );
}

export function jsonUnauthorized(
  message = "Unauthorized",
): NextResponse<ApiError> {
  return jsonError(message, 401);
}

export function jsonNotFound(message = "Resource not found"): NextResponse<ApiError> {
  return jsonError(message, 404);
}

export function jsonServerError(
  message = "Internal server error",
): NextResponse<ApiError> {
  return jsonError(message, 500);
}

export function jsonServiceUnavailable(
  message = "Service temporarily unavailable",
): NextResponse<ApiError> {
  return jsonError(message, 503);
}

export function jsonTooManyRequests(
  message = "Too many requests",
  resetAt?: number,
): NextResponse<ApiError> {
  const headers: Record<string, string> = { ...NO_STORE };
  if (resetAt) {
    headers["Retry-After"] = String(Math.ceil((resetAt - Date.now()) / 1000));
  }
  return NextResponse.json({ error: message }, { status: 429, headers });
}
