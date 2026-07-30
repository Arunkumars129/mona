import type { Agent, AgentResult } from '@repo/agents';
import type { BaseCommand } from '@repo/commands';
import { boundContext, type LayeredContext } from '@repo/context';
import type { EventBus } from '@repo/events';
import type { ExecutionPlan, PlannedTask } from '@repo/planner';
import { topologicalSort } from '@repo/planner';
import type { AgentId } from '@repo/shared';

export interface RouterOptions {
  signal?: AbortSignal;
}

export class AgentRouter {
  constructor(
    private registry: Map<AgentId, Agent>,
    private bus: EventBus,
    private fallbackAgentId: AgentId = 'ai-assistant-agent'
  ) {}

  register(agent: Agent): void {
    this.registry.set(agent.id, agent);
  }

  async execute(
    task: PlannedTask,
    ctx: LayeredContext,
    opts?: RouterOptions
  ): Promise<BaseCommand[]> {
    const agent = this.registry.get(task.agent) ?? this.registry.get(this.fallbackAgentId);
    if (!agent) throw new Error(`No agent registered for ${task.agent}`);

    const boundedCtx = boundContext(ctx, task.inputRanges);
    const correlationId = task.id;

    this.bus.emit({
      type: 'AgentStarted',
      agentId: agent.id,
      taskId: task.id,
      correlationId,
      at: new Date().toISOString(),
    });

    try {
      const result = await withRetry(
        () => withTimeout(agent.run(task, boundedCtx, opts), agent.timeoutMs, opts?.signal),
        agent.maxRetries
      );

      this.bus.emit({
        type: 'AgentFinished',
        agentId: agent.id,
        taskId: task.id,
        status: 'ok',
        correlationId,
        at: new Date().toISOString(),
      });

      return result.commands;
    } catch (err) {
      this.bus.emit({
        type: 'AgentFinished',
        agentId: agent.id,
        taskId: task.id,
        status: 'error',
        correlationId,
        at: new Date().toISOString(),
      });
      throw err;
    }
  }

  async executePlan(
    plan: ExecutionPlan,
    ctx: LayeredContext,
    opts?: RouterOptions
  ): Promise<BaseCommand[]> {
    const sorted = topologicalSort(plan.tasks, plan.edges);
    const allCommands: BaseCommand[] = [];

    if (plan.executionMode === 'parallel') {
      const waves = groupIndependentWaves(sorted, plan.edges);
      for (const wave of waves) {
        const results = await Promise.all(
          wave.map((task) => this.execute(task, ctx, opts))
        );
        allCommands.push(...results.flat());
      }
    } else {
      for (const task of sorted) {
        const cmds = await this.execute(task, ctx, opts);
        allCommands.push(...cmds);
      }
    }

    return dedupeCommands(allCommands);
  }
}

function groupIndependentWaves(
  tasks: PlannedTask[],
  edges: { from: string; to: string }[]
): PlannedTask[][] {
  const waves: PlannedTask[][] = [];
  const completed = new Set<string>();
  let remaining = [...tasks];

  while (remaining.length > 0) {
    const wave = remaining.filter(
      (t) => !edges.some((e) => e.to === t.id && !completed.has(e.from))
    );
    if (wave.length === 0) break;
    waves.push(wave);
    for (const t of wave) completed.add(t.id);
    remaining = remaining.filter((t) => !completed.has(t.id));
  }
  return waves;
}

function dedupeCommands(cmds: BaseCommand[]): BaseCommand[] {
  const seen = new Set<string>();
  return cmds.filter((c) => {
    const key = `${c.type}:${JSON.stringify(c.payload)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  signal?: AbortSignal
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const id = setTimeout(() => reject(new Error('Agent timeout')), ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(id);
        reject(new Error('Agent cancelled'));
      });
    }),
  ]);
}

export type { AgentResult };
