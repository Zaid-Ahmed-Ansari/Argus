import { analyzeResponseSchema } from "@/lib/validators/analyze";
import { getProvider } from "@/services/ai/provider-factory";
import { GeminiProvider } from "@/services/ai/providers/gemini.provider";
import { OpenAiProvider } from "@/services/ai/providers/openai.provider";
import type { AiAnalysisService } from "@/services/ai/ai-service.interface";
import {
  buildAnalyzeLogsPrompt,
  buildRecommendationsPrompt,
  buildSeverityPrompt,
  buildTimelinePrompt,
  SOC_ANALYST_SYSTEM_PROMPT,
} from "@/services/ai/prompts/soc-analysis";
import { getKnowledgeRetriever } from "@/services/rag/retriever-factory";
import { formatLogsForAnalysis } from "@/utils/structure-auth-logs";
import type { AnalyzeResponse, TimelineEvent } from "@/types/api";
import type {
  AnalysisContext,
  AnalyzeLogsResult,
  SeverityLevel,
} from "@/types/analysis";
import { LlmJsonParseError, parseLlmJson } from "@/utils/parse-llm-json";

const PROMPT_VERSION = "soc-v3-hybrid-rag";
const JSON_RETRY_SUFFIX =
  "\n\nReturn strictly valid JSON. No trailing commas. Keep timeline to at most 15 key events.";

function buildPlaceholderResponse(providerName: string): AnalyzeResponse {
  const keyName =
    providerName === "OPENAI" ? "OPENAI_API_KEY" : "GEMINI_API_KEY";

  return {
    attackType: "Unknown",
    severity: "MEDIUM",
    summary: `Placeholder analysis — set ${keyName} in .env to enable AI-powered incident analysis.`,
    timeline: [
      {
        timestamp: new Date().toISOString(),
        event: `Analysis stub generated (no ${providerName} API key)`,
        source: "argus",
      },
    ],
    recommendations: [
      `Add ${keyName} to your .env file`,
      "Restart the dev server after updating environment variables",
      "Review uploaded logs manually until AI is enabled",
    ],
  };
}

function normalizeSeverity(value: string): SeverityLevel {
  const upper = value.toUpperCase();
  if (
    upper === "LOW" ||
    upper === "MEDIUM" ||
    upper === "HIGH" ||
    upper === "CRITICAL"
  ) {
    return upper;
  }
  return "MEDIUM";
}

function isProviderConfigured(provider: ReturnType<typeof getProvider>): boolean {
  if (provider instanceof GeminiProvider || provider instanceof OpenAiProvider) {
    return provider.isConfigured();
  }
  return false;
}

function buildRagQuery(logs: string): string {
  const keywords = ["failed", "password", "brute", "admin", "attack", "login"];
  const lower = logs.toLowerCase();
  const matched = keywords.filter((k) => lower.includes(k));
  if (matched.length > 0) return matched.join(" ");
  return logs.slice(0, 200);
}

async function getRagContext(logs: string, usedRag?: boolean): Promise<string> {
  if (!usedRag) return "";
  const retriever = getKnowledgeRetriever();
  const chunks = await retriever.retrieve(buildRagQuery(logs));
  if (chunks.length === 0) return "";
  return chunks
    .map(
      (c) =>
        `[${c.metadata?.source ?? "KB"}] ${c.metadata?.title ?? ""}\n${c.content}`,
    )
    .join("\n\n");
}

export class AnalysisOrchestrator implements AiAnalysisService {
  private async completeAnalyzeJson(
    provider: ReturnType<typeof getProvider>,
    prompt: string,
  ): Promise<{
    data: AnalyzeResponse;
    modelVersion?: string;
    tokenCount?: number;
  }> {
    const attempts = [prompt, prompt + JSON_RETRY_SUFFIX];

    let lastError: unknown;

    for (const attemptPrompt of attempts) {
      try {
        const completion = await provider.complete(attemptPrompt, {
          systemPrompt: SOC_ANALYST_SYSTEM_PROMPT,
          temperature: 0.15,
        });
        const data = parseLlmJson<AnalyzeResponse>(completion.text);
        return {
          data,
          modelVersion: completion.modelVersion,
          tokenCount: completion.tokenCount,
        };
      } catch (error) {
        lastError = error;
        if (!(error instanceof LlmJsonParseError)) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async analyzeLogsWithMeta(
    logs: string,
    context?: AnalysisContext,
  ): Promise<AnalyzeLogsResult> {
    const start = Date.now();
    const provider = getProvider(context?.provider);

    if (!isProviderConfigured(provider)) {
      return {
        response: buildPlaceholderResponse(provider.name),
        metadata: {
          provider: provider.name,
          promptVersion: PROMPT_VERSION,
          latencyMs: Date.now() - start,
          usedRag: context?.usedRag ?? false,
        },
      };
    }

    const formattedLogs = formatLogsForAnalysis(
      logs,
      context?.inputFormat ?? "RAW",
    );
    const ragContext = await getRagContext(formattedLogs, context?.usedRag);

    const parsed = await this.completeAnalyzeJson(
      provider,
      buildAnalyzeLogsPrompt(formattedLogs, ragContext),
    );
    const validated = analyzeResponseSchema.parse(parsed.data);

    return {
      response: {
        ...validated,
        severity: normalizeSeverity(validated.severity),
      },
      metadata: {
        provider: provider.name,
        modelVersion: parsed.modelVersion,
        promptVersion: PROMPT_VERSION,
        tokenCount: parsed.tokenCount,
        latencyMs: Date.now() - start,
        rawResponse: parsed.data,
        usedRag: context?.usedRag ?? false,
      },
    };
  }

  async analyzeLogs(
    logs: string,
    context?: AnalysisContext,
  ): Promise<AnalyzeResponse> {
    const { response } = await this.analyzeLogsWithMeta(logs, context);
    return response;
  }

  async generateTimeline(
    logs: string,
    context?: AnalysisContext,
  ): Promise<TimelineEvent[]> {
    const provider = getProvider(context?.provider);
    if (!isProviderConfigured(provider)) {
      return buildPlaceholderResponse(provider.name).timeline;
    }

    const completion = await provider.complete(buildTimelinePrompt(logs), {
      systemPrompt: SOC_ANALYST_SYSTEM_PROMPT,
    });

    const parsed = parseLlmJson<{ timeline: TimelineEvent[] }>(completion.text);
    return parsed.timeline ?? [];
  }

  async classifySeverity(
    summary: string,
    context?: AnalysisContext,
  ): Promise<SeverityLevel> {
    const provider = getProvider(context?.provider);
    if (!isProviderConfigured(provider)) {
      return "MEDIUM";
    }

    const completion = await provider.complete(buildSeverityPrompt(summary), {
      systemPrompt: SOC_ANALYST_SYSTEM_PROMPT,
    });

    const parsed = parseLlmJson<{ severity: string }>(completion.text);
    return normalizeSeverity(parsed.severity);
  }

  async generateRecommendations(
    analysis: Pick<AnalyzeResponse, "attackType" | "severity" | "summary">,
    context?: AnalysisContext,
  ): Promise<string[]> {
    const provider = getProvider(context?.provider);
    if (!isProviderConfigured(provider)) {
      return buildPlaceholderResponse(provider.name).recommendations;
    }

    const completion = await provider.complete(
      buildRecommendationsPrompt(
        analysis.attackType,
        analysis.severity,
        analysis.summary,
      ),
      { systemPrompt: SOC_ANALYST_SYSTEM_PROMPT },
    );

    const parsed = parseLlmJson<{ recommendations: string[] }>(
      completion.text,
    );
    return parsed.recommendations ?? [];
  }
}

export const analysisOrchestrator = new AnalysisOrchestrator();
