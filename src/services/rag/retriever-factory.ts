import { env } from "@/lib/env";
import type { Retriever } from "@/lib/rag/retriever.interface";
import { ftsKnowledgeRetriever } from "@/services/rag/fts-knowledge-retriever";
import { hybridKnowledgeRetriever } from "@/services/rag/hybrid-knowledge-retriever";
import { vectorKnowledgeRetriever } from "@/services/rag/vector-knowledge-retriever";

export type RagRetrieverMode = "fts" | "vector" | "hybrid";

export function getKnowledgeRetriever(
  mode: RagRetrieverMode = env.RAG_RETRIEVER_MODE,
): Retriever {
  switch (mode) {
    case "fts":
      return ftsKnowledgeRetriever;
    case "vector":
      return vectorKnowledgeRetriever;
    case "hybrid":
    default:
      return hybridKnowledgeRetriever;
  }
}

export function getRetrieverModeLabel(mode: RagRetrieverMode = env.RAG_RETRIEVER_MODE): string {
  switch (mode) {
    case "fts":
      return "Keyword search (FTS)";
    case "vector":
      return "Semantic search (vectors)";
    case "hybrid":
    default:
      return "Hybrid search (FTS + semantic)";
  }
}
