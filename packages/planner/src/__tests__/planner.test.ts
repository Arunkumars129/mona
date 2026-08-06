import { describe, it, expect, vi } from 'vitest';
import { PlannerAgent, topologicalSort, type PlannerLLM, type PlannedTask, type ExecutionPlan } from '../planner';
import type { LayeredContext } from '@repo/context';

/* ── Helpers ──────────────────────────────────────────────── */

function makeContext(): LayeredContext {
  return {
    conversation: [],
    workbookMeta: {
      id: 'wb-1',
      name: 'Test Workbook',
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
    agent: '',
    intent: 'do something',
    inputRanges: [],
    dependsOn: [],
    ...overrides,
  };
}

/* ── Tests ────────────────────────────────────────────────── */

describe('PlannerAgent', () => {
  it('decomposes a message via LLM and enriches with agent selection', async () => {
    const mockLLM: PlannerLLM = {
      decompose: vi.fn().mockResolvedValue([
        makeTask({ id: 't1', intent: 'add a SUM formula', agent: '' }),
      ]),
    };

    const planner = new PlannerAgent(mockLLM);
    const plan = await planner.plan('add a formula to sum column A', makeContext());

    expect(plan.tasks).toHaveLength(1);
    expect(plan.tasks[0]!.agent).toBe('formula-agent'); // keyword 'formula' in intent
    expect(plan.id).toBeDefined();
    expect(plan.executionMode).toBeDefined();
  });

  it('selects chart-agent for chart-related intent', async () => {
    const mockLLM: PlannerLLM = {
      decompose: vi.fn().mockResolvedValue([
        makeTask({ id: 't1', intent: 'create a bar chart', agent: '' }),
      ]),
    };

    const planner = new PlannerAgent(mockLLM);
    const plan = await planner.plan('create a bar chart', makeContext());

    expect(plan.tasks[0]!.agent).toBe('chart-agent');
  });

  it('selects data-cleaning-agent for cleaning intent', async () => {
    const mockLLM: PlannerLLM = {
      decompose: vi.fn().mockResolvedValue([
        makeTask({ id: 't1', intent: 'clean the data and remove duplicates', agent: '' }),
      ]),
    };

    const planner = new PlannerAgent(mockLLM);
    const plan = await planner.plan('clean data', makeContext());

    expect(plan.tasks[0]!.agent).toBe('data-cleaning-agent');
  });

  it('falls back to ai-assistant-agent for unknown intents', async () => {
    const mockLLM: PlannerLLM = {
      decompose: vi.fn().mockResolvedValue([
        makeTask({ id: 't1', intent: 'do something unknown', agent: '' }),
      ]),
    };

    const planner = new PlannerAgent(mockLLM);
    const plan = await planner.plan('do something', makeContext());

    expect(plan.tasks[0]!.agent).toBe('ai-assistant-agent');
  });

  it('detects dependencies from overlapping input ranges', async () => {
    const mockLLM: PlannerLLM = {
      decompose: vi.fn().mockResolvedValue([
        makeTask({
          id: 't1',
          intent: 'populate data',
          inputRanges: [{ sheetId: 'sheet-1', start: 'A1', end: 'A10' }],
        }),
        makeTask({
          id: 't2',
          intent: 'add formula',
          inputRanges: [{ sheetId: 'sheet-1', start: 'A11', end: 'A11' }],
        }),
      ]),
    };

    const planner = new PlannerAgent(mockLLM);
    const plan = await planner.plan('create table with formulas', makeContext());

    // Both on sheet-1 → overlap detected → edge t1→t2
    expect(plan.edges.length).toBeGreaterThan(0);
    expect(plan.edges.some((e) => e.from === 't1' && e.to === 't2')).toBe(true);
  });

  it('uses selected cells when task has empty inputRanges', async () => {
    const ctx = makeContext();
    ctx.selectedCells = [{ sheetId: 'sheet-1', start: 'B1', end: 'B5' }];

    const mockLLM: PlannerLLM = {
      decompose: vi.fn().mockResolvedValue([
        makeTask({ id: 't1', intent: 'format cells', inputRanges: [] }),
      ]),
    };

    const planner = new PlannerAgent(mockLLM);
    const plan = await planner.plan('format', ctx);

    expect(plan.tasks[0]!.inputRanges).toEqual(ctx.selectedCells);
  });

  it('estimates cost based on task count', async () => {
    const mockLLM: PlannerLLM = {
      decompose: vi.fn().mockResolvedValue([
        makeTask({ id: 't1', intent: 'task one' }),
        makeTask({ id: 't2', intent: 'task two' }),
      ]),
    };

    const planner = new PlannerAgent(mockLLM);
    const plan = await planner.plan('do stuff', makeContext());

    expect(plan.estimatedCost.tokens).toBeGreaterThan(0);
    expect(plan.estimatedCost.commands).toBeGreaterThan(0);
    expect(plan.estimatedCost.latencyMs).toBeGreaterThan(0);
  });
});

describe('topologicalSort', () => {
  it('sorts a linear DAG in order', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      makeTask({ id: 'c' }),
    ];
    const edges = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
    ];

    const sorted = topologicalSort(tasks, edges);

    expect(sorted.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('handles diamond DAG (A→B, A→C, B→D, C→D)', () => {
    const tasks = [
      makeTask({ id: 'A' }),
      makeTask({ id: 'B' }),
      makeTask({ id: 'C' }),
      makeTask({ id: 'D' }),
    ];
    const edges = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'C', to: 'D' },
    ];

    const sorted = topologicalSort(tasks, edges);

    expect(sorted[0]!.id).toBe('A');
    expect(sorted[sorted.length - 1]!.id).toBe('D');
    // B and C can be in either order but both before D
    const bIdx = sorted.findIndex((t) => t.id === 'B');
    const cIdx = sorted.findIndex((t) => t.id === 'C');
    const dIdx = sorted.findIndex((t) => t.id === 'D');
    expect(bIdx).toBeLessThan(dIdx);
    expect(cIdx).toBeLessThan(dIdx);
  });

  it('handles empty graph', () => {
    const sorted = topologicalSort([], []);
    expect(sorted).toEqual([]);
  });

  it('handles independent tasks (no edges)', () => {
    const tasks = [
      makeTask({ id: 'x' }),
      makeTask({ id: 'y' }),
      makeTask({ id: 'z' }),
    ];

    const sorted = topologicalSort(tasks, []);

    expect(sorted).toHaveLength(3);
    expect(new Set(sorted.map((t) => t.id))).toEqual(new Set(['x', 'y', 'z']));
  });
});
