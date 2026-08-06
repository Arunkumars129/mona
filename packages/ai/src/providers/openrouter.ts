/**
 * OpenRouterProvider — OpenRouter implementation of LLMProvider.
 *
 * Uses @openrouter/sdk. Supports:
 * - Single-shot generation
 * - Streaming generation
 * - Function calling (tool use)
 * - Structured JSON output
 *
 * OpenRouter exposes an OpenAI-compatible chat API with access to 100+ models.
 */

import { OpenRouter } from '@openrouter/sdk';
import type {
  GenerateOptions,
  GenerateResult,
  LLMProvider,
  LLMToolDef,
  StreamChunk,
  ToolCall,
} from '../provider';

export interface OpenRouterProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxRetries?: number;
  timeoutMs?: number;
  httpReferer?: string;
  appTitle?: string;
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
};

export class OpenRouterProvider implements LLMProvider {
  readonly id = 'openrouter';
  readonly defaultModel: string;
  private client: OpenRouter;
  private maxRetries: number;

  constructor(config: OpenRouterProviderConfig) {
    this.client = new OpenRouter({
      apiKey: config.apiKey,
      timeoutMs: config.timeoutMs,
      ...(config.baseUrl ? { serverURL: config.baseUrl } : {}),
    });
    this.defaultModel = config.model ?? 'openrouter/auto';
    this.maxRetries = config.maxRetries ?? 2;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const model = options.model ?? this.defaultModel;
    const messages = this.buildMessages(options);

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.send({
          chatRequest: {
            model,
            messages: messages as never,
            temperature: options.temperature ?? undefined,
            maxTokens: options.maxTokens ?? undefined,
            tools: options.tools ? this.buildTools(options.tools) : undefined,
            toolChoice: options.toolChoice
              ? (options.toolChoice as 'auto' | 'required' | 'none')
              : undefined,
            ...(options.responseFormat === 'json'
              ? { responseFormat: { type: 'json_object' } }
              : {}),
          },
        });

        return this.parseResult(response);
      } catch (err) {
        lastError = err;
        if (attempt < this.maxRetries) {
          await sleep(500 * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options.model ?? this.defaultModel;
    const messages = this.buildMessages(options);

    const response = await this.client.chat.send({
      chatRequest: {
        model,
        messages: messages as never,
        temperature: options.temperature ?? undefined,
        maxTokens: options.maxTokens ?? undefined,
        tools: options.tools ? this.buildTools(options.tools) : undefined,
        toolChoice: options.toolChoice
          ? (options.toolChoice as 'auto' | 'required' | 'none')
          : undefined,
        stream: true,
      },
    });

    if (!isStream(response)) {
      const result = this.parseResult(response);
      if (result.text) yield { type: 'text', text: result.text };
      for (const tc of result.toolCalls) {
        yield { type: 'tool_call_start', toolCall: tc };
      }
      yield { type: 'done' };
      return;
    }

    // Accumulate streaming tool calls by index
    const toolAccum: Array<{ id?: string; name: string; args: string }> = [];
    for await (const chunk of response) {
      if (chunk.error) {
        yield { type: 'error', error: chunk.error.message };
        continue;
      }
      const choice = chunk.choices?.[0];
      if (!choice?.delta) continue;
      const delta = choice.delta;

      if (delta.content) {
        yield { type: 'text', text: delta.content };
      }

      if (delta.toolCalls) {
        for (const tc of delta.toolCalls) {
          const idx = tc.index ?? 0;
          const acc = (toolAccum[idx] ??= { name: '', args: '' });
          if (tc.id) acc.id = tc.id;
          if (tc.function?.name) acc.name += tc.function.name;
          if (tc.function?.arguments) acc.args += tc.function.arguments;
        }
      }
    }

    for (const acc of toolAccum) {
      if (!acc.name) continue;
      yield {
        type: 'tool_call_start',
        toolCall: {
          id: acc.id ?? crypto.randomUUID(),
          name: acc.name,
          args: parseArgs(acc.args),
        },
      };
    }

    yield { type: 'done' };
  }

  async generateJSON<T = unknown>(options: GenerateOptions): Promise<T> {
    const result = await this.generate({
      ...options,
      responseFormat: 'json',
      systemPrompt: (options.systemPrompt ?? '') +
        '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no extra text.',
    });

    // Try to parse the response text as JSON
    let text = result.text.trim();

    // Strip markdown code fences if present
    if (text.startsWith('```json')) text = text.slice(7);
    else if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    text = text.trim();

    try {
      return JSON.parse(text) as T;
    } catch {
      // If the LLM returned text that's not valid JSON, try to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      throw new Error(`Failed to parse LLM response as JSON: ${text.slice(0, 200)}`);
    }
  }

  /* ── Private Helpers ──────────────────────────────────────── */

  private buildMessages(options: GenerateOptions): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    for (const msg of options.messages) {
      if (msg.role === 'system') {
        messages.push({ role: 'system', content: msg.content || '(empty)' });
        continue;
      }

      if (msg.role === 'tool' && msg.toolResults) {
        for (const tr of msg.toolResults) {
          messages.push({
            role: 'tool',
            tool_call_id: tr.callId,
            content: JSON.stringify({
              name: tr.name,
              result: tr.result,
              isError: tr.isError ?? false,
            }),
          });
        }
        continue;
      }

      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: msg.content ?? '',
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.args ?? {}),
            },
          })),
        });
        continue;
      }

      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      messages.push({ role, content: msg.content || '(empty)' });
    }

    return messages as never;
  }

  private buildTools(tools: LLMToolDef[]): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }> {
    return tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            Object.entries(t.parameters).map(([key, param]) => [
              key,
              {
                type: param.type,
                description: param.description,
                ...(param.enum ? { enum: param.enum } : {}),
              },
            ])
          ),
          required: Object.entries(t.parameters)
            .filter(([, p]) => p.required)
            .map(([k]) => k),
        },
      },
    }));
  }

  private parseResult(response: unknown): GenerateResult {
    // OpenRouter SDK returns the parsed ChatResult for non-streaming calls
    const result = response as {
      choices?: Array<{
        message?: {
          content?: string | Array<unknown> | null;
          tool_calls?: Array<{
            id?: string;
            function?: { name?: string; arguments?: string };
          }>;
        };
        finish_reason?: string | null;
      }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    const choice = result.choices?.[0];
    const message = choice?.message;

    let text = '';
    if (typeof message?.content === 'string') {
      text = message.content;
    }

    const toolCalls: ToolCall[] = [];
    for (const tc of message?.tool_calls ?? []) {
      if (!tc.function?.name) continue;
      toolCalls.push({
        id: tc.id ?? crypto.randomUUID(),
        name: tc.function.name,
        args: parseArgs(tc.function.arguments ?? ''),
      });
    }

    const finish = choice?.finish_reason;
    const usage = result.usage;

    return {
      text,
      toolCalls,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens ?? 0,
            completionTokens: usage.completion_tokens ?? 0,
            totalTokens: usage.total_tokens ?? 0,
          }
        : undefined,
      finishReason:
        toolCalls.length > 0
          ? 'tool_calls'
          : finish === 'length'
            ? 'max_tokens'
            : finish === 'error'
              ? 'error'
              : 'stop',
    };
  }
}

function parseArgs(args: string): Record<string, unknown> {
  if (!args) return {};
  try {
    const parsed = JSON.parse(args);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function isStream(response: unknown): response is { [Symbol.asyncIterator]: () => AsyncIterator<unknown> } {
  return typeof response === 'object' && response !== null && Symbol.asyncIterator in response;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
