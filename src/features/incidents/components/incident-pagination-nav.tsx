"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IncidentPagination } from "@/features/incidents/components/incident-pagination";

type IncidentPaginationNavProps = {
  total: number;
  limit: number;
  offset: number;
};

export function IncidentPaginationNav({
  total,
  limit,
  offset,
}: IncidentPaginationNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (nextOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextOffset <= 0) {
      params.delete("offset");
    } else {
      params.set("offset", String(nextOffset));
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <IncidentPagination
      total={total}
      limit={limit}
      offset={offset}
      onPageChange={handlePageChange}
    />
  );
}
