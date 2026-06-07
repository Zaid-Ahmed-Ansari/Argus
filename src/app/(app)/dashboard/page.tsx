import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { requireSession } from "@/lib/auth-session";
import { DashboardContent } from "@/app/(app)/dashboard/dashboard-content";
import { DashboardBoneyardFallback } from "@/components/boneyard/dashboard-boneyard-fallback";

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/sign-in");
  }

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

      <Suspense fallback={<DashboardBoneyardFallback />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
