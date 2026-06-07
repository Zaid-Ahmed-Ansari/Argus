"use client";

import { NamedSkeleton } from "@/components/boneyard/named-skeleton";
import { DashboardFixture } from "@/components/boneyard/fixtures/dashboard-fixture";

export function DashboardBoneyardFallback() {
  return (
    <NamedSkeleton
      name="dashboard-content"
      loading
      fixture={<DashboardFixture />}
    />
  );
}
