"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { getErrorMessage } from "@/lib/errors";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <ErrorState
        title="Application error"
        description={getErrorMessage(error, "An unexpected error occurred.")}
        onRetry={reset}
      />
    </div>
  );
}
