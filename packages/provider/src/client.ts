/**
 * LLM Client Interface
 *
 * Provider-agnostic interface for making LLM completion requests.
 * Inspired by OpenCode's provider layer — translates between a unified
 * request format and each provider's wire protocol.
 */

import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  ProviderId,
  ProviderConfig,
  ModelId,
  ModelInfo,
  ToolFunctionDef,
  ProviderMessage,
} from "@mona/schema";

// ── LLM Client Interface ────────────────────────────────────────────

export interface LLMClient {
  readonly provider: ProviderId;

  /** Non-streaming completion. */
  complete(request: CompletionRequest): Promise<CompletionResponse>;

  /** Streaming completion — yields chunks as they arrive. */
  stream(request: CompletionRequest): AsyncIterable<StreamChunk>;
}

// ── Provider Factory ─────────────────────────────────────────────────

export type { CompletionRequest, CompletionResponse, StreamChunk, ProviderConfig, ModelId, ModelInfo, ToolFunctionDef, ProviderMessage };

/**
 * Creates an LLMClient for the specified provider.
 * Each provider translates the unified request format into the provider's
 * specific wire protocol (OpenAI Chat Completions, Anthropic Messages, etc).
 */
export function createLLMClient(
  provider: ProviderId,
  config: ProviderConfig
): LLMClient {
  switch (provider) {
    case "anthropic":
      return new AnthropicClient(config);
    case "openai":
      return new OpenAIClient(config);
    case "google":
      return new GoogleClient(config);
    case "openrouter":
      return new OpenRouterClient(config);
    default:
      throw new Error(`Unknown provider: ${provider as string}`);
  }
}

// ── Anthropic (Claude) ───────────────────────────────────────────────

class AnthropicClient implements LLMClient {
  readonly provider: ProviderId = "anthropic";
  private readonly config: ProviderConfig;
  private readonly baseUrl: string;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl ?? "https://api.anthropic.com";
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const body = this.translateRequest(request);
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${error}`);
    }

    const data = await response.json() as Record<string, unknown>;
    return this.translateResponse(data, request.model);
  }

  async *stream(request: CompletionRequest): AsyncIterable<StreamChunk> {
    const body = this.translateRequest({ ...request, stream: true });
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${error}`);
    }

    yield* this.parseSSE(response, request.model);
  }

  private translateRequest(request: CompletionRequest): Record<string, unknown> {
    const systemMessages = request.messages.filter((m) => m.role === "system");
    const nonSystemMessages = request.messages.filter((m) => m.role !== "system");

    const messages = nonSystemMessages.map((m) => {
      if (m.role === "tool") {
        return {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: m.toolCallId,
              content: m.content,
            },
          ],
        };
      }
      if (m.role === "assistant" && m.toolCalls?.length) {
        return {
          role: "assistant",
          content: [
            ...(m.content ? [{ type: "text", text: m.content }] : []),
            ...m.toolCalls.map((tc) => ({
              type: "tool_use",
              id: tc.id,
              name: tc.name,
              input: tc.arguments,
            })),
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const result: Record<string, unknown> = {
      model: request.model,
      messages,
      max_tokens: request.maxTokens ?? 4096,
      stream: request.stream ?? false,
    };

    if (systemMessages.length > 0) {
      result["system"] = systemMessages.map((m) => m.content).join("\n\n");
    }

    if (request.tools?.length) {
      result["tools"] = request.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    if (request.temperature !== undefined) {
      result["temperature"] = request.temperature;
    }

    return result;
  }

  private translateResponse(data: Record<string, unknown>, model: ModelId): CompletionResponse {
    const content = data["content"] as Array<Record<string, unknown>>;
    const usage = data["usage"] as Record<string, number>;

    let textContent = "";
    const toolCalls: CompletionResponse["toolCalls"] = [];

    for (const block of content) {
      if (block["type"] === "text") {
        textContent += block["text"] as string;
      } else if (block["type"] === "tool_use") {
        toolCalls.push({
          id: block["id"] as string,
          name: block["name"] as string,
          arguments: block["input"] as Record<string, unknown>,
        });
      }
    }

    const stopReason = data["stop_reason"] as string;

    return {
      id: data["id"] as string,
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: usage["input_tokens"] ?? 0,
        completionTokens: usage["output_tokens"] ?? 0,
        totalTokens: (usage["input_tokens"] ?? 0) + (usage["output_tokens"] ?? 0),
      },
      finishReason: stopReason === "tool_use" ? "tool_calls" : stopReason === "end_turn" ? "stop" : "stop",
      model,
      provider: "anthropic",
    };
  }

  private async *parseSSE(response: Response, model: ModelId): AsyncIterable<StreamChunk> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr) as Record<string, unknown>;
            const eventType = event["type"] as string;

            if (eventType === "content_block_delta") {
              const delta = event["delta"] as Record<string, unknown>;
              if (delta["type"] === "text_delta") {
                yield { type: "text_delta", content: delta["text"] as string };
              } else if (delta["type"] === "input_json_delta") {
                const index = event["index"] as number;
                yield { type: "tool_call_delta", toolCallId: String(index), content: delta["partial_json"] as string };
              }
            } else if (eventType === "content_block_start") {
              const contentBlock = event["content_block"] as Record<string, unknown>;
              if (contentBlock["type"] === "tool_use") {
                yield {
                  type: "tool_call_start",
                  toolCall: {
                    id: contentBlock["id"] as string,
                    name: contentBlock["name"] as string,
                    arguments: {},
                  },
                };
              }
            } else if (eventType === "message_delta") {
              const msgUsage = event["usage"] as Record<string, number> | undefined;
              if (msgUsage) {
                outputTokens = msgUsage["output_tokens"] ?? outputTokens;
              }
            } else if (eventType === "message_start") {
              const message = event["message"] as Record<string, unknown>;
              const msgUsage = message["usage"] as Record<string, number> | undefined;
              if (msgUsage) {
                inputTokens = msgUsage["input_tokens"] ?? 0;
              }
            }
          } catch {
            // Skip unparseable SSE lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield {
      type: "done",
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      finishReason: "stop",
    };
  }
}

// ── OpenAI (GPT) ─────────────────────────────────────────────────────

class OpenAIClient implements LLMClient {
  readonly provider: ProviderId = "openai";
  private readonly config: ProviderConfig;
  private readonly baseUrl: string;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl ?? "https://api.openai.com";
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const body = this.translateRequest(request);
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${error}`);
    }

    const data = await response.json() as Record<string, unknown>;
    return this.translateResponse(data, request.model);
  }

  async *stream(request: CompletionRequest): AsyncIterable<StreamChunk> {
    const body = this.translateRequest({ ...request, stream: true });
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${error}`);
    }

    yield* this.parseSSE(response, request.model);
  }

  private translateRequest(request: CompletionRequest): Record<string, unknown> {
    const messages = request.messages.map((m) => {
      if (m.role === "tool") {
        return {
          role: "tool",
          content: m.content,
          tool_call_id: m.toolCallId,
        };
      }
      if (m.role === "assistant" && m.toolCalls?.length) {
        return {
          role: "assistant",
          content: m.content || null,
          tool_calls: m.toolCalls.map((tc) => ({
            id: tc.id,
            type: "function",
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        };
      }
      return { role: m.role, content: m.content };
    });

    const result: Record<string, unknown> = {
      model: request.model,
      messages,
      stream: request.stream ?? false,
    };

    if (request.maxTokens) result["max_tokens"] = request.maxTokens;
    if (request.temperature !== undefined) result["temperature"] = request.temperature;

    if (request.tools?.length) {
      result["tools"] = request.tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    return result;
  }

  private translateResponse(data: Record<string, unknown>, model: ModelId): CompletionResponse {
    const choices = data["choices"] as Array<Record<string, unknown>>;
    const choice = choices[0]!;
    const message = choice["message"] as Record<string, unknown>;
    const usage = data["usage"] as Record<string, number>;

    const toolCalls = (message["tool_calls"] as Array<Record<string, unknown>> | undefined)?.map((tc) => {
      const fn = tc["function"] as Record<string, unknown>;
      return {
        id: tc["id"] as string,
        name: fn["name"] as string,
        arguments: JSON.parse(fn["arguments"] as string) as Record<string, unknown>,
      };
    });

    const finishReason = choice["finish_reason"] as string;

    return {
      id: data["id"] as string,
      content: (message["content"] as string) ?? "",
      toolCalls: toolCalls?.length ? toolCalls : undefined,
      usage: {
        promptTokens: usage["prompt_tokens"] ?? 0,
        completionTokens: usage["completion_tokens"] ?? 0,
        totalTokens: usage["total_tokens"] ?? 0,
      },
      finishReason: finishReason === "tool_calls" ? "tool_calls" : finishReason === "stop" ? "stop" : "stop",
      model,
      provider: "openai",
    };
  }

  private async *parseSSE(response: Response, model: ModelId): AsyncIterable<StreamChunk> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          if (!jsonStr) continue;

          try {
            const chunk = JSON.parse(jsonStr) as Record<string, unknown>;
            const choices = chunk["choices"] as Array<Record<string, unknown>>;
            if (!choices?.length) {
              const usage = chunk["usage"] as Record<string, number> | undefined;
              if (usage) {
                promptTokens = usage["prompt_tokens"] ?? 0;
                completionTokens = usage["completion_tokens"] ?? 0;
              }
              continue;
            }

            const delta = choices[0]!["delta"] as Record<string, unknown>;
            if (!delta) continue;

            const content = delta["content"] as string | undefined;
            if (content) {
              yield { type: "text_delta", content };
            }

            const toolCallsChunk = delta["tool_calls"] as Array<Record<string, unknown>> | undefined;
            if (toolCallsChunk) {
              for (const tc of toolCallsChunk) {
                const fn = tc["function"] as Record<string, unknown> | undefined;
                if (tc["id"]) {
                  yield {
                    type: "tool_call_start",
                    toolCall: {
                      id: tc["id"] as string,
                      name: fn?.["name"] as string ?? "",
                      arguments: {},
                    },
                  };
                }
                if (fn?.["arguments"]) {
                  yield {
                    type: "tool_call_delta",
                    toolCallId: (tc["id"] as string) ?? String(tc["index"]),
                    content: fn["arguments"] as string,
                  };
                }
              }
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield {
      type: "done",
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      finishReason: "stop",
    };
  }
}

// ── Google (Gemini) ──────────────────────────────────────────────────

class GoogleClient implements LLMClient {
  readonly provider: ProviderId = "google";
  private readonly config: ProviderConfig;
  private readonly baseUrl: string;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl ?? "https://generativelanguage.googleapis.com";
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const body = this.translateRequest(request);
    const url = `${this.baseUrl}/v1beta/models/${request.model}:generateContent?key=${this.config.apiKey}`;

    const response = await this.fetchWithRetry(url, body);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error ${response.status}: ${error}`);
    }

    const data = await response.json() as Record<string, unknown>;
    return this.translateResponse(data, request.model);
  }

  async *stream(request: CompletionRequest): AsyncIterable<StreamChunk> {
    const body = this.translateRequest(request);
    const url = `${this.baseUrl}/v1beta/models/${request.model}:streamGenerateContent?key=${this.config.apiKey}&alt=sse`;

    const response = await this.fetchWithRetry(url, body);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error ${response.status}: ${error}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let totalTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const chunk = JSON.parse(jsonStr) as Record<string, unknown>;
            const candidates = chunk["candidates"] as Array<Record<string, unknown>> | undefined;
            if (candidates?.length) {
              const content = candidates[0]!["content"] as Record<string, unknown>;
              const parts = content["parts"] as Array<Record<string, unknown>>;
              for (const part of parts) {
                if (part["text"]) {
                  yield { type: "text_delta", content: part["text"] as string };
                }
                if (part["functionCall"]) {
                  const fc = part["functionCall"] as Record<string, unknown>;
                  yield {
                    type: "tool_call_start",
                    toolCall: {
                      id: `call_${Date.now()}`,
                      name: fc["name"] as string,
                      arguments: fc["args"] as Record<string, unknown>,
                    },
                  };
                }
              }
            }
            const usageMeta = chunk["usageMetadata"] as Record<string, number> | undefined;
            if (usageMeta) {
              totalTokens = usageMeta["totalTokenCount"] ?? 0;
            }
          } catch {
            // Skip unparseable
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield {
      type: "done",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens },
      finishReason: "stop",
    };
  }

  private async fetchWithRetry(url: string, body: Record<string, unknown>, retries = 2): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return response;
      } catch (err) {
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }
    throw new Error("fetchWithRetry exhausted");
  }

  private translateRequest(request: CompletionRequest): Record<string, unknown> {
    const systemInstruction = request.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");

    const contents = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: m.role === "tool"
          ? [{ functionResponse: { name: "tool", response: { content: m.content } } }]
          : [{ text: m.content }],
      }));

    const result: Record<string, unknown> = { contents };

    if (systemInstruction) {
      result["systemInstruction"] = { parts: [{ text: systemInstruction }] };
    }

    if (request.tools?.length) {
      result["tools"] = [
        {
          functionDeclarations: request.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];
    }

    if (request.maxTokens || request.temperature !== undefined) {
      const genConfig: Record<string, unknown> = {};
      if (request.maxTokens) genConfig["maxOutputTokens"] = request.maxTokens;
      if (request.temperature !== undefined) genConfig["temperature"] = request.temperature;
      result["generationConfig"] = genConfig;
    }

    return result;
  }

  private translateResponse(data: Record<string, unknown>, model: ModelId): CompletionResponse {
    const candidates = data["candidates"] as Array<Record<string, unknown>>;
    const content = candidates[0]!["content"] as Record<string, unknown>;
    const parts = content["parts"] as Array<Record<string, unknown>>;
    const usageMeta = data["usageMetadata"] as Record<string, number> | undefined;

    let textContent = "";
    const toolCalls: CompletionResponse["toolCalls"] = [];

    for (const part of parts) {
      if (part["text"]) textContent += part["text"] as string;
      if (part["functionCall"]) {
        const fc = part["functionCall"] as Record<string, unknown>;
        toolCalls.push({
          id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: fc["name"] as string,
          arguments: fc["args"] as Record<string, unknown>,
        });
      }
    }

    return {
      id: `gemini_${Date.now()}`,
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: usageMeta?.["promptTokenCount"] ?? 0,
        completionTokens: usageMeta?.["candidatesTokenCount"] ?? 0,
        totalTokens: usageMeta?.["totalTokenCount"] ?? 0,
      },
      finishReason: toolCalls.length > 0 ? "tool_calls" : "stop",
      model,
      provider: "google",
    };
  }
}

// ── OpenRouter ───────────────────────────────────────────────────────

class OpenRouterClient implements LLMClient {
  readonly provider: ProviderId = "openrouter";
  private readonly delegate: OpenAIClient;

  constructor(config: ProviderConfig) {
    this.delegate = new OpenAIClient({
      ...config,
      baseUrl: config.baseUrl ?? "https://openrouter.ai/api",
    });
    // Override provider on the delegate
    (this.delegate as { provider: ProviderId }).provider = "openrouter";
  }

  complete(request: CompletionRequest): Promise<CompletionResponse> {
    return this.delegate.complete(request);
  }

  stream(request: CompletionRequest): AsyncIterable<StreamChunk> {
    return this.delegate.stream(request);
  }
}
