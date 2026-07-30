import { AgentRegistry } from '@repo/agents';
import { ContextManager } from '@repo/context';
import { InMemoryStore } from '@repo/memory';
import { PlannerAgent } from '@repo/planner';
import { MonaRuntime } from '@repo/runtime';
import { UniverAdapter } from '@repo/spreadsheet';
import type { PlannedTask } from '@repo/planner';
import type { LayeredContext } from '@repo/context';
import { NextResponse } from 'next/server';

/** Stub LLM — production wires Claude/OpenAI/Gemini via provider abstraction */
const stubPlannerLLM = {
  async decompose(message: string, context: LayeredContext): Promise<PlannedTask[]> {
    const lower = message.toLowerCase();
    const tasks: PlannedTask[] = [];

    if (lower.includes('formula') || lower.includes('sum') || lower.includes('calculate')) {
      tasks.push({
        id: crypto.randomUUID(),
        agent: 'formula-agent',
        intent: message,
        inputRanges: context.selectedCells.length > 0 ? context.selectedCells : [{
          sheetId: context.activeSheet.id,
          start: 'A1',
          end: 'A1',
        }],
        dependsOn: [],
      });
    }

    if (tasks.length === 0) {
      tasks.push({
        id: crypto.randomUUID(),
        agent: 'ai-assistant-agent',
        intent: message,
        inputRanges: context.selectedCells,
        dependsOn: [],
      });
    }

    return tasks;
  },
};

function createRuntime(): MonaRuntime {
  const memory = new InMemoryStore();
  const spreadsheet = new UniverAdapter();

  const contextManager = new ContextManager({
    memory,
    getWorkbookMeta: async (workbookId) => ({
      id: workbookId,
      name: 'Workbook',
      sheetNames: ['Sheet1'],
      ownerId: 'user',
      classification: 'internal',
    }),
    getSelection: async () => [],
  });

  const agents = new AgentRegistry().all();

  return new MonaRuntime({
    planner: new PlannerAgent(stubPlannerLLM),
    contextManager,
    spreadsheet,
    memory,
    policyContext: {
      workbook: { id: 'default', classification: 'internal' },
      actorRole: 'editor',
      tenantId: 'default',
    },
    agents,
  });
}

/**
 * POST /api/ai/chat
 * Entry point for agentic spreadsheet turns.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      message: string;
      sessionId?: string;
      workbookId?: string;
      userId?: string;
    };

    const runtime = createRuntime();
    const turnId = crypto.randomUUID();

    const result = await runtime.executeTurn({
      turnId,
      sessionId: body.sessionId ?? crypto.randomUUID(),
      workbookId: body.workbookId ?? 'default',
      userId: body.userId ?? 'anonymous',
      message: body.message,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
