import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { RAG_TOP_K } from "@/lib/constants";
import type { RetrievedChunk, Retriever } from "@/lib/rag/retriever.interface";
import { geminiEmbeddingProvider } from "@/services/rag/gemini-embedding.provider";

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function parseEmbedding(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const nums = value.filter((v): v is number => typeof v === "number");
  return nums.length > 0 ? nums : null;
}

export class VectorKnowledgeRetriever implements Retriever {
  async retrieve(query: string, options?: { topK?: number }): Promise<RetrievedChunk[]> {
    const trimmed = query.trim();
    if (!trimmed || !geminiEmbeddingProvider.isConfigured()) {
      return [];
    }

    const topK = options?.topK ?? RAG_TOP_K;
    const [queryVector] = await geminiEmbeddingProvider.embedBatch([trimmed]);
    if (!queryVector?.length) return [];

    const rows = await prisma.documentChunk.findMany({
      where: { embedding: { not: Prisma.DbNull } },
      include: {
        document: {
          select: { source: true, title: true },
        },
      },
      take: 200,
    });

    const scored = rows
      .map((row) => {
        const vector = parseEmbedding(row.embedding);
        if (!vector) return null;
        return {
          id: row.id,
          content: row.content,
          score: cosineSimilarity(queryVector, vector),
          metadata: {
            source: row.document.source,
            title: row.document.title,
          },
        };
      })
      .filter((row) => row !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }
}

export const vectorKnowledgeRetriever = new VectorKnowledgeRetriever();
