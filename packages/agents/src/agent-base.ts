import type { BaseCommand } from '@repo/commands';
import type { LayeredContext } from '@repo/context';
import type { PlannedTask } from '@repo/planner';
import type { AgentId, Capability } from '@repo/shared';

export interface AgentResult {
  commands: BaseCommand[];
  rationale: string;
  confidence: number;
}

export interface AgentRunOptions {
  signal?: AbortSignal;
}

export interface Agent {
  readonly id: AgentId;
  readonly capabilities: Capability[];
  readonly timeoutMs: number;
  readonly maxRetries: number;

  run(task: PlannedTask, context: LayeredContext, opts?: AgentRunOptions): Promise<AgentResult>;
}

export abstract class BaseAgent implements Agent {
  abstract readonly id: AgentId;
  abstract readonly capabilities: Capability[];
  readonly timeoutMs: number = 30_000;
  readonly maxRetries = 2;

  abstract run(
    task: PlannedTask,
    context: LayeredContext,
    opts?: AgentRunOptions
  ): Promise<AgentResult>;
}
