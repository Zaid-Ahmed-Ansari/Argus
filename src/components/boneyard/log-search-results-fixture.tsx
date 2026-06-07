import Link from "next/link";
import { formatDate } from "@/utils/format";

export function LogSearchResultsFixture() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">3 results for &quot;failed password&quot;</p>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-md border border-border px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link href="/incidents/fixture-1" className="text-sm font-medium hover:underline">
              SSH brute force attempt
            </Link>
            <span className="text-xs text-muted-foreground">
              auth.log · {formatDate(new Date().toISOString())}
            </span>
          </div>
          <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
            Failed password for admin from 192.168.1.50 port 22
          </p>
        </div>
      ))}
    </div>
  );
}
