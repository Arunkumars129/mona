import { describe, it, expect } from 'vitest';
import { ExecutionTracer } from '../tracer';
import { EventBus } from '@repo/events';
import type { MonaEvent } from '@repo/events';

/* ── Helpers ──────────────────────────────────────────────── */

function emitTurnEvents(bus: EventBus, turnId: string): void {
  const corr = turnId;
  const now = new Date();

  bus.emit({
    type: 'TurnStarted',
    turnId,
    userId: 'user-1',
    workbookId: 'wb-1',
    correlationId: corr,
    at: now.toISOString(),
  });

  bus.emit({
    type: 'AgentStarted',
    agentId: 'formula-agent',
    taskId: 'task-1',
    correlationId: corr,
    at: new Date(now.getTime() + 10).toISOString(),
  });

  bus.emit({
    type: 'AgentFinished',
    agentId: 'formula-agent',
    taskId: 'task-1',
    status: 'ok',
    correlationId: corr,
    at: new Date(now.getTime() + 500).toISOString(),
  });

  bus.emit({
    type: 'PermissionRequested',
    commandId: 'cmd-1',
    riskLevel: 'safe',
    decision: 'allow',
    reason: 'safe write',
    correlationId: corr,
    at: new Date(now.getTime() + 510).toISOString(),
  });

  bus.emit({
    type: 'CommandExecuted',
    commandId: 'cmd-1',
    commandType: 'SetFormula',
    status: 'applied',
    correlationId: corr,
    at: new Date(now.getTime() + 520).toISOString(),
  });

  bus.emit({
    type: 'TurnFinished',
    turnId,
    status: 'ok',
    correlationId: corr,
    at: new Date(now.getTime() + 1000).toISOString(),
  });
}

/* ── Tests ────────────────────────────────────────────────── */

describe('ExecutionTracer', () => {
  it('records a complete turn lifecycle', () => {
    const bus = new EventBus();
    const tracer = new ExecutionTracer();
    tracer.attach(bus);

    emitTurnEvents(bus, 'turn-1');

    const trace = tracer.getTrace('turn-1');
    expect(trace).toBeDefined();
    expect(trace!.turnId).toBe('turn-1');
    expect(trace!.startedAt).toBeDefined();
    expect(trace!.finishedAt).toBeDefined();
  });

  it('records agent timeline with start/end times and status', () => {
    const bus = new EventBus();
    const tracer = new ExecutionTracer();
    tracer.attach(bus);

    emitTurnEvents(bus, 'turn-2');

    const trace = tracer.getTrace('turn-2')!;
    expect(trace.agentTimeline).toHaveLength(1);
    expect(trace.agentTimeline[0]!.agentId).toBe('formula-agent');
    expect(trace.agentTimeline[0]!.status).toBe('ok');
    expect(trace.agentTimeline[0]!.endedAt).toBeDefined();
  });

  it('records permission decisions', () => {
    const bus = new EventBus();
    const tracer = new ExecutionTracer();
    tracer.attach(bus);

    emitTurnEvents(bus, 'turn-3');

    const trace = tracer.getTrace('turn-3')!;
    expect(trace.permissionDecisions).toHaveLength(1);
    expect(trace.permissionDecisions[0]!.commandId).toBe('cmd-1');
    expect(trace.permissionDecisions[0]!.decision).toBe('allow');
  });

  it('records command execution', () => {
    const bus = new EventBus();
    const tracer = new ExecutionTracer();
    tracer.attach(bus);

    emitTurnEvents(bus, 'turn-4');

    const trace = tracer.getTrace('turn-4')!;
    expect(trace.commandsExecuted).toHaveLength(1);
    expect(trace.commandsExecuted[0]!.type).toBe('SetFormula');
  });

  it('calculates latency', () => {
    const bus = new EventBus();
    const tracer = new ExecutionTracer();
    tracer.attach(bus);

    emitTurnEvents(bus, 'turn-5');

    const trace = tracer.getTrace('turn-5')!;
    expect(trace.latencyMs).toBeDefined();
    expect(trace.latencyMs!).toBeGreaterThan(0);
  });

  it('returns undefined for unknown turn', () => {
    const tracer = new ExecutionTracer();
    expect(tracer.getTrace('nonexistent')).toBeUndefined();
  });
});
