import type { Agent } from '@repo/agents';
import {
  CommandExecutor,
  setCellValueHandler,
  setFormulaHandler,
  type BaseCommand,
  type CommandResult,
} from '@repo/commands';
import type { ContextManager } from '@repo/context';
import { EventBus } from '@repo/events';
import type { MemoryStore } from '@repo/memory';
import { ExecutionTracer, type ExecutionTrace } from '@repo/observability';
import { corePolicies, PermissionEngine } from '@repo/permissions';
import type { PlannerAgent, ExecutionPlan } from '@repo/planner';
import { AgentRouter } from '@repo/router';
import type { UniverAdapter } from '@repo/spreadsheet';
import type { PolicyContext } from '@repo/shared';
import { CommitStore } from '@repo/versioning';

export interface TurnInput {
  turnId: string;
  sessionId: string;
  workbookId: string;
  userId: string;
  message: string;
  tokenBudget?: number;
}

export interface TurnResult {
  turnId: string;
  status: 'ok' | 'pending_approval' | 'error' | 'cancelled';
  plan?: ExecutionPlan;
  commandResults?: CommandResult[];
  pendingCommands?: BaseCommand[];
  trace?: ExecutionTrace;
  commitId?: string;
  error?: string;
}

export interface SessionState {
  turnId: string;
  plan?: ExecutionPlan;
  completedTaskIds: string[];
  pendingApproval?: BaseCommand[];
}

export interface MonaRuntimeDeps {
  planner: PlannerAgent;
  contextManager: ContextManager;
  spreadsheet: UniverAdapter;
  memory: MemoryStore;
  policyContext: PolicyContext;
  agents: Agent[];
}

/** Central orchestrator: Planner → Router → Permission → Command → Verify → Version */
export class MonaRuntime {
  readonly bus = new EventBus();
  readonly tracer = new ExecutionTracer();
  readonly router: AgentRouter;
  readonly executor: CommandExecutor;
  readonly commits = new CommitStore();

  private sessions = new Map<string, SessionState>();
  private permissionEngine: PermissionEngine;

  constructor(private deps: MonaRuntimeDeps) {
    this.router = new AgentRouter(new Map(), this.bus);
    for (const agent of deps.agents) this.router.register(agent);

    this.executor = new CommandExecutor();
    this.executor.registerAll([setFormulaHandler, setCellValueHandler]);

    this.permissionEngine = new PermissionEngine(corePolicies, deps.policyContext);
    this.tracer.attach(this.bus);
  }

  async executeTurn(input: TurnInput): Promise<TurnResult> {
    const { turnId, sessionId, workbookId, userId, message } = input;
    const tokenBudget = input.tokenBudget ?? 8000;

    this.bus.emit({
      type: 'TurnStarted',
      turnId,
      userId,
      workbookId,
      correlationId: turnId,
      at: new Date().toISOString(),
    });

    try {
      const context = await this.deps.contextManager.build(
        sessionId,
        workbookId,
        message,
        tokenBudget
      );

      const plan = await this.deps.planner.plan(message, context);
      this.sessions.set(sessionId, { turnId, plan, completedTaskIds: [] });

      const proposedCommands = await this.router.executePlan(plan, context);
      const { applied, pending, results } = await this.executeWithPermissions(
        proposedCommands,
        turnId
      );

      if (pending.length > 0) {
        this.sessions.get(sessionId)!.pendingApproval = pending;
        return {
          turnId,
          status: 'pending_approval',
          plan,
          pendingCommands: pending,
          commandResults: results,
          trace: this.tracer.getTrace(turnId),
        };
      }

      const commit = await this.commits.commit(
        applied.map((r) => r.commandId),
        `Agent turn: ${message.slice(0, 80)}`,
        { kind: 'agent', id: 'runtime' }
      );

      this.bus.emit({
        type: 'TurnFinished',
        turnId,
        status: 'ok',
        correlationId: turnId,
        at: new Date().toISOString(),
      });

      return {
        turnId,
        status: 'ok',
        plan,
        commandResults: results,
        commitId: commit.id,
        trace: this.tracer.getTrace(turnId),
      };
    } catch (err) {
      this.bus.emit({
        type: 'TurnFinished',
        turnId,
        status: 'error',
        correlationId: turnId,
        at: new Date().toISOString(),
      });
      return {
        turnId,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        trace: this.tracer.getTrace(turnId),
      };
    }
  }

  async approvePending(sessionId: string, approved: boolean): Promise<TurnResult> {
    const state = this.sessions.get(sessionId);
    if (!state?.pendingApproval) {
      return { turnId: state?.turnId ?? '', status: 'error', error: 'No pending approval' };
    }

    if (!approved) {
      state.pendingApproval = undefined;
      return { turnId: state.turnId, status: 'cancelled' };
    }

    const { applied, results } = await this.executeWithPermissions(
      state.pendingApproval,
      state.turnId
    );
    state.pendingApproval = undefined;

    const commit = await this.commits.commit(
      applied.map((r) => r.commandId),
      'User approved agent changes',
      { kind: 'user', id: 'user' }
    );

    return {
      turnId: state.turnId,
      status: 'ok',
      commandResults: results,
      commitId: commit.id,
      trace: this.tracer.getTrace(state.turnId),
    };
  }

  async resume(sessionId: string): Promise<TurnResult> {
    const state = this.sessions.get(sessionId);
    if (!state?.plan) {
      return { turnId: '', status: 'error', error: 'No session to resume' };
    }
    // Resume from last completed task — production loads from Postgres
    return { turnId: state.turnId, status: 'ok', plan: state.plan };
  }

  cancel(turnId: string): void {
    this.bus.emit({
      type: 'TurnFinished',
      turnId,
      status: 'cancelled',
      correlationId: turnId,
      at: new Date().toISOString(),
    });
  }

  private async executeWithPermissions(
    commands: BaseCommand[],
    correlationId: string
  ): Promise<{
    applied: CommandResult[];
    pending: BaseCommand[];
    results: CommandResult[];
  }> {
    const applied: CommandResult[] = [];
    const pending: BaseCommand[] = [];
    const results: CommandResult[] = [];

    for (const cmd of commands) {
      const decision = this.permissionEngine.evaluate(cmd);

      this.bus.emit({
        type: 'PermissionRequested',
        commandId: cmd.id,
        riskLevel: decision.riskLevel,
        decision: decision.decision,
        reason: decision.reason,
        correlationId,
        at: new Date().toISOString(),
      });

      if (decision.decision === 'pending') {
        pending.push(cmd);
        continue;
      }
      if (decision.decision === 'deny') {
        results.push({
          commandId: cmd.id,
          status: 'rejected',
          verification: {
            formulaValid: false,
            brokenReferences: [],
            circularDependencies: [],
            rangeExists: false,
            permissionCompliant: false,
          },
          error: { code: 'PERMISSION_DENIED', message: decision.reason },
        });
        continue;
      }

      const result = await this.executor.dispatch(cmd, {
        spreadsheet: this.deps.spreadsheet,
      });

      this.bus.emit({
        type: 'CommandExecuted',
        commandId: cmd.id,
        commandType: cmd.type,
        status: result.status,
        correlationId,
        at: new Date().toISOString(),
      });

      results.push(result);
      if (result.status === 'applied') applied.push(result);

      if (result.status === 'failed' && result.inverse) {
        await this.executor.dispatch(result.inverse, { spreadsheet: this.deps.spreadsheet });
      }
    }

    return { applied, pending, results };
  }
}
