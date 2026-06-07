export type CoverageAxis =
  | "no_rag"
  | "hybrid_rag"
  | "raw_input"
  | "structured_input";

export const COVERAGE_AXES: { id: CoverageAxis; label: string }[] = [
  { id: "no_rag", label: "No RAG" },
  { id: "hybrid_rag", label: "Hybrid RAG" },
  { id: "raw_input", label: "Raw logs" },
  { id: "structured_input", label: "Structured" },
];
