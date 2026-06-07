"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NamedSkeleton } from "@/components/boneyard/named-skeleton";
import { LogSearchResultsFixture } from "@/components/boneyard/log-search-results-fixture";
import { ErrorState } from "@/components/ui/error-state";
import { useLogSearch } from "@/hooks/use-log-search";
import { sanitizeSearchSnippet } from "@/lib/sanitize";
import { formatDate } from "@/utils/format";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

export function LogSearchPanel() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading, isError, error, refetch, isFetching } = useLogSearch(
    submitted,
    submitted.length >= 2,
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (query.length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }
    setSubmitted(query);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search logs</CardTitle>
        <p className="text-sm text-muted-foreground">
          Search across stored log files in your account.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex max-w-md gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. failed password, admin"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={input.trim().length < 2}
          >
            Search
          </Button>
        </form>

        {isError ? (
          <ErrorState
            title="Search failed"
            description={getErrorMessage(error, "Unable to search logs.")}
            onRetry={() => void refetch()}
            retryLabel={isFetching ? "Retrying..." : "Try again"}
          />
        ) : null}

        {submitted && !isError ? (
          <NamedSkeleton
            name="log-search-results"
            loading={isLoading}
            fixture={<LogSearchResultsFixture />}
          >
            {data ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {data.total} result{data.total === 1 ? "" : "s"} for &quot;
                  {data.query}&quot;
                </p>
                {data.results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No matching logs.</p>
                ) : (
                  data.results.map((result) => (
                    <div
                      key={result.id}
                      className="rounded-md border border-border px-4 py-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Link
                          href={`/incidents/${result.incidentId}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {result.incidentTitle}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {result.filename ?? "log"} ·{" "}
                          {formatDate(result.createdAt)}
                        </span>
                      </div>
                      <p
                        className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeSearchSnippet(result.snippet),
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </NamedSkeleton>
        ) : null}
      </CardContent>
    </Card>
  );
}
