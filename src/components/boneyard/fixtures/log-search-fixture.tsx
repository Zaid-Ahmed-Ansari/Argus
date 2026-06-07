import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LogSearchFixture() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search logs</CardTitle>
        <p className="text-base text-muted-foreground">
          Search across stored log files in your account.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex max-w-md gap-2">
          <Input defaultValue="failed password" placeholder="e.g. failed password, admin" />
          <Button type="button" variant="outline">
            Search
          </Button>
        </form>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">3 results for &quot;failed password&quot;</p>
          <div className="rounded-md border border-border px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href="/incidents/fixture-1" className="text-base font-medium hover:underline">
                SSH brute force attempt
              </Link>
              <span className="text-sm text-muted-foreground">auth.log · Jun 4, 2025</span>
            </div>
            <p className="mt-2 font-mono text-sm leading-relaxed text-muted-foreground">
              Failed password for admin from 192.168.1.50 port 22
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
