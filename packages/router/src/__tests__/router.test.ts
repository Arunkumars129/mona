import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentRouter } from '../router';
import { EventBus } from '@repo/events';
import type { Agent, AgentResult, AgentRunOptions } from '@repo/agents';
import type { BaseCommand } from '@repo/commands';
import type { LayeredContext } from '@repo/context';
import type { PlannedTask, ExecutionPlan } from '@repo/planner';

/* ── Helpers ──────────────────────────────────────────────── */

function makeContext(): LayeredContext {
  return {
    conversation: [],
    workbookMeta: {
      id: 'wb-1',
      name: 'Test',
      sheetNames: ['Sheet1'],
      ownerId: 'user-1',
      classification: 'internal',
    },
    activeSheet: { id: 'sheet-1', name: 'Sheet1', rowCount: 100, colCount: 26 },
    selectedCells: [{ sheetId: 'sheet-1', start: 'A1', end: 'A10' }],
    referencedRanges: [],
    dependencyGraphSlice: [],
    namedRanges: [],
    versionSummary: [],
    recentEdits: [],
    semanticSummary: '',
  };
}

function makeTask(overrides: Partial<PlannedTask> = {}): PlannedTask {
  return {
    id: crypto.randomUUID(),
    agent: 'test-agent',
    intent: 'test intent',
    inputRanges: [{ sheetId: 'sheet-1', start: 'A1', end: 'A10' }],
    dependsOn: [],
    ...overrides,
  };
}

function makeCommand(id: string, cellRef = 'A1', value: unknown = 42): BaseCommand {
  return {
    id,
    type: 'SetCellValue',
    payload: { cellRef, value },
    issuedBy: { kind: 'agent', id: 'test-agent' },
    targetSheetId: 'sheet-1',
    createdAt: new Date().toISOString(),
    correlationId: 'corr-1',
  };
}

function createMockAgent(
  id: string,
  commands: BaseCommand[] = [makeCommand('cmd-1')],
  opts?: { failFirst?: number; timeoutMs?: number; maxRetries?: number }
): Agent {
  let callCount = 0;
  return {
    id,
    capabilities: ['assistant'],
    timeoutMs: opts?.timeoutMs ?? 30_000,
    maxRetries: opts?.maxRetries ?? 2,
    run: vi.fn(async (_task: PlannedTask, _ctx: LayeredContext, _opts?: AgentRunOptions): Promise<AgentResult> => {
      callCount++;
      if (opts?.failFirst && callCount <= opts.failFirst) {
        throw new Error(`Agent error on call ${callCount}`);
      }
      return { commands, rationale: 'test', confidence: 0.9 };
    }),
  };
}

/* ── Tests ────────────────────────────────────────────────── */

describe('AgentRouter', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('execute', () => {
    it('resolves the correct agent and returns commands', async () => {
      const agent = createMockAgent('test-agent');
      const registry = new Map([['test-agent', agent]]);
      const router = new AgentRouter(registry, bus);

      const task = makeTask({ agent: 'test-agent' });
      const cmds = await router.execute(task, makeContext());

      expect(cmds).toHaveLength(1);
      expect(cmds[0]!.id).toBe('cmd-1');
      expect(agent.run).toHaveBeenCalledOnce();
    });

    it('falls back to ai-assistant-agent when task agent not found', async () => {
      const fallback = createMockAgent('ai-assistant-agent', [makeCommand('fallback-cmd')]);
      const registry = new Map([['ai-assistant-agent', fallback]]);
      const router = new AgentRouter(registry, bus);

      const task = makeTask({ agent: 'nonexistent-agent' });
      const cmds = await router.execute(task, makeContext());

      expect(cmds).toHaveLength(1);
      expect(cmds[0]!.id).toBe('fallback-cmd');
    });

    it('throws when no agent found (including fallback)', async () => {
      const registry = new Map<string, Agent>();
      const router = new AgentRouter(registry, bus);

      const task = makeTask({ agent: 'nonexistent' });
      await expect(router.execute(task, makeContext())).rejects.toThrow();
    });

    it('emits AgentStarted and AgentFinished events on success', async () => {
      const agent = createMockAgent('test-agent');
      const registry = new Map([['test-agent', agent]]);
      const router = new AgentRouter(registry, bus);

      const events: string[] = [];
      bus.subscribe('AgentStarted', () => events.push('started'));
      bus.subscribe('AgentFinished', () => events.push('finished'));

      await router.execute(makeTask({ agent: 'test-agent' }), makeContext());

      expect(events).toEqual(['started', 'finished']);
    });

    it('emits AgentFinished with error status on failure', async () => {
      const agent = createMockAgent('test-agent', [], { failFirst: 999, maxRetries: 0 });
      const registry = new Map([['test-agent', agent]]);
      const router = new AgentRouter(registry, bus);

      const statuses: string[] = [];
      bus.subscribe('AgentFinished', (e) => {
        if (e.type === 'AgentFinished') statuses.push(e.status);
      });

      await expect(router.execute(makeTask({ agent: 'test-agent' }), makeContext())).rejects.toThrow();
      expect(statuses).toContain('error');
    });

    it('retries on failure up to maxRetries', async () => {
      const agent = createMockAgent('test-agent', [makeCommand('retry-cmd')], {
        failFirst: 1,
        maxRetries: 2,
      });
      const registry = new Map([['test-agent', agent]]);
      const router = new AgentRouter(registry, bus);

      const cmds = await router.execute(makeTask({ agent: 'test-agent' }), makeContext());

      expect(cmds).toHaveLength(1);
      expect(agent.run).toHaveBeenCalledTimes(2); // 1 fail + 1 success
    });
  });

  describe('executePlan', () => {
    it('executes sequential plan tasks in topological order', async () => {
      const executionOrder: string[] = [];

      const agentA = createMockAgent('agent-a');
      (agentA.run as any).mockImplementation(async () => {
        executionOrder.push('A');
        return { commands: [makeCommand('cmd-a', 'A1', 'from-agent-a')], rationale: 'A', confidence: 0.9 };
      });

      const agentB = createMockAgent('agent-b');
      (agentB.run as any).mockImplementation(async () => {
        executionOrder.push('B');
        return { commands: [makeCommand('cmd-b', 'B1', 'from-agent-b')], rationale: 'B', confidence: 0.9 };
      });

      const registry = new Map([
        ['agent-a', agentA],
        ['agent-b', agentB],
      ]);
      const router = new AgentRouter(registry, bus);

      const plan: ExecutionPlan = {
        id: 'plan-1',
        tasks: [
          makeTask({ id: 'ta', agent: 'agent-a' }),
          makeTask({ id: 'tb', agent: 'agent-b' }),
        ],
        edges: [{ from: 'ta', to: 'tb' }],
        estimatedCost: { tokens: 4000, commands: 6, latencyMs: 3000 },
        executionMode: 'sequential',
      };

      const cmds = await router.executePlan(plan, makeContext());

      expect(executionOrder).toEqual(['A', 'B']);
      expect(cmds.length).toBeGreaterThanOrEqual(2);
    });

    it('executes parallel plan with independent waves', async () => {
      const started: string[] = [];

      const agentA = createMockAgent('agent-a');
      (agentA.run as any).mockImplementation(async () => {
        started.push('A');
        return { commands: [makeCommand('cmd-a', 'A1', 'wave-a')], rationale: 'A', confidence: 0.9 };
      });

      const agentB = createMockAgent('agent-b');
      (agentB.run as any).mockImplementation(async () => {
        started.push('B');
        return { commands: [makeCommand('cmd-b', 'B1', 'wave-b')], rationale: 'B', confidence: 0.9 };
      });

      const registry = new Map([
        ['agent-a', agentA],
        ['agent-b', agentB],
      ]);
      const router = new AgentRouter(registry, bus);

      const plan: ExecutionPlan = {
        id: 'plan-2',
        tasks: [
          makeTask({ id: 'ta', agent: 'agent-a' }),
          makeTask({ id: 'tb', agent: 'agent-b' }),
        ],
        edges: [], // independent
        estimatedCost: { tokens: 4000, commands: 4, latencyMs: 3000 },
        executionMode: 'parallel',
      };

      const cmds = await router.executePlan(plan, makeContext());

      expect(started).toContain('A');
      expect(started).toContain('B');
      expect(cmds).toHaveLength(2);
    });

    it('deduplicates identical commands', async () => {
      const sharedCmd = makeCommand('shared');

      const agentA = createMockAgent('agent-a', [sharedCmd]);
      const agentB = createMockAgent('agent-b', [sharedCmd]); // same command

      const registry = new Map([
        ['agent-a', agentA],
        ['agent-b', agentB],
      ]);
      const router = new AgentRouter(registry, bus);

      const plan: ExecutionPlan = {
        id: 'plan-3',
        tasks: [
          makeTask({ id: 'ta', agent: 'agent-a' }),
          makeTask({ id: 'tb', agent: 'agent-b' }),
        ],
        edges: [],
        estimatedCost: { tokens: 4000, commands: 2, latencyMs: 3000 },
        executionMode: 'sequential',
      };

      const cmds = await router.executePlan(plan, makeContext());

      // Dedup should reduce to 1
      expect(cmds).toHaveLength(1);
    });
  });
});
