"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { EnrichedQuestion } from "@/lib/research-types";
import { cn } from "@/lib/utils";

type QuestionCardProps = {
  question: EnrichedQuestion;
};

const STATUS_STYLE = {
  answered: "finding-success text-success",
  in_progress: "finding-warning text-warning",
  open: "bg-muted text-muted-foreground",
} as const;

export function QuestionCard({ question }: QuestionCardProps) {
  const [open, setOpen] = useState(
    question.status === "answered" || question.status === "in_progress",
  );

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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                STATUS_STYLE[question.status],
              )}
            >
              {question.status.replace("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground">
              {question.evidenceRuns} evidence run
              {question.evidenceRuns === 1 ? "" : "s"}
            </span>
          </div>
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
            Finding
          </p>
          <p className="mt-2 text-sm leading-relaxed">{question.finding}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Linked experiments:{" "}
            {question.experiments.map((id, i) => (
              <span key={id}>
                {i > 0 ? ", " : ""}
                <Link
                  href={`/research/experiments/${encodeURIComponent(id)}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {id}
                </Link>
              </span>
            ))}
          </p>
        </div>
      ) : null}
    </div>
  );
}
