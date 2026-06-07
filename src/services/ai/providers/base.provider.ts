import type { AiProviderName } from "@/types/analysis";
import type { CompletionOptions, CompletionResult } from "@/services/ai/types";

export interface LlmProvider {
  readonly name: AiProviderName;
  complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
}

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`Not implemented: ${feature}`);
    this.name = "NotImplementedError";
  }
}
