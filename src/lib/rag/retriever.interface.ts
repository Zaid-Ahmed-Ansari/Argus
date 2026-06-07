export type RetrievedChunk = {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, string>;
};

export type RetrieveOptions = {
  topK?: number;
  filter?: Record<string, string>;
};

export interface Retriever {
  retrieve(query: string, options?: RetrieveOptions): Promise<RetrievedChunk[]>;
}

export class NullRetriever implements Retriever {
  async retrieve(): Promise<RetrievedChunk[]> {
    return [];
  }
}
