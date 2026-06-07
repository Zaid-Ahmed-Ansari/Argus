"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import type { LeaderboardRow } from "@/lib/research-types";
import { cn } from "@/lib/utils";

type ResultsLeaderboardProps = {
  rows: LeaderboardRow[];
};

export function ResultsLeaderboard({ rows }: ResultsLeaderboardProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "accuracy", desc: true },
  ]);

  const columns = useMemo<ColumnDef<LeaderboardRow>[]>(
    () => [
      {
        accessorKey: "model",
        header: "Model",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.model}</span>
        ),
      },
      {
        accessorKey: "experiment",
        header: "Experiment",
        cell: ({ row }) => (
          <span className="text-[#374151]">{row.original.experiment}</span>
        ),
      },
      {
        accessorKey: "scenario",
        header: "Scenario",
        cell: ({ row }) => (
          <Link
            href={`/research/datasets?id=${row.original.scenario}`}
            className="hover:underline"
          >
            {row.original.scenario}
          </Link>
        ),
      },
      {
        accessorKey: "variant",
        header: "Variant",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.variant}</span>
        ),
      },
      {
        accessorKey: "accuracy",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Accuracy
            <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono tabular-nums",
              row.original.accuracy >= 0.7
                ? "text-[#16A34A]"
                : row.original.accuracy >= 0.5
                  ? "text-[#F59E0B]"
                  : "text-[#DC2626]",
            )}
          >
            {(row.original.accuracy * 100).toFixed(1)}%
          </span>
        ),
      },
      {
        accessorKey: "hallucinationRate",
        header: "Hallucination",
        cell: ({ row }) => (
          <span className="font-mono tabular-nums text-[#6B7280]">
            {(row.original.hallucinationRate * 100).toFixed(1)}%
          </span>
        ),
      },
      {
        accessorKey: "latencyMs",
        header: "Latency",
        cell: ({ row }) => (
          <span className="font-mono tabular-nums text-[#6B7280]">
            {Math.round(row.original.latencyMs)} ms
          </span>
        ),
      },
      {
        accessorKey: "relevance",
        header: "Relevance",
        cell: ({ row }) => (
          <span className="font-mono tabular-nums">
            {(row.original.relevance * 100).toFixed(1)}%
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[#E5E7EB] py-12 text-center text-sm text-[#6B7280]">
        No results yet. Run{" "}
        <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-xs">
          npm run experiment:all
        </code>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 font-medium text-[#6B7280]"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FAFAFA]"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
