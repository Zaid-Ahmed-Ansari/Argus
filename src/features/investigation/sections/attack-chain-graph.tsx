"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { InvestigationSection } from "@/features/investigation/components/investigation-section";
import type { AttackChainStage } from "@/types/investigation";
import { cn } from "@/lib/utils";

type AttackChainGraphProps = {
  stages: AttackChainStage[];
  selectedStageId: string | null;
  onStageSelect: (stageId: string | null) => void;
};

export function AttackChainGraph({
  stages,
  selectedStageId,
  onStageSelect,
}: AttackChainGraphProps) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = sorted.map((stage, i) => ({
      id: stage.id,
      position: { x: 0, y: i * 100 },
      data: {
        label: `${stage.name}`,
        stageIndex: i + 1,
      },
      style: {
        background: selectedStageId === stage.id ? "#111827" : "#FFFFFF",
        color: selectedStageId === stage.id ? "#FFFFFF" : "#111827",
        border:
          selectedStageId === stage.id
            ? "2px solid #111827"
            : "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "12px 16px",
        width: 280,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    }));

    const edges: Edge[] = sorted.slice(0, -1).flatMap((stage, i) => {
      const next = sorted[i + 1];
      if (!next) return [];
      return [
        {
          id: `edge-${stage.id}`,
          source: stage.id,
          target: next.id,
          type: "smoothstep" as const,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#9CA3AF" },
          style: { stroke: "#9CA3AF", strokeWidth: 2 },
        },
      ];
    });

    return { nodes, edges };
  }, [sorted, selectedStageId]);

  const selected = sorted.find((s) => s.id === selectedStageId);

  return (
    <InvestigationSection
      id="attack-chain"
      title="Attack Chain Visualization"
      description="Kill-chain progression from initial access through exfiltration. Select a stage to filter the timeline."
      action={
        selectedStageId ? (
          <button
            type="button"
            onClick={() => onStageSelect(null)}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear filter
          </button>
        ) : null
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div
          className="order-2 h-[min(360px,50vh)] rounded-lg border border-border bg-card sm:h-[min(480px,60vh)] lg:order-1 lg:h-[min(640px,70vh)]"
          style={{ minHeight: sorted.length * 100 + 80 }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            panOnDrag={false}
            zoomOnScroll={false}
            onNodeClick={(_, node) =>
              onStageSelect(selectedStageId === node.id ? null : node.id)
            }
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#E5E7EB" gap={16} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <div className="order-1 rounded-lg border border-border bg-card p-4 sm:p-6 lg:order-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Stage Detail
          </p>
          {selected ? (
            <div className="mt-3">
              <h3 className="text-xl font-semibold">{selected.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {selected.description}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Timeline entries for this stage are highlighted below.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Click a stage in the attack chain to inspect context and filter
              correlated timeline events.
            </p>
          )}

          <div className="mt-8 space-y-2">
            {sorted.map((stage, i) => (
              <button
                key={stage.id}
                type="button"
                onClick={() =>
                  onStageSelect(
                    selectedStageId === stage.id ? null : stage.id,
                  )
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  selectedStageId === stage.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                <span className="font-mono text-xs opacity-70">{i + 1}</span>
                <span className="font-medium">{stage.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </InvestigationSection>
  );
}
