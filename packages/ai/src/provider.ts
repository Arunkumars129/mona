/**
 * @repo/ai — Provider-agnostic LLM abstraction
 *
 * Every agent, planner, and tool-calling loop uses this interface.
 * Agents never know which LLM they are using — they only call generate().
 *
 * Implementations:
 *   GeminiProvider   ✅ (implemented)
 *   ClaudeProvider   (later)
 *   OpenAIProvider   (later)
 *   LocalProvider    (later)
 */

/* ── Message Types ─────────────────────────────────────────── */

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  /** Google Gemini thought signature — must be echoed back with functionCall parts */
  thoughtSignature?: string;
}

export interface ToolResult {
  callId: string;
  name: string;
  result: unknown;
  isError?: boolean;
}

/* ── Tool Definition (provider-agnostic) ──────────────────── */

export interface LLMToolParam {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
  items?: LLMToolParam;
  properties?: Record<string, LLMToolParam>;
}

export interface LLMToolDef {
  name: string;
  description: string;
  parameters: Record<string, LLMToolParam>;
}

/* ── Generate Options & Results ───────────────────────────── */

export interface GenerateOptions {
  model?: string;
  systemPrompt?: string;
  messages: LLMMessage[];
  tools?: LLMToolDef[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  /** If true, force tool use (no free-text fallback) */
  toolChoice?: 'auto' | 'required' | 'none';
}

export interface GenerateResult {
  text: string;
  toolCalls: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'tool_calls' | 'max_tokens' | 'error';
}

/* ── Streaming ────────────────────────────────────────────── */

export interface StreamChunk {
  type: 'text' | 'tool_call_start' | 'tool_call_delta' | 'tool_call_end' | 'done' | 'error';
  text?: string;
  toolCall?: ToolCall;
  error?: string;
}

/* ── Provider Interface ───────────────────────────────────── */

export interface LLMProvider {
  readonly id: string;
  readonly defaultModel: string;

  /** Single-shot generation */
  generate(options: GenerateOptions): Promise<GenerateResult>;

  /** Streaming generation */
  stream(options: GenerateOptions): AsyncGenerator<StreamChunk>;

  /** Structured JSON generation (convenience wrapper) */
  generateJSON<T = unknown>(options: GenerateOptions): Promise<T>;
}

/* ── Provider Configuration ───────────────────────────────── */

export type ProviderType = 'google' | 'anthropic' | 'openai' | 'openrouter' | 'local';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxRetries?: number;
  timeoutMs?: number;
}
