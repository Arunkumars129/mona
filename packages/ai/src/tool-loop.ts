/**
 * Multi-round tool calling loop.
 *
 * LLM → tool call → execute tool → append result → LLM → tool call → ... → done
 *
 * This is the same pattern used by Claude Code, Cursor, OpenCode, and Kimi Code.
 * The loop continues until the LLM returns text without tool calls, or hits max iterations.
 */

import type {
  GenerateOptions,
  GenerateResult,
  LLMMessage,
  LLMProvider,
  StreamChunk,
  ToolCall,
  ToolResult,
} from './provider';

/* ── Tool Executor Interface ──────────────────────────────── */

export interface ToolExecutor {
  /** Execute a tool by name with given args. Return the result (or throw). */
  execute(name: string, args: Record<string, unknown>): Promise<unknown>;
}

/* ── Loop Events (for SSE streaming) ──────────────────────── */

export type ToolLoopEvent =
  | { type: 'thinking'; text: string }
  | { type: 'tool_call_start'; name: string; args: Record<string, unknown> }
  | { type: 'tool_call_result'; name: string; result: unknown; isError: boolean }
  | { type: 'text'; content: string }
  | { type: 'iteration'; round: number; maxRounds: number }
  | { type: 'done'; result: ToolLoopResult };

export interface ToolLoopResult {
  /** Final text response from the LLM (after all tool calls complete) */
  text: string;
  /** Full message history including all tool call rounds */
  messages: LLMMessage[];
  /** All tool calls made during the loop */
  allToolCalls: ToolCall[];
  /** All tool results collected */
  allToolResults: ToolResult[];
  /** Number of rounds executed */
  rounds: number;
  /** Cumulative token usage */
  totalUsage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

/* ── Tool Loop Options ────────────────────────────────────── */

export interface ToolLoopOptions extends GenerateOptions {
  /** Maximum number of LLM ↔ tool rounds (default: 10) */
  maxIterations?: number;
  /** Callback for streaming events */
  onEvent?: (event: ToolLoopEvent) => void;
}

/* ── Multi-Round Tool Calling Loop ────────────────────────── */

export async function runToolLoop(
  provider: LLMProvider,
  executor: ToolExecutor,
  options: ToolLoopOptions,
): Promise<ToolLoopResult> {
  const maxIterations = options.maxIterations ?? 10;
  const messages: LLMMessage[] = [...options.messages];
  const allToolCalls: ToolCall[] = [];
  const allToolResults: ToolResult[] = [];
  const totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let finalText = '';

  for (let round = 0; round < maxIterations; round++) {
    options.onEvent?.({ type: 'iteration', round, maxRounds: maxIterations });

    const result: GenerateResult = await provider.generate({
      ...options,
      messages,
    });

    // Accumulate usage
    if (result.usage) {
      totalUsage.promptTokens += result.usage.promptTokens;
      totalUsage.completionTokens += result.usage.completionTokens;
      totalUsage.totalTokens += result.usage.totalTokens;
    }

    // If LLM returned text, emit it
    if (result.text) {
      options.onEvent?.({ type: 'text', content: result.text });
      finalText += result.text;
    }

    // If no tool calls, we're done
    if (result.toolCalls.length === 0 || result.finishReason === 'stop') {
      // Append assistant message
      messages.push({ role: 'assistant', content: result.text });
      break;
    }

    // Process tool calls
    const toolResults: ToolResult[] = [];

    // Append assistant message with tool calls
    messages.push({
      role: 'assistant',
      content: result.text,
      toolCalls: result.toolCalls,
    });

    for (const toolCall of result.toolCalls) {
      allToolCalls.push(toolCall);
      options.onEvent?.({ type: 'tool_call_start', name: toolCall.name, args: toolCall.args });

      let toolResult: unknown;
      let isError = false;

      try {
        toolResult = await executor.execute(toolCall.name, toolCall.args);
      } catch (err) {
        toolResult = err instanceof Error ? err.message : String(err);
        isError = true;
      }

      const result: ToolResult = {
        callId: toolCall.id,
        name: toolCall.name,
        result: toolResult,
        isError,
      };

      toolResults.push(result);
      allToolResults.push(result);
      options.onEvent?.({ type: 'tool_call_result', name: toolCall.name, result: toolResult, isError });
    }

    // Append tool results as a tool message
    messages.push({
      role: 'tool',
      content: JSON.stringify(toolResults.map(r => ({
        callId: r.callId,
        name: r.name,
        result: r.result,
        isError: r.isError,
      }))),
      toolResults,
    });
  }

  const loopResult: ToolLoopResult = {
    text: finalText,
    messages,
    allToolCalls,
    allToolResults,
    rounds: allToolCalls.length > 0 ? Math.ceil(allToolCalls.length / Math.max(1, allToolCalls.length)) : 0,
    totalUsage,
  };

  options.onEvent?.({ type: 'done', result: loopResult });
  return loopResult;
}
