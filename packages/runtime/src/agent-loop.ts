import type { Agent } from '@repo/agents';
import type { BaseCommand, CommandExecutor, CommandResult } from '@repo/commands';
import type { LayeredContext } from '@repo/context';
import type { EventBus } from '@repo/events';
import type { PermissionEngine } from '@repo/permissions';
import type { PlannedTask } from '@repo/planner';
import type { UniverAdapter } from '@repo/spreadsheet';

export interface AgentLoopDeps {
  executor: CommandExecutor;
  permissionEngine: PermissionEngine;
  spreadsheet: UniverAdapter;
  bus: EventBus;
}

export interface TaskLoopResult {
  taskId: string;
  status: 'ok' | 'failed' | 'pending_approval';
  commandResults: CommandResult[];
  proposedCommands: BaseCommand[];
  retries: number;
}

/**
 * Agent loop: Agent → Tool → Verify → Retry
 * Deterministic verification uses Univer, never the LLM.
 */
export class AgentLoop {
  constructor(private deps: AgentLoopDeps) {}

  async runTask(
    agent: Agent,
    task: PlannedTask,
    context: LayeredContext,
    correlationId: string
  ): Promise<TaskLoopResult> {
    let retries = 0;
    const maxRetries = agent.maxRetries;
    let lastResults: CommandResult[] = [];
    let proposed: BaseCommand[] = [];

    while (retries <= maxRetries) {
      const result = await agent.run(task, context);
      proposed = result.commands;

      const { results, pending, allPassed } = await this.executeAndVerify(
        proposed,
        correlationId
      );
      lastResults = results;

      if (pending.length > 0) {
        return {
          taskId: task.id,
          status: 'pending_approval',
          commandResults: results,
          proposedCommands: pending,
          retries,
        };
      }

      if (allPassed) {
        return {
          taskId: task.id,
          status: 'ok',
          commandResults: results,
          proposedCommands: proposed,
          retries,
        };
      }

      retries++;
      if (retries > maxRetries) break;

      // Append verification failure to context for agent retry (production enriches context)
      this.deps.bus.emit({
        type: 'AgentStarted',
        agentId: agent.id,
        taskId: task.id,
        correlationId,
        at: new Date().toISOString(),
      });
    }

    return {
      taskId: task.id,
      status: 'failed',
      commandResults: lastResults,
      proposedCommands: proposed,
      retries,
    };
  }

  private async executeAndVerify(
    commands: BaseCommand[],
    correlationId: string
  ): Promise<{
    results: CommandResult[];
    pending: BaseCommand[];
    allPassed: boolean;
  }> {
    const results: CommandResult[] = [];
    const pending: BaseCommand[] = [];
    let allPassed = true;

    for (const cmd of commands) {
      const decision = this.deps.permissionEngine.evaluate(cmd);

      this.deps.bus.emit({
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
        allPassed = false;
        continue;
      }

      if (decision.decision === 'deny') {
        results.push({
          commandId: cmd.id,
          status: 'rejected',
          verification: emptyVerification(false),
          error: { code: 'PERMISSION_DENIED', message: decision.reason },
        });
        allPassed = false;
        continue;
      }

      const result = await this.deps.executor.dispatch(cmd, {
        spreadsheet: this.deps.spreadsheet,
      });

      this.deps.bus.emit({
        type: 'CommandExecuted',
        commandId: cmd.id,
        commandType: cmd.type,
        status: result.status,
        correlationId,
        at: new Date().toISOString(),
      });

      results.push(result);

      if (result.status !== 'applied') {
        allPassed = false;
        if (result.inverse) {
          await this.deps.executor.dispatch(result.inverse, {
            spreadsheet: this.deps.spreadsheet,
          });
        }
        break;
      }
    }

    return { results, pending, allPassed: allPassed && pending.length === 0 };
  }
}

function emptyVerification(compliant: boolean) {
  return {
    formulaValid: false,
    brokenReferences: [] as string[],
    circularDependencies: [] as string[],
    rangeExists: false,
    permissionCompliant: compliant,
  };
}
