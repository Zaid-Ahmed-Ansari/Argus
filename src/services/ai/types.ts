import type { AiProviderName } from "@/types/analysis";

export type CompletionOptions = {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export type CompletionResult = {
  text: string;
  tokenCount?: number;
  modelVersion?: string;
};

export type ProviderConfig = {
  apiKey?: string;
  model?: string;
};

export { type AiProviderName };
