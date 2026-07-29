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
export type TaskPriority = "low" | "medium" | "high";
export type PlanComplexity = "simple" | "moderate" | "complex";

export interface TaskNode {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly agentId: AgentId;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly estimatedDuration?: number;
  readonly dependencies: string[];
  readonly input?: string;
  readonly output?: unknown;
  readonly metadata?: Record<string, unknown>;
}

export interface TaskPlan {
  readonly id: string;
  readonly userRequest: string;
  readonly intent: string;
  readonly complexity: PlanComplexity;
  readonly tasks: TaskNode[];
  readonly executionOrder: string[];
  readonly parallelGroups: string[][];
  readonly clarificationNeeded?: boolean;
  readonly clarificationQuestion?: string;
  readonly createdAt: Date;
}
