"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ResearchGraphData } from "@/lib/research-types";

type ResearchGraphProps = {
  data: ResearchGraphData;
};

export function ResearchGraph({ data }: ResearchGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const scenarioY = 0;
    data.scenarios.slice(0, 4).forEach((s, i) => {
      nodes.push({
        id: `ds-${s.id}`,
        position: { x: i * 200, y: scenarioY },
        data: { label: s.name },
        style: {
          background: "#FAFAFA",
          border: "1px solid #E5E7EB",
          borderRadius: 6,
          fontSize: 11,
          padding: "8px 12px",
          color: "#111827",
        },
        sourcePosition: Position.Bottom,
      });
    });

    data.experiments.forEach((exp, i) => {
      const id = `exp-${exp.id}`;
      nodes.push({
        id,
        position: { x: i * 220, y: 120 },
        data: { label: exp.name },
        style: {
          background: "#111827",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 11,
          padding: "8px 12px",
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      });
      data.scenarios.slice(0, 2).forEach((s, j) => {
        if (i === j % data.experiments.length) {
          edges.push({
            id: `e-${s.id}-${exp.id}`,
            source: `ds-${s.id}`,
            target: id,
            style: { stroke: "#D1D5DB" },
          });
        }
      });
    });

    if (data.resultCount > 0) {
      nodes.push({
        id: "results",
        position: { x: 200, y: 240 },
        data: { label: `${data.resultCount} runs` },
        style: {
          background: "#FAFAFA",
          border: "1px solid #16A34A",
          borderRadius: 6,
          fontSize: 11,
          padding: "8px 12px",
          color: "#16A34A",
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      });
      data.experiments.forEach((exp) => {
        edges.push({
          id: `r-${exp.id}`,
          source: `exp-${exp.id}`,
          target: "results",
          style: { stroke: "#D1D5DB" },
        });
      });
    }

    if (data.answeredCount > 0) {
      nodes.push({
        id: "rq",
        position: { x: 200, y: 360 },
        data: { label: `${data.answeredCount} hypotheses tested` },
        style: {
          background: "#FAFAFA",
          border: "1px solid #E5E7EB",
          borderRadius: 6,
          fontSize: 11,
          padding: "8px 12px",
        },
        targetPosition: Position.Top,
      });
      edges.push({
        id: "rq-edge",
        source: "results",
        target: "rq",
        style: { stroke: "#111827" },
      });
    }

    return { nodes, edges };
  }, [data]);

  if (nodes.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[#6B7280]">
        Run experiments to populate the research graph.
      </p>
    );
  }

  return (
    <div className="h-[420px] rounded-lg border border-[#E5E7EB] bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
      >
        <Background color="#F3F4F6" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#FAFAFA"
          maskColor="rgba(255,255,255,0.8)"
          style={{ border: "1px solid #E5E7EB" }}
        />
      </ReactFlow>
    </div>
  );
}
