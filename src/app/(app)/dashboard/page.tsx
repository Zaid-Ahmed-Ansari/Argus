import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { getSession } from "@/lib/auth-session";
import { DashboardContent } from "@/app/(app)/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Incident overview and recent analyses."
        action={
          <Link href="/upload" className={cn(buttonVariants({ size: "lg" }))}>
            Upload logs
          </Link>
        }
      />

      <Suspense fallback={<AppPageSkeleton />}>
        <DashboardContent userId={session!.user.id} />
      </Suspense>
    </div>
  );
}
