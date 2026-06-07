"use client";

import { NamedSkeleton } from "@/components/boneyard/named-skeleton";
import { IncidentsListFixture } from "@/components/boneyard/fixtures/incidents-list-fixture";

export function IncidentsBoneyardFallback() {
  return (
    <NamedSkeleton
      name="incidents-list"
      loading
      fixture={<IncidentsListFixture />}
    />
  );
}
