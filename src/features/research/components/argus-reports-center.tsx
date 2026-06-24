"use client";

import { useState } from "react";
import type { ArgusReportsData } from "@/lib/argus-research/types";

type ArgusReportsCenterProps = {
  data: ArgusReportsData;
  fullReportMarkdown: string;
};

export function ArgusReportsCenter({
  data,
  fullReportMarkdown,
}: ArgusReportsCenterProps) {
  const [preview, setPreview] = useState(false);

  const download = () => {
    const blob = new Blob([fullReportMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "argus-research-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {preview ? "Hide preview" : "Preview report"}
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Download markdown
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.sections.map((section) => (
          <div key={section.id} className="surface-card p-4">
            <p className="font-medium">{section.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{section.summary}</p>
          </div>
        ))}
      </div>

      {preview ? (
        <pre className="max-h-[32rem] overflow-auto rounded-lg border border-border bg-muted/20 p-6 text-xs leading-relaxed whitespace-pre-wrap">
          {fullReportMarkdown}
        </pre>
      ) : null}
    </div>
  );
}
