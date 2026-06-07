import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}

export async function storeChunkEmbedding(
  chunkId: string,
  embedding: number[],
): Promise<void> {
  await prisma.documentChunk.update({
    where: { id: chunkId },
    data: { embedding },
  });
}

export async function countChunksMissingEmbeddings(): Promise<number> {
  const count = await prisma.documentChunk.count({
    where: { embedding: { equals: Prisma.DbNull } },
  });
  return count;
}
