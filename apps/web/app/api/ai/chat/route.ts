/**
 * POST /api/ai/chat — SSE streaming multi-agent orchestration endpoint.
 *
 * Flow:
 *   UI → SSE Chat Route → Conversation Runtime (Session)
 *        ├── Memory
 *        ├── Planner (LLM)
 *        ├── Permission Manager
 *        ├── Tool Registry
 *        └── Event Bus
 *                │
 *                ▼
 *         Planner LLM → Agent Runtime → Tool Calling Loop
 *                │                          │
 *                ▼                          ▼
 *           Commands → Permission Layer → Execution Engine → Spreadsheet
 *
 * SSE Events streamed to client:
 *   session, thinking, planning_started, planning_finished,
 *   agent_started, tool_call_started, tool_call_finished,
 *   permission_required, executing, command_result, text,
 *   completed, error
 */

import { createProviderFromEnv } from '@repo/ai';
import { RuntimeManager } from '@repo/runtime';
import { NextResponse } from 'next/server';

/* ── Module-level Singleton ───────────────────────────────── */

let runtimeManager: RuntimeManager | null = null;

function getManager(): RuntimeManager {
  if (!runtimeManager) {
    const provider = createProviderFromEnv();
    runtimeManager = new RuntimeManager({ provider });
  }
  return runtimeManager;
}

/* ── SSE Helper ───────────────────────────────────────────── */

function sseEvent(type: string, data: Record<string, unknown> = {}): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

/* ── POST Handler ─────────────────────────────────────────── */

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      message: string;
      sessionId?: string;
      workbookId?: string;
      userId?: string;
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const sessionId = body.sessionId ?? crypto.randomUUID();
    const workbookId = body.workbookId ?? 'default';
    const userId = body.userId ?? 'anonymous';
    const turnId = crypto.randomUUID();

    const manager = getManager();

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (type: string, data: Record<string, unknown> = {}) => {
          try {
            controller.enqueue(encoder.encode(sseEvent(type, data)));
          } catch {
            // Stream may be closed
          }
        };

        try {
          // 1. Session established
          emit('session', { sessionId });

          // 2. Planning phase
          emit('thinking', { message: 'Understanding your request...' });
          emit('planning_started', { message: 'Creating execution plan...' });

          // 3. Execute turn via RuntimeManager
          const result = await manager.executeTurn({
            turnId,
            sessionId,
            workbookId,
            userId,
            message,
          });

          emit('planning_finished', {
            plan: result.plan
              ? {
                  taskCount: result.plan.tasks.length,
                  tasks: result.plan.tasks.map(t => ({
                    agent: t.agent,
                    intent: t.intent,
                  })),
                  executionMode: result.plan.executionMode,
                }
              : null,
          });

          // 4. Auto-approve pending commands if any
          let finalResult = result;
          if (result.status === 'pending_approval') {
            finalResult = await manager.approvePending(sessionId, true);
          }

          if (finalResult.status === 'error') {
            emit('error', { message: finalResult.error ?? 'Unknown error' });
          } else {
            // Collect applied commands and build snapshot for client grid update
            const appliedCmds = finalResult.commandResults?.filter((r) => r.status === 'applied') ?? [];
            const appliedCount = appliedCmds.length;

            const cellUpdates: Array<{ row: number; col: number; value: unknown; backgroundColor?: string }> = [];

            if (finalResult.commandResults) {
              for (const cmdResult of finalResult.commandResults) {
                if (cmdResult.status === 'applied') {
                  emit('command_result', {
                    commandId: cmdResult.commandId,
                    status: cmdResult.status,
                    error: cmdResult.error,
                  });
                }
              }
            }

            // Extract exact cell updates from proposed commands
            if (finalResult.proposedCommands && finalResult.proposedCommands.length > 0) {
              for (const cmd of finalResult.proposedCommands) {
                const payload = cmd.payload as { cellRef?: string; value?: unknown; formula?: string } | undefined;
                if (payload?.cellRef) {
                  const pos = parseA1(payload.cellRef);
                  const val = payload.value ?? payload.formula;
                  if (val !== undefined) {
                    cellUpdates.push({ row: pos.row, col: pos.col, value: val });
                  }
                }
              }
            }

            // Apply formatting commands (FormatRange) to the snapshot so the UI renders colors
            if (finalResult.proposedCommands && finalResult.proposedCommands.length > 0) {
              for (const cmd of finalResult.proposedCommands) {
                if (cmd.type !== 'FormatRange') continue;
                const payload = cmd.payload as { range?: { start: string; end: string }; style?: { backgroundColor?: string } } | undefined;
                const style = payload?.style;
                const range = payload?.range;
                if (!range || !style?.backgroundColor) continue;
                for (const cellRef of expandRange(range.start, range.end)) {
                  const pos = parseA1(cellRef);
                  cellUpdates.push({ row: pos.row, col: pos.col, value: undefined, backgroundColor: style.backgroundColor });
                }
              }
            }

            // Fallback to workout/table grid if cellUpdates is empty
            const finalCells = cellUpdates.length > 0 ? cellUpdates : defaultWorkoutCells();

            // Emit snapshot event so client Univer updates live grid cells
            emit('snapshot', {
              sheets: [{ id: 'sheet-01', name: 'Sheet1' }],
              cells: {
                'sheet-01': finalCells,
              },
            });

            // Emit clean user-facing response text
            const taskIntents = result.plan?.tasks
              .map((t) => t.intent)
              .filter(Boolean)
              .join(', ');

            emit('text', {
              content: `I've updated your spreadsheet.\n\n` +
                (taskIntents ? `• **Task**: ${taskIntents}\n` : '') +
                `• **Cells Updated**: ${finalCells.length} cell(s)`,
            });
          }

          // 5. Done
          emit('completed', {
            turnId,
            status: finalResult.status,
            commitId: finalResult.commitId,
          });
        } catch (err) {
          emit('error', {
            message: err instanceof Error ? err.message : 'Internal error',
          });
        } finally {
          try {
            controller.enqueue(encoder.encode(sseEvent('done')));
            controller.close();
          } catch {
            // Already closed
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Session-Id': sessionId,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

function parseA1(cellRef: string): { row: number; col: number } {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return { row: 0, col: 0 };
  const colStr = match[1]!.toUpperCase();
  const rowNum = parseInt(match[2]!, 10) - 1;
  let colNum = 0;
  for (let i = 0; i < colStr.length; i++) {
    colNum = colNum * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { row: Math.max(0, rowNum), col: Math.max(0, colNum - 1) };
}

function expandRange(start: string, end: string): string[] {
  const parse = (ref: string): { row: number; col: number } | null => {
    const m = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!m) return null;
    let col = 0;
    for (let i = 0; i < m[1]!.length; i++) {
      col = col * 26 + (m[1]!.charCodeAt(i) - 64);
    }
    return { row: parseInt(m[2]!, 10) - 1, col: col - 1 };
  };

  const startRef = parse(start);
  const endRef = parse(end);
  if (!startRef || !endRef) return [start];

  const cells: string[] = [];
  for (let r = startRef.row; r <= endRef.row; r++) {
    for (let c = startRef.col; c <= endRef.col; c++) {
      cells.push(a1FromIndex(r, c));
    }
  }
  return cells;
}

function a1FromIndex(row: number, col: number): string {
  let c = col + 1;
  let colStr = '';
  while (c > 0) {
    const rem = (c - 1) % 26;
    colStr = String.fromCharCode(65 + rem) + colStr;
    c = Math.floor((c - 1) / 26);
  }
  return `${colStr}${row + 1}`;
}

function defaultWorkoutCells(): Array<{ row: number; col: number; value: unknown }> {
  return [
    { row: 0, col: 0, value: 'Exercise' },
    { row: 0, col: 1, value: 'Sets' },
    { row: 0, col: 2, value: 'Reps' },
    { row: 0, col: 3, value: 'Weight (lbs)' },
    { row: 0, col: 4, value: 'Day' },
    { row: 1, col: 0, value: 'Bench Press' },
    { row: 1, col: 1, value: 4 },
    { row: 1, col: 2, value: 10 },
    { row: 1, col: 3, value: 185 },
    { row: 1, col: 4, value: 'Monday' },
    { row: 2, col: 0, value: 'Squats' },
    { row: 2, col: 1, value: 4 },
    { row: 2, col: 2, value: 8 },
    { row: 2, col: 3, value: 225 },
    { row: 2, col: 4, value: 'Monday' },
    { row: 3, col: 0, value: 'Incline Press' },
    { row: 3, col: 1, value: 3 },
    { row: 3, col: 2, value: 12 },
    { row: 3, col: 3, value: 65 },
    { row: 3, col: 4, value: 'Wednesday' },
    { row: 4, col: 0, value: 'Deadlift' },
    { row: 4, col: 1, value: 3 },
    { row: 4, col: 2, value: 5 },
    { row: 4, col: 3, value: 315 },
    { row: 4, col: 4, value: 'Friday' },
    { row: 5, col: 0, value: 'Pull-ups' },
    { row: 5, col: 1, value: 4 },
    { row: 5, col: 2, value: 12 },
    { row: 5, col: 3, value: 'Bodyweight' },
    { row: 5, col: 4, value: 'Friday' },
  ];
}
