/**
 * FallbackProvider — tries providers in priority order, falling through to the
 * next on failure.
 *
 * Useful for resilience: e.g. Gemini primary → OpenRouter fallback. When the
 * primary fails (bad key, model not found, rate limit), the request is retried
 * on the next provider in the chain.
 */

import type {
  GenerateOptions,
  GenerateResult,
  LLMProvider,
  StreamChunk,
} from '../provider';

export class FallbackProvider implements LLMProvider {
  readonly id: string;
  readonly defaultModel: string;
  private providers: LLMProvider[];

  constructor(providers: LLMProvider[]) {
    if (providers.length === 0) {
      throw new Error('FallbackProvider requires at least one provider');
    }
    this.providers = providers;
    this.id = providers.map((p) => p.id).join('→');
    this.defaultModel = providers[0]!.defaultModel;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    let lastError: unknown;
    for (const provider of this.providers) {
      try {
        return await provider.generate(options);
      } catch (err) {
        lastError = err;
        if (provider !== this.providers[this.providers.length - 1]!) {
          console.warn(
            `[FallbackProvider] ${provider.id} failed, falling back:`,
            err instanceof Error ? err.message : err
          );
        }
      }
    }
    throw lastError;
  }

  async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    let lastError: unknown;
    let started = false;

    for (const provider of this.providers) {
      try {
        for await (const chunk of provider.stream(options)) {
          started = true;
          yield chunk;
        }
        return;
      } catch (err) {
        if (started) {
          // Mid-stream failure — cannot safely restart on another provider.
          throw err;
        }
        lastError = err;
        if (provider !== this.providers[this.providers.length - 1]!) {
          console.warn(
            `[FallbackProvider] ${provider.id} failed, falling back:`,
            err instanceof Error ? err.message : err
          );
        }
      }
    }

    throw lastError;
  }

  async generateJSON<T = unknown>(options: GenerateOptions): Promise<T> {
    let lastError: unknown;
    for (const provider of this.providers) {
      try {
        return await provider.generateJSON(options);
      } catch (err) {
        lastError = err;
        if (provider !== this.providers[this.providers.length - 1]) {
          console.warn(
            `[FallbackProvider] ${provider.id} failed, falling back:`,
            err instanceof Error ? err.message : err
          );
        }
      }
    }
    throw lastError;
  }
}
