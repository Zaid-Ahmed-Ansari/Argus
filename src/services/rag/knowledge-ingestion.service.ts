import { prisma } from "@/lib/prisma";
import { embedChunksForDocument } from "@/services/rag/chunk-embedding.service";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

export type KnowledgeInput = {
  source: string;
  title: string;
  content: string;
  metadata?: Record<string, string>;
};

async function createChunks(documentId: string, input: KnowledgeInput): Promise<void> {
  const chunks = chunkText(input.content);
  await prisma.documentChunk.createMany({
    data: chunks.map((content, chunkIndex) => ({
      documentId,
      content,
      chunkIndex,
      metadata: input.metadata,
    })),
  });
}

export async function ingestKnowledgeDocument(
  input: KnowledgeInput,
): Promise<string> {
  const existing = await prisma.knowledgeDocument.findFirst({
    where: { source: input.source, title: input.title },
  });

  let documentId: string;

  if (existing) {
    await prisma.documentChunk.deleteMany({ where: { documentId: existing.id } });
    await prisma.knowledgeDocument.update({
      where: { id: existing.id },
      data: {
        content: input.content,
        metadata: input.metadata,
      },
    });
    documentId = existing.id;
  } else {
    const doc = await prisma.knowledgeDocument.create({
      data: {
        source: input.source,
        title: input.title,
        content: input.content,
        metadata: input.metadata,
      },
    });
    documentId = doc.id;
  }

  await createChunks(documentId, input);

  try {
    await embedChunksForDocument(documentId);
  } catch (error) {
    console.warn(
      `Embedding skipped for ${input.title}:`,
      error instanceof Error ? error.message : error,
    );
  }

  return documentId;
}
