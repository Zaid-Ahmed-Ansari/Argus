/**
 * Origins Better Auth accepts for CSRF / callback validation.
 * Includes production URL, Vercel preview hostnames, and localhost in development.
 */
export function getTrustedAuthOrigins(): string[] {
  const origins = new Set<string>();

  if (process.env.BETTER_AUTH_URL) {
    origins.add(process.env.BETTER_AUTH_URL);
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.add(process.env.NEXT_PUBLIC_APP_URL);
  }

  // Vercel preview deployments (VERCEL_URL has no scheme)
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
  }

  return [...origins];
}
