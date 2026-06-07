"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SeverityFilter } from "@/features/incidents/components/severity-filter";
import type { SeverityLevel } from "@/types/incident";

type SeverityFilterNavProps = {
  value: SeverityLevel | "ALL";
};

export function SeverityFilterNav({ value }: SeverityFilterNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (next: SeverityLevel | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "ALL") {
      params.delete("severity");
    } else {
      params.set("severity", next);
    }
    params.delete("offset");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return <SeverityFilter value={value} onChange={handleChange} />;
}
