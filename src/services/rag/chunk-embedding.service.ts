import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { geminiEmbeddingProvider } from "@/services/rag/gemini-embedding.provider";
import { storeChunkEmbedding } from "@/services/rag/vector-storage";

export async function embedChunksForDocument(documentId: string): Promise<number> {
  if (!geminiEmbeddingProvider.isConfigured()) {
    return 0;
  }

  const chunks = await prisma.documentChunk.findMany({
    where: { documentId },
    orderBy: { chunkIndex: "asc" },
    select: { id: true, content: true },
  });

  if (chunks.length === 0) return 0;

  const vectors = await geminiEmbeddingProvider.embedBatch(
    chunks.map((c) => c.content),
  );

  await Promise.all(
    chunks.map((chunk, index) =>
      storeChunkEmbedding(chunk.id, vectors[index] ?? []),
    ),
  );

  return chunks.length;
}

export async function embedAllMissingChunks(): Promise<number> {
  if (!geminiEmbeddingProvider.isConfigured()) {
    console.warn("Skipping embeddings — GEMINI_API_KEY not set");
    return 0;
  }

  const chunks = await prisma.documentChunk.findMany({
    where: { embedding: { equals: Prisma.DbNull } },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true },
  });

  if (chunks.length === 0) return 0;

  const vectors = await geminiEmbeddingProvider.embedBatch(
    chunks.map((c) => c.content),
  );

  await Promise.all(
    chunks.map((chunk, index) =>
      storeChunkEmbedding(chunk.id, vectors[index] ?? []),
    ),
  );

  return chunks.length;
}
