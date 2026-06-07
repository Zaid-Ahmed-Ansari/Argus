import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import type { EmbeddingProvider } from "@/lib/rag/embedding.interface";

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly modelId: string;
  private readonly client: GoogleGenerativeAI | null;

  constructor(apiKey?: string, modelId = env.GEMINI_EMBEDDING_MODEL) {
    this.modelId = modelId;
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error("GEMINI_API_KEY is not configured for embeddings");
    }

    const model = this.client.getGenerativeModel({ model: this.modelId });
    const result = await model.embedContent(text);
    const values = result.embedding?.values;

    if (!values?.length) {
      throw new Error("Gemini embedding returned empty vector");
    }

    return values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (const text of texts) {
      vectors.push(await this.embed(text));
    }
    return vectors;
  }
}

export const geminiEmbeddingProvider = new GeminiEmbeddingProvider(
  env.GEMINI_API_KEY,
  env.GEMINI_EMBEDDING_MODEL,
);
