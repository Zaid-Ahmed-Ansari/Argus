import { prisma } from "@/lib/prisma";
import { RAG_TOP_K } from "@/lib/constants";
import type { RetrievedChunk, Retriever } from "@/lib/rag/retriever.interface";

type ChunkRow = {
  id: string;
  content: string;
  rank: number;
  source: string;
  title: string;
};

export class FtsKnowledgeRetriever implements Retriever {
  async retrieve(query: string, options?: { topK?: number }): Promise<RetrievedChunk[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const topK = options?.topK ?? RAG_TOP_K;

    const rows = await prisma.$queryRaw<ChunkRow[]>`
      SELECT
        dc.id,
        dc.content,
        kd.source,
        kd.title,
        ts_rank(dc.search_vector, plainto_tsquery('english', ${trimmed}))::float8 AS rank
      FROM "DocumentChunk" dc
      INNER JOIN "KnowledgeDocument" kd ON kd.id = dc."documentId"
      WHERE dc.search_vector @@ plainto_tsquery('english', ${trimmed})
      ORDER BY rank DESC
      LIMIT ${topK}
    `;

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      score: row.rank,
      metadata: {
        source: row.source,
        title: row.title,
      },
    }));
  }
}

export const ftsKnowledgeRetriever = new FtsKnowledgeRetriever();
