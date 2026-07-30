import { createCommand } from '@repo/commands';
import type { LayeredContext } from '@repo/context';
import type { PlannedTask } from '@repo/planner';
import { BaseAgent } from '../agent-base.js';

/** Deterministic stub — production wires Claude/OpenAI tool-use */
export class FormulaAgent extends BaseAgent {
  readonly id = 'formula-agent';
  readonly capabilities: import('@repo/shared').Capability[] = ['formula'];

  async run(task: PlannedTask, context: LayeredContext) {
    const sheetId = context.activeSheet.id;
    const range = task.inputRanges[0];
    const cellRef = range?.start ?? 'A1';

    const commands = [
      createCommand({
        type: 'SetFormula',
        payload: { cellRef, formula: '=SUM(A:A)', overwritesExisting: false },
        issuedBy: { kind: 'agent', id: this.id },
        targetSheetId: sheetId,
        correlationId: task.id,
      }),
    ];

    return {
      commands,
      rationale: `Applied formula for: ${task.intent}`,
      confidence: 0.85,
    };
  }
}
