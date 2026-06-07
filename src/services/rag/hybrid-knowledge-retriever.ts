import { RAG_TOP_K, RRF_RANK_CONSTANT } from "@/lib/constants";
import type { RetrievedChunk, Retriever } from "@/lib/rag/retriever.interface";
import { ftsKnowledgeRetriever } from "@/services/rag/fts-knowledge-retriever";
import { vectorKnowledgeRetriever } from "@/services/rag/vector-knowledge-retriever";

function fuseRankedLists(
  lists: RetrievedChunk[][],
  topK: number,
): RetrievedChunk[] {
  const scores = new Map<string, { chunk: RetrievedChunk; score: number }>();

  for (const list of lists) {
    list.forEach((chunk, index) => {
      const rank = index + 1;
      const rrf = 1 / (RRF_RANK_CONSTANT + rank);
      const existing = scores.get(chunk.id);
      if (existing) {
        existing.score += rrf;
      } else {
        scores.set(chunk.id, { chunk, score: rrf });
      }
    });
  }

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk, score }) => ({ ...chunk, score }));
}

export class HybridKnowledgeRetriever implements Retriever {
  async retrieve(query: string, options?: { topK?: number }): Promise<RetrievedChunk[]> {
    const topK = options?.topK ?? RAG_TOP_K;

    const [fts, vector] = await Promise.all([
      ftsKnowledgeRetriever.retrieve(query, { topK }),
      vectorKnowledgeRetriever.retrieve(query, { topK }),
    ]);

    if (vector.length === 0) return fts;
    if (fts.length === 0) return vector;

    return fuseRankedLists([fts, vector], topK);
  }
}

export const hybridKnowledgeRetriever = new HybridKnowledgeRetriever();
