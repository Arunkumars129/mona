/**
 * Provider factory — creates the right LLMProvider from config.
 *
 * Usage:
 *   const provider = createProvider({ provider: 'google', apiKey: '...' });
 *   const result = await provider.generate({ messages: [...] });
 *
 * Reads MONA_DEFAULT_PROVIDER to auto-select.
 */

import type { LLMProvider, ProviderConfig, ProviderType } from '../provider';
import { FallbackProvider } from './fallback';
import { GeminiProvider } from './google';
import { OpenRouterProvider } from './openrouter';

export function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.provider) {
    case 'google':
      return new GeminiProvider({
        apiKey: config.apiKey,
        model: config.model,
        maxRetries: config.maxRetries,
        timeoutMs: config.timeoutMs,
      });

    case 'openrouter':
      return new OpenRouterProvider({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
        maxRetries: config.maxRetries,
        timeoutMs: config.timeoutMs,
      });

    case 'anthropic':
      throw new Error('Anthropic provider not yet implemented — add packages/ai/src/providers/anthropic.ts');

    case 'openai':
      throw new Error('OpenAI provider not yet implemented — add packages/ai/src/providers/openai.ts');

    case 'local':
      throw new Error('Local provider not yet implemented — add packages/ai/src/providers/local.ts');

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Create a provider from environment variables.
 *
 * Reads:
 *   MONA_DEFAULT_PROVIDER  (google | anthropic | openai | openrouter | local)
 *   MONA_DEFAULT_MODEL     (model name)
 *   MONA_FALLBACK_MODEL    (optional OpenRouter model for fallback)
 *   GOOGLE_AI_API_KEY / GEMINI_API_KEY
 *   ANTHROPIC_API_KEY
 *   OPENAI_API_KEY
 *   OPENROUTER_API_KEY     (also enables fallback when primary is not openrouter)
 */
export function createProviderFromEnv(): LLMProvider {
  const providerType = (process.env.MONA_DEFAULT_PROVIDER ?? 'google') as ProviderType;
  const model = normalizeModelName(process.env.MONA_DEFAULT_MODEL);

  const apiKeyMap: Record<ProviderType, string | undefined> = {
    google: process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    local: 'local',
  };

  const apiKey = apiKeyMap[providerType];
  if (!apiKey) {
    throw new Error(
      `No API key found for provider "${providerType}". ` +
      `Set the appropriate environment variable (e.g. GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY).`
    );
  }

  const primary = createProvider({
    provider: providerType,
    apiKey,
    model: model || undefined,
  });

  // Fallback chain: when the primary provider is NOT openrouter and an
  // OpenRouter key is configured, wrap the provider so failures (bad key,
  // model not found, rate limit) fall through to OpenRouter.
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (providerType !== 'openrouter' && openRouterKey) {
    const fallbackModel = process.env.MONA_FALLBACK_MODEL || translateToOpenRouter(model);
    return new FallbackProvider([
      primary,
      new OpenRouterProvider({
        apiKey: openRouterKey,
        model: fallbackModel,
      }),
    ]);
  }

  return primary;
}

/**
 * Normalize a model name from config/env: trim whitespace and collapse inner
 * spaces to hyphens. Handles values like "gemini-3.1-flash lite " →
 * "gemini-3.1-flash-lite".
 */
function normalizeModelName(model: string | undefined): string | undefined {
  if (!model) return undefined;
  const trimmed = model.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\s+/g, '-');
}

/**
 * Translate a Gemini-style model name to its OpenRouter slug so fallback
 * requests use the same model where available (e.g. "gemini-2.5-flash" →
 * "google/gemini-2.5-flash"). Returns undefined when no mapping is possible,
 * letting OpenRouter use its default model.
 */
function translateToOpenRouter(model: string | undefined): string | undefined {
  if (!model) return undefined;
  const base = model.replace(/^models\//, '');
  if (base.includes('/')) return base;
  if (base.startsWith('gemini')) return `google/${base}`;
  return base;
}

export { GeminiProvider } from './google';
export { OpenRouterProvider } from './openrouter';
export { FallbackProvider } from './fallback';
