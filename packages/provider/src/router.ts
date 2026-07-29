/**
 * Model Router
 *
 * Resolves ModelId → ProviderId, manages fallback chains,
 * and provides cost estimation for model selection.
 */

import type { ModelId, ProviderId, ModelInfo, TokenUsage } from "@mona/schema";

// ── Model Registry ───────────────────────────────────────────────────

const MODEL_REGISTRY: ModelInfo[] = [
  // Anthropic
  {
    id: "claude-sonnet-4-20250514",
    provider: "anthropic",
    name: "Claude Sonnet 4",
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputPricePer1M: 3.0,
    outputPricePer1M: 15.0,
    supportsFunctions: true,
    supportsStreaming: true,
  },
  {
    id: "claude-4-opus-20250514",
    provider: "anthropic",
    name: "Claude Opus 4",
    contextWindow: 200_000,
    maxOutputTokens: 32_000,
    inputPricePer1M: 15.0,
    outputPricePer1M: 75.0,
    supportsFunctions: true,
    supportsStreaming: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    provider: "anthropic",
    name: "Claude 3.5 Haiku",
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    inputPricePer1M: 0.8,
    outputPricePer1M: 4.0,
    supportsFunctions: true,
    supportsStreaming: true,
  },
  // OpenAI
  {
    id: "gpt-4o",
    provider: "openai",
    name: "GPT-4o",
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    inputPricePer1M: 2.5,
    outputPricePer1M: 10.0,
    supportsFunctions: true,
    supportsStreaming: true,
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    name: "GPT-4o Mini",
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.6,
    supportsFunctions: true,
    supportsStreaming: true,
  },
  // Google
  {
    id: "gemini-3.1-flash-lite",
    provider: "google",
    name: "gemini-3.1-flash-lite",
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    inputPricePer1M: 0.25,
    outputPricePer1M: 1.25,
    supportsFunctions: true,
    supportsStreaming: true,
  },
  {
    id: "gemini-1.5-flash",
    provider: "google",
    name: "Gemini 1.5 Flash",
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    inputPricePer1M: 0.075,
    outputPricePer1M: 0.30,
    supportsFunctions: true,
    supportsStreaming: true,
  },
  {
    id: "gemini-1.5-pro",
    provider: "google",
    name: "Gemini 1.5 Pro",
    contextWindow: 2_000_000,
    maxOutputTokens: 8_192,
    inputPricePer1M: 1.25,
    outputPricePer1M: 5.0,
    supportsFunctions: true,
    supportsStreaming: true,
  },
];

// ── Model Router ─────────────────────────────────────────────────────

export class ModelRouter {
  private readonly models: Map<ModelId, ModelInfo>;

  constructor() {
    this.models = new Map(MODEL_REGISTRY.map((m) => [m.id, m]));
  }

  /** Resolve a model ID to its provider and metadata. */
  resolve(modelId: ModelId): { provider: ProviderId; model: string; info: ModelInfo } {
    const info = this.models.get(modelId);
    if (!info) {
      // Default: try OpenRouter as a universal fallback
      return {
        provider: "openrouter",
        model: modelId,
        info: {
          id: modelId,
          provider: "openrouter",
          name: modelId,
          contextWindow: 128_000,
          maxOutputTokens: 16_384,
          inputPricePer1M: 1.0,
          outputPricePer1M: 5.0,
          supportsFunctions: true,
          supportsStreaming: true,
        },
      };
    }
    return { provider: info.provider, model: info.id, info };
  }

  /** Get fallback chain for a model (cheaper alternatives). */
  getFallbackChain(modelId: ModelId): ModelId[] {
    const info = this.models.get(modelId);
    if (!info) return [];

    // Return models from same provider, sorted by cost (cheapest first)
    return [...this.models.values()]
      .filter((m) => m.provider === info.provider && m.id !== modelId)
      .sort((a, b) => a.inputPricePer1M - b.inputPricePer1M)
      .map((m) => m.id);
  }

  /** Estimate cost in USD for a given model and token usage. */
  estimateCost(modelId: ModelId, usage: TokenUsage): number {
    const { info } = this.resolve(modelId);
    const inputCost = (usage.promptTokens / 1_000_000) * info.inputPricePer1M;
    const outputCost = (usage.completionTokens / 1_000_000) * info.outputPricePer1M;
    return inputCost + outputCost;
  }

  /** Get metadata for a specific model. */
  getModelInfo(modelId: ModelId): ModelInfo | undefined {
    return this.models.get(modelId);
  }

  /** List all available models. */
  listModels(): ModelInfo[] {
    return [...this.models.values()];
  }

  /** Select the best model for a task based on complexity and budget. */
  selectModel(options: {
    provider?: ProviderId;
    maxCostPerRequest?: number;
    minContextWindow?: number;
    requiresFunctions?: boolean;
  }): ModelId {
    let candidates = [...this.models.values()];

    if (options.provider) {
      candidates = candidates.filter((m) => m.provider === options.provider);
    }
    if (options.requiresFunctions) {
      candidates = candidates.filter((m) => m.supportsFunctions);
    }
    if (options.minContextWindow) {
      candidates = candidates.filter((m) => m.contextWindow >= options.minContextWindow!);
    }

    // Sort by cost (cheapest first) and pick the best
    candidates.sort((a, b) => a.inputPricePer1M - b.inputPricePer1M);

    if (options.maxCostPerRequest !== undefined) {
      // Estimate cost for ~2K tokens
      const affordable = candidates.filter((m) => {
        const estimated = (2000 / 1_000_000) * (m.inputPricePer1M + m.outputPricePer1M);
        return estimated <= options.maxCostPerRequest!;
      });
      if (affordable.length > 0) return affordable[0]!.id;
    }

    return candidates[0]?.id ?? "gpt-4o-mini";
  }
}
