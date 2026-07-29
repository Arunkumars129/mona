/**
 * Agent Schema Types
 *
 * Definitions for the planner and specialist agents.
 */

// ── Agent Identity ───────────────────────────────────────────────────

export type AgentId =
  | "planner"
  | "formula"
  | "cleaning"
  | "chart"
  | "dashboard"
  | "insight"
  | "sql"
  | "python"
  | "automation"
  | "import-export"
  | "review";

/** The static definition of an agent — its capabilities, prompts, and tool access. */
export interface AgentDefinition {
  readonly id: AgentId;
  readonly name: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly tools: string[];
  readonly model?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly maxIterations?: number;
}

// ── Agent Execution ──────────────────────────────────────────────────

export type AgentStatus = "idle" | "running" | "completed" | "failed" | "cancelled";

export interface AgentInput {
  readonly task: string;
  readonly context?: Record<string, unknown>;
  readonly parentAgentId?: AgentId;
}

export interface AgentOutput {
  readonly agentId: AgentId;
  readonly status: AgentStatus;
  readonly result: string;
  readonly toolCallsExecuted: number;
  readonly usage: import("./session.js").TokenUsage;
}

// ── Task Decomposition (Planner) ─────────────────────────────────────

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface TaskNode {
  readonly id: string;
  readonly description: string;
  readonly agentId: AgentId;
  readonly status: TaskStatus;
  readonly dependencies: string[];
  readonly input?: string;
  readonly output?: string;
}

export interface TaskPlan {
  readonly id: string;
  readonly userRequest: string;
  readonly tasks: TaskNode[];
  readonly createdAt: Date;
}
