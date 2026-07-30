import type { AgentId, A1Range, Capability } from '@repo/shared';
import type { LayeredContext } from '@repo/context';

export interface PlannedTask {
  id: string;
  agent: AgentId;
  intent: string;
  inputRanges: A1Range[];
  dependsOn: string[];
  estimatedTokens?: number;
}

export interface ExecutionPlan {
  id: string;
  tasks: PlannedTask[];
  edges: { from: string; to: string }[];
  estimatedCost: { tokens: number; commands: number; latencyMs: number };
  executionMode: 'sequential' | 'parallel' | 'hybrid';
}

export interface PlannerLLM {
  decompose(message: string, context: LayeredContext): Promise<PlannedTask[]>;
}

const CAPABILITY_MAP: Record<string, { agent: AgentId; capability: Capability }> = {
  formula: { agent: 'formula-agent', capability: 'formula' },
  chart: { agent: 'chart-agent', capability: 'chart' },
  clean: { agent: 'data-cleaning-agent', capability: 'cleaning' },
  format: { agent: 'formatting-agent', capability: 'formatting' },
  pivot: { agent: 'pivot-agent', capability: 'pivot' },
  import: { agent: 'import-agent', capability: 'import' },
  export: { agent: 'export-agent', capability: 'export' },
};

export class PlannerAgent {
  constructor(private llm: PlannerLLM) {}

  async plan(message: string, context: LayeredContext): Promise<ExecutionPlan> {
    const tasks = await this.llm.decompose(message, context);
    const enriched = tasks.map((t) => ({
      ...t,
      agent: t.agent || this.selectAgent(t.intent),
      inputRanges: t.inputRanges.length > 0 ? t.inputRanges : context.selectedCells,
    }));

    const edges = detectDependencies(enriched);
    const estimatedCost = estimateCost(enriched);
    const executionMode = decideExecutionMode(enriched, edges, estimatedCost);

    return {
      id: crypto.randomUUID(),
      tasks: enriched,
      edges,
      estimatedCost,
      executionMode,
    };
  }

  private selectAgent(intent: string): AgentId {
    const lower = intent.toLowerCase();
    for (const [keyword, { agent }] of Object.entries(CAPABILITY_MAP)) {
      if (lower.includes(keyword)) return agent;
    }
    return 'ai-assistant-agent';
  }
}

function detectDependencies(tasks: PlannedTask[]): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const a = tasks[i]!;
      const b = tasks[j]!;
      if (rangesOverlap(a.inputRanges, b.inputRanges)) {
        edges.push({ from: a.id, to: b.id });
      }
      for (const dep of b.dependsOn) {
        edges.push({ from: dep, to: b.id });
      }
    }
  }
  return edges;
}

function rangesOverlap(a: A1Range[], b: A1Range[]): boolean {
  return a.some((ra) => b.some((rb) => ra.sheetId === rb.sheetId));
}

function estimateCost(tasks: PlannedTask[]): ExecutionPlan['estimatedCost'] {
  const tokens = tasks.reduce((s, t) => s + (t.estimatedTokens ?? 2000), 0);
  return { tokens, commands: tasks.length * 3, latencyMs: tasks.length * 1500 };
}

function decideExecutionMode(
  tasks: PlannedTask[],
  edges: { from: string; to: string }[],
  cost: ExecutionPlan['estimatedCost']
): ExecutionPlan['executionMode'] {
  const hasIndependent = edges.length < tasks.length - 1;
  if (hasIndependent && cost.commands < 20) return 'parallel';
  if (hasIndependent) return 'hybrid';
  return 'sequential';
}

export function topologicalSort(
  tasks: PlannedTask[],
  edges: { from: string; to: string }[]
): PlannedTask[] {
  const inDegree = new Map(tasks.map((t) => [t.id, 0]));
  for (const e of edges) {
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
  }
  const queue = tasks.filter((t) => (inDegree.get(t.id) ?? 0) === 0);
  const sorted: PlannedTask[] = [];

  while (queue.length > 0) {
    const task = queue.shift()!;
    sorted.push(task);
    for (const e of edges.filter((x) => x.from === task.id)) {
      const deg = (inDegree.get(e.to) ?? 1) - 1;
      inDegree.set(e.to, deg);
      if (deg === 0) {
        const next = tasks.find((t) => t.id === e.to);
        if (next) queue.push(next);
      }
    }
  }
  return sorted.length === tasks.length ? sorted : tasks;
}
