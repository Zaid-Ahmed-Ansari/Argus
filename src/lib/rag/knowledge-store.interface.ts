import type { RetrievedChunk } from "@/lib/rag/retriever.interface";

export type KnowledgeDocument = {
  id: string;
  source: string;
  title: string;
  content: string;
  metadata?: Record<string, string>;
};

export interface KnowledgeStore {
  upsert(document: KnowledgeDocument): Promise<void>;
  delete(id: string): Promise<void>;
  search(query: string, topK?: number): Promise<RetrievedChunk[]>;
}

export class NotImplementedKnowledgeStore implements KnowledgeStore {
  upsert(): Promise<void> {
    throw new Error("Not implemented: Phase 3 — KnowledgeStore");
  }

  delete(): Promise<void> {
    throw new Error("Not implemented: Phase 3 — KnowledgeStore");
  }

  search(): Promise<RetrievedChunk[]> {
    throw new Error("Not implemented: Phase 3 — KnowledgeStore");
  }
}
