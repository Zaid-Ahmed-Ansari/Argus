"use client";

import { NamedSkeleton } from "@/components/boneyard/named-skeleton";
import { DashboardFixture } from "@/components/boneyard/fixtures/dashboard-fixture";
import { IncidentsListFixture } from "@/components/boneyard/fixtures/incidents-list-fixture";
import { LogSearchFixture } from "@/components/boneyard/fixtures/log-search-fixture";
import { LogSearchResultsFixture } from "@/components/boneyard/log-search-results-fixture";

/**
 * Dev-only page for `npx boneyard-js build` to capture skeleton bones.
 * Visit http://localhost:3000/dev/bones while the dev server is running.
 */
export default function BoneyardCapturePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 p-8">
      <h1 className="text-2xl font-semibold">Boneyard capture</h1>

      <section>
        <h2 className="mb-4 text-lg font-medium">dashboard-content</h2>
        <NamedSkeleton name="dashboard-content" loading={false} fixture={<DashboardFixture />}>
          <DashboardFixture />
        </NamedSkeleton>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">incidents-list</h2>
        <NamedSkeleton name="incidents-list" loading={false} fixture={<IncidentsListFixture />}>
          <IncidentsListFixture />
        </NamedSkeleton>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">log-search</h2>
        <NamedSkeleton name="log-search" loading={false} fixture={<LogSearchFixture />}>
          <LogSearchFixture />
        </NamedSkeleton>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">log-search-results</h2>
        <NamedSkeleton
          name="log-search-results"
          loading={false}
          fixture={<LogSearchResultsFixture />}
        >
          <LogSearchResultsFixture />
        </NamedSkeleton>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Loading states (for registry)</h2>
        <div className="space-y-8">
          <NamedSkeleton name="dashboard-content" loading fixture={<DashboardFixture />} />
          <NamedSkeleton name="incidents-list" loading fixture={<IncidentsListFixture />} />
          <NamedSkeleton name="log-search" loading fixture={<LogSearchFixture />} />
          <NamedSkeleton
            name="log-search-results"
            loading
            fixture={<LogSearchResultsFixture />}
          />
        </div>
      </section>
    </div>
  );
}
