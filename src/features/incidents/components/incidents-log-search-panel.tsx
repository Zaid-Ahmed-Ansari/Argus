"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const IncidentsLogSearchPanel = dynamic(
  () =>
    import("@/features/logs").then((mod) => ({ default: mod.LogSearchPanel })),
  {
    loading: () => <Skeleton className="mb-6 h-36 w-full rounded-lg" />,
    ssr: false,
  },
);
