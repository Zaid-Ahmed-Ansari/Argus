import type { ProgressStep } from "@/lib/research-types";
import { cn } from "@/lib/utils";

type ProgressTimelineProps = {
  steps: ProgressStep[];
};

export function ProgressTimeline({ steps }: ProgressTimelineProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                step.status === "complete" &&
                  "border-success bg-success text-white",
                step.status === "active" &&
                  "border-primary bg-primary text-primary-foreground",
                step.status === "pending" &&
                  "border-border bg-card text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
