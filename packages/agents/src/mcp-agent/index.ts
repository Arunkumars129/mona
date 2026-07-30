import { createCommand } from '@repo/commands';
import type { LayeredContext } from '@repo/context';
import type { PlannedTask } from '@repo/planner';
import { BaseAgent } from '../agent-base.js';

export interface MCPAgentConfig {
  serverUrl: string;
  serverId: string;
  credentialsRef: string;
}

/**
 * Wraps MCP server tools as Mona agents.
 * MCP tool calls are adapted to Commands — same PermissionEngine, no bypass.
 */
export class MCPAgent extends BaseAgent {
  readonly id = 'mcp-agent';
  readonly capabilities: import('@repo/shared').Capability[] = ['mcp'];
  override readonly timeoutMs = 60_000;

  constructor(private config?: MCPAgentConfig) {
    super();
  }

  async run(task: PlannedTask, context: LayeredContext) {
    // Production: connect to MCP server, invoke tools, map responses → Commands
    const sheetId = context.activeSheet.id;
    const cellRef = task.inputRanges[0]?.start ?? 'A1';

    const commands = [
      createCommand({
        type: 'SetCellValue',
        payload: {
          cellRef,
          value: `MCP result from ${this.config?.serverId ?? 'default-server'}`,
        },
        issuedBy: { kind: 'agent', id: this.id },
        targetSheetId: sheetId,
        correlationId: task.id,
      }),
    ];

    return {
      commands,
      rationale: `MCP agent executed: ${task.intent}`,
      confidence: 0.75,
    };
  }
}
