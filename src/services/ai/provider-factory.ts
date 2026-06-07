import { env } from "@/lib/env";
import type { LlmProvider } from "@/services/ai/providers/base.provider";
import { GeminiProvider } from "@/services/ai/providers/gemini.provider";
import { OpenAiProvider } from "@/services/ai/providers/openai.provider";
import type { AiProviderName } from "@/types/analysis";

export function getProvider(
  provider?: AiProviderName | "gemini" | "openai",
): LlmProvider {
  const resolved =
    provider ??
    (env.AI_DEFAULT_PROVIDER === "openai" ? "OPENAI" : "GEMINI");

  const normalized =
    typeof resolved === "string" && resolved.toLowerCase() === "openai"
      ? "OPENAI"
      : typeof resolved === "string" && resolved.toLowerCase() === "gemini"
        ? "GEMINI"
        : resolved;

  switch (normalized) {
    case "OPENAI":
      return new OpenAiProvider(env.OPENAI_API_KEY, env.OPENAI_MODEL);
    case "GEMINI":
    default:
      return new GeminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL);
  }
}
