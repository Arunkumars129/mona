import type { CommandType } from '@repo/commands';
import type { EventBus, MonaEvent } from '@repo/events';
import type { RiskLevel } from '@repo/shared';

export interface ExecutionTrace {
  turnId: string;
  startedAt: string;
  finishedAt?: string;
  latencyMs?: number;
  tokensUsed: { input: number; output: number };
  agentTimeline: {
    agentId: string;
    taskId: string;
    startedAt: string;
    endedAt?: string;
    status: string;
  }[];
  commandsExecuted: { commandId: string; type: CommandType; riskLevel: RiskLevel }[];
  permissionDecisions: { commandId: string; decision: string; reason: string }[];
  errors: { taskId: string; message: string; retried: boolean }[];
  memoryUsageBytes: number;
}

export class ExecutionTracer {
  private traces = new Map<string, ExecutionTrace>();

  attach(bus: EventBus): void {
    bus.subscribe('*', (event) => this.handle(event));
  }

  private handle(event: MonaEvent): void {
    const turnId = event.correlationId;
    let trace = this.traces.get(turnId);
    if (!trace && event.type === 'TurnStarted') {
      trace = {
        turnId: event.turnId,
        startedAt: event.at,
        tokensUsed: { input: 0, output: 0 },
        agentTimeline: [],
        commandsExecuted: [],
        permissionDecisions: [],
        errors: [],
        memoryUsageBytes: 0,
      };
      this.traces.set(turnId, trace);
    }
    if (!trace) return;

    switch (event.type) {
      case 'AgentStarted':
        trace.agentTimeline.push({
          agentId: event.agentId,
          taskId: event.taskId,
          startedAt: event.at,
          status: 'running',
        });
        break;
      case 'AgentFinished': {
        const entry = trace.agentTimeline.find((a) => a.taskId === event.taskId);
        if (entry) {
          entry.endedAt = event.at;
          entry.status = event.status;
        }
        break;
      }
      case 'PermissionRequested':
        trace.permissionDecisions.push({
          commandId: event.commandId,
          decision: event.decision,
          reason: event.reason,
        });
        break;
      case 'CommandExecuted':
        trace.commandsExecuted.push({
          commandId: event.commandId,
          type: event.commandType,
          riskLevel: 'safe',
        });
        break;
      case 'TurnFinished':
        trace.finishedAt = event.at;
        trace.latencyMs = new Date(event.at).getTime() - new Date(trace.startedAt).getTime();
        break;
    }
  }

  getTrace(turnId: string): ExecutionTrace | undefined {
    return this.traces.get(turnId);
  }
}
