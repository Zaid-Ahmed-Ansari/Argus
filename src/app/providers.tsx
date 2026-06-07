"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BoneyardInit } from "@/components/boneyard/boneyard-init";
import { Toaster } from "@/components/ui/sonner";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            onError: (error) => {
              toast.error(error);
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BoneyardInit />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}

// Re-export for mutation handlers that need custom messages
export { getErrorMessage };
