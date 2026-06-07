import Link from "next/link";
import { ArrowRight, LayoutDashboard, Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LandingUser } from "@/features/landing/types";

type LandingCtaProps = {
  user: LandingUser | null;
};

export function LandingCta({ user }: LandingCtaProps) {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-10">
          {user ? (
            <>
              <p className="text-base font-medium text-muted-foreground">
                Signed in as {user.name}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Continue your investigation
              </h2>
              <p className="mt-3 max-w-lg text-lg text-muted-foreground md:text-xl">
                Your dashboard and incident history are ready. Upload new logs
                or review recent analyses.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  <LayoutDashboard className="size-4" />
                  Open dashboard
                </Link>
                <Link
                  href="/upload"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                >
                  <Upload className="size-4" />
                  Upload logs
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Start analyzing logs in minutes
              </h2>
              <p className="mt-3 max-w-lg text-lg text-muted-foreground md:text-xl">
                Create a free account, upload your first log file, and get
                structured incident analysis on your private dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Create account
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
