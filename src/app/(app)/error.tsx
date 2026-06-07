"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { getErrorMessage } from "@/lib/errors";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app route error]", error);
  }, [error]);

  return (
    <ErrorState
      title="Something went wrong"
      description={getErrorMessage(error, "This page failed to load.")}
      onRetry={reset}
      action={{ label: "Go to dashboard", href: "/dashboard" }}
      className="my-8"
    />
  );
}
