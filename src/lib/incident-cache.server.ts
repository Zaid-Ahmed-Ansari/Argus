import { revalidateTag } from "next/cache";
import { incidentsCacheTag } from "@/lib/incident-cache";

export function revalidateIncidentsCache(userId: string): void {
  revalidateTag(incidentsCacheTag(userId), { expire: 0 });
}
