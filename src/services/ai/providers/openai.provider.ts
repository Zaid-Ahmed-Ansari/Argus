import { env } from "@/lib/env";
import type { LlmProvider } from "@/services/ai/providers/base.provider";
import { NotImplementedError } from "@/services/ai/providers/base.provider";
import type { CompletionOptions, CompletionResult } from "@/services/ai/types";

export class OpenAiProvider implements LlmProvider {
  readonly name = "OPENAI" as const;
  readonly modelId: string;
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string, modelId = env.OPENAI_MODEL) {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(
    prompt: string,
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    if (!this.apiKey) {
      throw new NotImplementedError("OPENAI_API_KEY is not configured");
    }

    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelId,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number };
      model?: string;
    };

    const text = data.choices?.[0]?.message?.content ?? "";

    return {
      text,
      tokenCount: data.usage?.total_tokens,
      modelVersion: data.model ?? this.modelId,
    };
  }
}
