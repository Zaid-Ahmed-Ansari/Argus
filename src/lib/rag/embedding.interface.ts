export interface EmbeddingProvider {
  readonly modelId: string;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export class NotImplementedEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = "not-implemented";

  embed(): Promise<number[]> {
    throw new Error("EmbeddingProvider not configured — set GEMINI_API_KEY");
  }

  embedBatch(): Promise<number[][]> {
    throw new Error("EmbeddingProvider not configured — set GEMINI_API_KEY");
  }
}
