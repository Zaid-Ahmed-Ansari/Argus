-- Phase 4b: semantic embeddings for hybrid RAG (JSONB — no pgvector extension required)

ALTER TABLE "DocumentChunk"
  ADD COLUMN IF NOT EXISTS embedding JSONB;
