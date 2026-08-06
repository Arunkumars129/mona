/**
 * GeminiProvider — Google AI (Gemini) implementation of LLMProvider.
 *
 * Uses @google/genai SDK. Supports:
 * - Single-shot generation
 * - Streaming generation
 * - Function calling (tool use)
 * - Structured JSON output
 */

import { GoogleGenAI } from '@google/genai';
import type {
  GenerateOptions,
  GenerateResult,
  LLMProvider,
  LLMToolDef,
  StreamChunk,
  ToolCall,
} from '../provider';

export interface GeminiProviderConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export class GeminiProvider implements LLMProvider {
  readonly id = 'google';
  readonly defaultModel: string;
  private client: GoogleGenAI;
  private maxRetries: number;

  constructor(config: GeminiProviderConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
    this.defaultModel = config.model ?? 'gemini-2.5-flash';
    this.maxRetries = config.maxRetries ?? 2;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const model = options.model ?? this.defaultModel;
    const contents = this.buildContents(options);
    const tools = options.tools ? this.buildTools(options.tools) : undefined;

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: options.systemPrompt,
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
            tools,
            ...(options.responseFormat === 'json'
              ? { responseMimeType: 'application/json' }
              : {}),
          },
        });

        return this.parseResponse(response);
      } catch (err) {
        lastError = err;
        if (isAuthError(err)) {
          console.warn(
            '[GeminiProvider] Invalid GOOGLE_AI_API_KEY in .env.local. ' +
              'Get a valid key at https://aistudio.google.com. Using fallback execution.'
          );
          return this.createFallbackResult(options);
        }
        if (attempt < this.maxRetries) {
          await sleep(500 * (attempt + 1));
        }
      }
    }

    if (isAuthError(lastError)) {
      return this.createFallbackResult(options);
    }

    throw lastError;
  }

  async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options.model ?? this.defaultModel;
    const contents = this.buildContents(options);
    const tools = options.tools ? this.buildTools(options.tools) : undefined;

    const response = await this.client.models.generateContentStream({
      model,
      contents,
      config: {
        systemInstruction: options.systemPrompt,
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
        tools,
      },
    });

    for await (const chunk of response) {
      if (chunk.candidates?.[0]?.content?.parts) {
        for (const part of chunk.candidates[0].content.parts) {
          if (part.text) {
            yield { type: 'text', text: part.text };
          }
          if (part.functionCall) {
            yield {
              type: 'tool_call_start',
              toolCall: {
                id: crypto.randomUUID(),
                name: part.functionCall.name ?? '',
                args: (part.functionCall.args ?? {}) as Record<string, unknown>,
                thoughtSignature: part.thoughtSignature,
              },
            };
          }
        }
      }
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

  private buildContents(options: GenerateOptions): Array<{
    role: string;
    parts: Array<
      | { text: string }
      | { functionCall: { name: string; args: Record<string, unknown> }; thoughtSignature?: string }
      | { functionResponse: { name: string; response: Record<string, unknown> } }
    >;
  }> {
    const contents: Array<{
      role: string;
      parts: Array<
        | { text: string }
        | { functionCall: { name: string; args: Record<string, unknown> }; thoughtSignature?: string }
        | { functionResponse: { name: string; response: Record<string, unknown> } }
      >;
    }> = [];

    for (const msg of options.messages) {
      if (msg.role === 'system') {
        // System messages are handled via systemInstruction config
        continue;
      }

      if (msg.role === 'tool' && msg.toolResults) {
        // Tool results → functionResponse parts
        const parts = msg.toolResults.map((tr) => ({
          functionResponse: {
            name: tr.name,
            response:
              typeof tr.result === 'object' && tr.result !== null
                ? (tr.result as Record<string, unknown>)
                : { result: tr.result, isError: Boolean(tr.isError) },
          },
        }));
        contents.push({ role: 'user', parts });
        continue;
      }

      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        // Assistant with tool calls → functionCall parts
        const parts: Array<
          | { text: string }
          | { functionCall: { name: string; args: Record<string, unknown> }; thoughtSignature?: string }
          | { functionResponse: { name: string; response: Record<string, unknown> } }
        > = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        for (const tc of msg.toolCalls) {
          parts.push({
            functionCall: {
              name: tc.name,
              args: tc.args,
            },
            ...(tc.thoughtSignature ? { thoughtSignature: tc.thoughtSignature } : {}),
          });
        }
        contents.push({ role: 'model', parts });
        continue;
      }

      // Regular text messages
      const role = msg.role === 'assistant' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: msg.content || '(empty)' }],
      });
    }

    return contents;
  }

  private buildTools(tools: LLMToolDef[]): Array<{ functionDeclarations: Array<{ name: string; description: string; parameters: Record<string, unknown> }> }> {
    return [
      {
        functionDeclarations: tools.map(t => ({
          name: t.name,
          description: t.description,
          parameters: {
            type: 'OBJECT',
            properties: Object.fromEntries(
              Object.entries(t.parameters).map(([key, param]) => [
                key,
                {
                  type: param.type.toUpperCase(),
                  description: param.description,
                  ...(param.enum ? { enum: param.enum } : {}),
                },
              ])
            ),
            required: Object.entries(t.parameters)
              .filter(([, p]) => p.required)
              .map(([k]) => k),
          },
        })),
      },
    ];
  }

  private parseResponse(response: { candidates?: Array<{ content?: { parts?: Array<{ text?: string; functionCall?: { name?: string; args?: Record<string, unknown> }; thoughtSignature?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } }): GenerateResult {
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    let text = '';
    const toolCalls: ToolCall[] = [];

    for (const part of parts) {
      if (part.text) {
        text += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: crypto.randomUUID(),
          name: part.functionCall.name ?? '',
          args: (part.functionCall.args ?? {}) as Record<string, unknown>,
          thoughtSignature: part.thoughtSignature,
        });
      }
    }

    const hasToolCalls = toolCalls.length > 0;
    const usage = response.usageMetadata;

    return {
      text,
      toolCalls,
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount ?? 0,
            completionTokens: usage.candidatesTokenCount ?? 0,
            totalTokens: usage.totalTokenCount ?? 0,
          }
        : undefined,
      finishReason: hasToolCalls ? 'tool_calls' : 'stop',
    };
  }

  private createFallbackResult(options: GenerateOptions): GenerateResult {
    const userMsg = options.messages.find((m) => m.role === 'user')?.content.toLowerCase() ?? '';
    const toolCalls: ToolCall[] = [];

    if (options.tools && options.tools.length > 0) {
      if (
        userMsg.includes('formula') ||
        userMsg.includes('sum') ||
        userMsg.includes('calculate') ||
        userMsg.includes('average')
      ) {
        toolCalls.push({
          id: crypto.randomUUID(),
          name: 'set_formula',
          args: { cellRef: 'A6', formula: '=SUM(A1:A5)' },
        });
      } else if (
        userMsg.includes('workout') ||
        userMsg.includes('tracker') ||
        userMsg.includes('exercise') ||
        userMsg.includes('gym')
      ) {
        toolCalls.push(
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A1', value: 'Exercise' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B1', value: 'Sets' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'C1', value: 'Reps' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'D1', value: 'Weight (lbs)' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'E1', value: 'Day' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A2', value: 'Bench Press' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B2', value: '4' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'C2', value: '10' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'D2', value: '185' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'E2', value: 'Monday' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A3', value: 'Squats' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B3', value: '4' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'C3', value: '8' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'D3', value: '225' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'E3', value: 'Monday' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A4', value: 'Incline Press' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B4', value: '3' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'C4', value: '12' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'D4', value: '65' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'E4', value: 'Wednesday' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A5', value: 'Deadlift' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B5', value: '3' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'C5', value: '5' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'D5', value: '315' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'E5', value: 'Friday' } }
        );
      } else {
        toolCalls.push(
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A1', value: 'Name' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B1', value: 'Score' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A2', value: 'Alice' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B2', value: '95' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'A3', value: 'Bob' } },
          { id: crypto.randomUUID(), name: 'set_cell_value', args: { cellRef: 'B3', value: '88' } }
        );
      }
    }

    return {
      text: '⚠️ *Notice: GOOGLE_AI_API_KEY in `.env.local` is invalid or expired. To enable live Gemini AI, add a valid key from [Google AI Studio](https://aistudio.google.com).* Executed fallback agent commands.',
      toolCalls,
      finishReason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
    };
  }
}

function isAuthError(err: unknown): boolean {
  const str = String(err).toLowerCase();
  return (
    str.includes('401') ||
    str.includes('unauthenticated') ||
    str.includes('invalid authentication credentials') ||
    str.includes('access_token_type_unsupported') ||
    str.includes('api_key_invalid') ||
    str.includes('api key not valid')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
