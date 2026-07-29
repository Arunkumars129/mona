/**
 * Session Schema Types
 *
 * Conversation sessions between users and the AI runtime.
 */

// ── Session ──────────────────────────────────────────────────────────

export type SessionStatus = "active" | "completed" | "cancelled" | "error";

export interface Session {
  readonly id: string;
  readonly workbookId: string;
  readonly userId: string;
  readonly messages: Message[];
  readonly status: SessionStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata: SessionMetadata;
}

export interface SessionMetadata {
  readonly totalTokens: number;
  readonly totalCost: number;
  readonly messageCount: number;
  readonly toolCallCount: number;
}

// ── Messages ─────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface Message {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly toolCalls?: ToolCallRef[];
  readonly toolResults?: ToolResultRef[];
  readonly timestamp: Date;
  readonly agentId?: string;
  readonly usage?: TokenUsage;
}

/** A reference to a tool call within a message. */
export interface ToolCallRef {
  readonly id: string;
  readonly name: string;
  readonly arguments: Record<string, unknown>;
}

/** A reference to a tool result within a message. */
export interface ToolResultRef {
  readonly toolCallId: string;
  readonly content: string;
  readonly isError: boolean;
}

// ── Token Usage ──────────────────────────────────────────────────────

export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}
