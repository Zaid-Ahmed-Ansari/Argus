/** Shared TTL for incidents list + dashboard stats (seconds). */
export const INCIDENTS_CACHE_SECONDS = 60;

export function incidentsCacheTag(userId: string): string {
  return `incidents-${userId}`;
}
