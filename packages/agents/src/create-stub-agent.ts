import { createCommand, type BaseCommand } from '@repo/commands';
import type { LayeredContext } from '@repo/context';
import type { PlannedTask } from '@repo/planner';
import type { AgentId, Capability } from '@repo/shared';
import { BaseAgent } from './agent-base.js';

export interface StubAgentConfig {
  id: AgentId;
  capabilities: Capability[];
  /** Production replaces this with LLM tool-use + provider abstraction */
  proposeCommands?: (task: PlannedTask, context: LayeredContext) => BaseCommand[];
}

/**
 * Factory for deterministic agent stubs.
 * Each specialized agent shares scaffolding; only command proposal differs.
 */
export function createStubAgent(config: StubAgentConfig): BaseAgent {
  return new (class extends BaseAgent {
    readonly id = config.id;
    readonly capabilities = config.capabilities;

    async run(task: PlannedTask, context: LayeredContext) {
      const commands =
        config.proposeCommands?.(task, context) ??
        defaultNoOpCommands(task, context, this.id);

      return {
        commands,
        rationale: `[${this.id}] ${task.intent}`,
        confidence: 0.7,
      };
    }
  })();
}

function defaultNoOpCommands(
  task: PlannedTask,
  context: LayeredContext,
  agentId: AgentId
): BaseCommand[] {
  const sheetId = context.activeSheet.id;
  const cellRef = task.inputRanges[0]?.start ?? 'A1';

  return [
    createCommand({
      type: 'SetCellValue',
      payload: { cellRef, value: `Processed by ${agentId}` },
      issuedBy: { kind: 'agent', id: agentId },
      targetSheetId: sheetId,
      range: task.inputRanges[0],
      correlationId: task.id,
    }),
  ];
}
