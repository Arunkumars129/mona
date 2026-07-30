import type { BaseCommand, CommandContext, CommandHandler, CommandResult } from './types.js';

export class CommandExecutor {
  private handlers = new Map<string, CommandHandler>();

  register(handler: CommandHandler): void {
    this.handlers.set(handler.type, handler);
  }

  registerAll(handlers: CommandHandler[]): void {
    for (const h of handlers) this.register(h);
  }

  async dispatch(cmd: BaseCommand, ctx: CommandContext): Promise<CommandResult> {
    const handler = this.handlers.get(cmd.type);
    if (!handler) {
      return {
        commandId: cmd.id,
        status: 'rejected',
        verification: {
          formulaValid: false,
          brokenReferences: [],
          circularDependencies: [],
          rangeExists: false,
          permissionCompliant: false,
        },
        error: { code: 'UNKNOWN_COMMAND', message: `No handler for ${cmd.type}` },
      };
    }
    return handler.apply(cmd, ctx);
  }

  async dispatchBatch(
    cmds: BaseCommand[],
    ctx: CommandContext
  ): Promise<CommandResult[]> {
    const results: CommandResult[] = [];
    for (const cmd of cmds) {
      const result = await this.dispatch(cmd, ctx);
      results.push(result);
      if (result.status === 'failed') break;
    }
    return results;
  }
}
