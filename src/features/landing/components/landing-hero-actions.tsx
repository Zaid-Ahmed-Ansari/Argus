"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { LandingUser } from "@/features/landing/types";
import { cn } from "@/lib/utils";

type LandingHeroActionsProps = {
  user: LandingUser | null;
};

export function LandingHeroActions({ user }: LandingHeroActionsProps) {
  if (user) {
    return (
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
          <LayoutDashboard className="size-4" />
          Go to dashboard
        </Link>
        <Link
          href="/upload"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          <Upload className="size-4" />
          Upload logs
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-wrap gap-3">
      <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
        Create account
        <ArrowRight className="size-4" />
      </Link>
      <Link
        href="/sign-in"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
      >
        Sign in
      </Link>
    </div>
  );
}
