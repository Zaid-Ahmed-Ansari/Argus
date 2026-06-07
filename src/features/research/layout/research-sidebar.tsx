"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Database,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  HelpCircle,
  FileText,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/research", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/research/datasets", label: "Datasets", icon: Database },
  { href: "/research/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/research/results", label: "Results", icon: LineChart },
  { href: "/research/questions", label: "Questions", icon: HelpCircle },
  { href: "/research/reports", label: "Reports", icon: FileText },
] as const;

export function ResearchSidebar() {
  const pathname = usePathname();

  return (
    <aside className="research-sidebar hidden w-60 shrink-0 border-r border-border bg-surface lg:block">
      <div className="sticky top-0 flex h-full flex-col px-3 py-6">
        <div className="mb-8 px-2">
          <BrandLogo href="/" size={32} wordmarkClassName="text-sm" />
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            AI Security Research
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              "exact" in item && item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface-interactive hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border px-2 pt-4">
          <Link
            href="/research/reports"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="size-3.5" />
            Export report
          </Link>
        </div>
      </div>
    </aside>
  );
}
