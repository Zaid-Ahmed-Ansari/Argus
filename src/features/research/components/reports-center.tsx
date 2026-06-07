"use client";

import { FileText, Download } from "lucide-react";
import type { ReportItem } from "@/lib/research-types";
import { Button } from "@/components/ui/button";

type ReportsCenterProps = {
  reports: ReportItem[];
  fullReportMarkdown: string;
};

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsCenter({
  reports,
  fullReportMarkdown,
}: ReportsCenterProps) {
  const primary = reports.filter((r) => !r.id.startsWith("section-"));

  return (
    <div className="research-section-gap">
      <div className="surface-card flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold">Full evaluation report</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Exportable research report covering corpus, experiments, all 15
            research questions, leaderboard, methodology, and the path toward
            fine-tuning an open-source SOC model. Suitable for mentor review.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() =>
            downloadFile(
              fullReportMarkdown,
              `argus-research-report-${new Date().toISOString().split("T")[0]}.md`,
            )
          }
          className="shrink-0"
        >
          <Download className="size-4" />
          Download full report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {primary.map((report) => (
          <article key={report.id} className="surface-card p-5">
            <FileText className="size-5 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">{report.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.description}
            </p>
            <p className="mt-3 font-mono text-xs capitalize text-muted-foreground">
              {report.type}
            </p>
          </article>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Report sections</h2>
        <div className="surface-card divide-y divide-border">
          {reports
            .filter((r) => r.id.startsWith("section-"))
            .map((section) => (
              <div key={section.id} className="px-5 py-4">
                <p className="font-medium">{section.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
