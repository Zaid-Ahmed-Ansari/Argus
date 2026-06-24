"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { EnrichedQuestion } from "@/lib/argus-research/types";
import { cn } from "@/lib/utils";

type ArgusQuestionCardProps = {
  question: EnrichedQuestion;
};

const STATUS_STYLE = {
  answered: "finding-success text-success",
  in_progress: "finding-warning text-warning",
  open: "bg-muted text-muted-foreground",
} as const;

export function ArgusQuestionCard({ question }: ArgusQuestionCardProps) {
  const [open, setOpen] = useState(question.status === "answered");

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-4 px-4 py-5 text-left transition-colors hover:bg-surface"
      >
        <span className="font-mono text-sm font-semibold text-muted-foreground">
          {question.id}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium leading-snug">{question.question}</p>
          <span
            className={cn(
              "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
              STATUS_STYLE[question.status],
            )}
          >
            {question.status.replace("_", " ")}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="border-t border-border bg-surface/50 px-4 py-4 pl-14">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Methodology
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{question.methodology}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Finding
          </p>
          <p className="mt-2 text-sm leading-relaxed">{question.finding}</p>
        </div>
      ) : null}
    </div>
  );
}
