/**
 * Stream Event Types
 *
 * Events streamed from the runtime to the browser via SSE.
 */

import type { AgentId, TokenUsage } from "@mona/schema";

export type StreamEvent =
  | { type: "text"; content: string }
  | { type: "tool_call_start"; name: string; arguments: Record<string, unknown> }
  | { type: "tool_call_result"; name: string; result: string; isError: boolean }
  | { type: "agent_switch"; from: AgentId; to: AgentId; reason: string }
  | { type: "thinking"; content: string }
  | { type: "status"; message: string }
  | { type: "done"; usage: TokenUsage; cost: number }
  | { type: "error"; message: string; recoverable: boolean }
  | { type: "snapshot"; sheets: { id: string; name: string }[]; cells: Record<string, { row: number; col: number; value: unknown }[]> };

/**
 * Encode a stream event as an SSE data line.
 */
export function encodeSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Parse an SSE data line back into a StreamEvent.
 */
export function parseSSE(line: string): StreamEvent | null {
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6)) as StreamEvent;
  } catch {
    return null;
  }
}
