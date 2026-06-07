import "dotenv/config";
import { embedAllMissingChunks } from "../src/services/rag/chunk-embedding.service";
import { countChunksMissingEmbeddings } from "../src/services/rag/vector-storage";

async function main() {
  const missingBefore = await countChunksMissingEmbeddings();
  console.log(`Chunks missing embeddings: ${missingBefore}`);

  const embedded = await embedAllMissingChunks();
  const missingAfter = await countChunksMissingEmbeddings();

  console.log(`Embedded ${embedded} chunk(s). Remaining without embeddings: ${missingAfter}`);
}

main().catch((error: unknown) => {
  console.error("Embedding backfill failed:", error);
  process.exit(1);
});
