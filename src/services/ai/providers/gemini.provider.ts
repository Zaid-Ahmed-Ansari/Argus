import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LlmProvider } from "@/services/ai/providers/base.provider";
import { NotImplementedError } from "@/services/ai/providers/base.provider";
import type { CompletionOptions, CompletionResult } from "@/services/ai/types";

export class GeminiProvider implements LlmProvider {
  readonly name = "GEMINI" as const;
  readonly modelId: string;

  private readonly client: GoogleGenerativeAI | null;

  constructor(apiKey?: string, modelId = "gemini-2.0-flash") {
    this.modelId = modelId;
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(
    prompt: string,
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    if (!this.client) {
      throw new NotImplementedError(
        "GEMINI_API_KEY is not configured",
      );
    }

    const model = this.client.getGenerativeModel({
      model: this.modelId,
      systemInstruction: options?.systemPrompt,
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 8192,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const usage = result.response.usageMetadata;

    return {
      text,
      tokenCount:
        (usage?.promptTokenCount ?? 0) + (usage?.candidatesTokenCount ?? 0),
      modelVersion: this.modelId,
    };
  }
}
