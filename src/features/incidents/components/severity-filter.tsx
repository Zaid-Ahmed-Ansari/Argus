"use client";

import { cn } from "@/lib/utils";
import type { SeverityLevel } from "@/types/incident";

const SEVERITIES: Array<SeverityLevel | "ALL"> = [
  "ALL",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

type SeverityFilterProps = {
  value: SeverityLevel | "ALL";
  onChange: (value: SeverityLevel | "ALL") => void;
};

export function SeverityFilter({ value, onChange }: SeverityFilterProps) {
  return (
    <div
      className="inline-flex rounded-md border border-border p-0.5"
      role="group"
      aria-label="Filter by severity"
    >
      {SEVERITIES.map((severity) => (
        <button
          key={severity}
          type="button"
          onClick={() => onChange(severity)}
          className={cn(
            "rounded-[calc(var(--radius)-2px)] px-4 py-2 text-base font-medium transition-colors duration-200",
            value === severity
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {severity === "ALL" ? "All" : severity}
        </button>
      ))}
    </div>
  );
}
