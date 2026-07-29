/**
 * LLM Provider Schema Types
 *
 * Provider-agnostic types for LLM completion requests and responses.
 */

import type { ToolCall, JSONSchema } from "./tool";
import type { TokenUsage } from "./session";

// ── Provider & Model Identity ────────────────────────────────────────

export type ProviderId = "anthropic" | "openai" | "google" | "openrouter";

/**
 * Model ID string — e.g. "claude-sonnet-4-20250514", "gpt-4o", "gemini-2.5-flash".
 * The ModelRouter resolves these to a specific provider.
 */
export type ModelId = string;

// ── Provider Configuration ───────────────────────────────────────────

export interface ProviderConfig {
  readonly apiKey: string;
  readonly baseUrl?: string;
  readonly defaultModel?: ModelId;
  readonly maxRetries?: number;
  readonly timeoutMs?: number;
}

export interface RuntimeProviderConfig {
  readonly providers: Partial<Record<ProviderId, ProviderConfig>>;
  readonly defaultProvider: ProviderId;
  readonly defaultModel: ModelId;
  readonly fallbackModels?: ModelId[];
}

// ── Completion Request ───────────────────────────────────────────────

export interface ProviderMessage {
  readonly role: "system" | "user" | "assistant" | "tool";
  readonly content: string;
  readonly toolCallId?: string;
  readonly toolCalls?: ToolCall[];
}

export interface ToolFunctionDef {
  readonly name: string;
  readonly description: string;
  readonly parameters: JSONSchema;
}

export interface CompletionRequest {
  readonly model: ModelId;
  readonly messages: ProviderMessage[];
  readonly tools?: ToolFunctionDef[];
  readonly stream?: boolean;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly stopSequences?: string[];
}

// ── Completion Response ──────────────────────────────────────────────

export type FinishReason = "stop" | "tool_calls" | "length" | "content_filter" | "error";

export interface CompletionResponse {
  readonly id: string;
  readonly content: string;
  readonly toolCalls?: ToolCall[];
  readonly usage: TokenUsage;
  readonly finishReason: FinishReason;
  readonly model: ModelId;
  readonly provider: ProviderId;
}

// ── Streaming ────────────────────────────────────────────────────────

export type StreamChunk =
  | { readonly type: "text_delta"; readonly content: string }
  | { readonly type: "tool_call_start"; readonly toolCall: ToolCall }
  | { readonly type: "tool_call_delta"; readonly toolCallId: string; readonly content: string }
  | { readonly type: "done"; readonly usage: TokenUsage; readonly finishReason: FinishReason };

// ── Model Metadata ───────────────────────────────────────────────────

export interface ModelInfo {
  readonly id: ModelId;
  readonly provider: ProviderId;
  readonly name: string;
  readonly contextWindow: number;
  readonly maxOutputTokens: number;
  readonly inputPricePer1M: number;
  readonly outputPricePer1M: number;
  readonly supportsFunctions: boolean;
  readonly supportsStreaming: boolean;
}
