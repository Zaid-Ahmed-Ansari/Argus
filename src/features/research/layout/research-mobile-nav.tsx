"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/research", label: "Overview", exact: true },
  { href: "/research/datasets", label: "Datasets" },
  { href: "/research/experiments", label: "Experiments" },
  { href: "/research/results", label: "Results" },
  { href: "/research/questions", label: "Questions" },
  { href: "/research/reports", label: "Reports" },
] as const;

export function ResearchMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-surface lg:hidden">
      <div className="flex gap-1 overflow-x-auto px-4 py-2">
        {TABS.map((tab) => {
          const active =
            "exact" in tab && tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-interactive",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
