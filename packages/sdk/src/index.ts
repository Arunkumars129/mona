import type { Agent } from '@repo/agents';
import type { CommandHandler } from '@repo/commands';
import type { MonaEvent } from '@repo/events';
import type { PermissionPolicy } from '@repo/permissions';
import type { ToolDefinition } from '@repo/tools';

export interface MonaPlugin {
  id: string;
  version?: string;
  registerAgents?(): Agent[];
  registerCommands?(): CommandHandler[];
  registerPolicies?(): PermissionPolicy[];
  registerTools?(): ToolDefinition[];
  onEvent?(event: MonaEvent): void | Promise<void>;
}

export class PluginRegistry {
  private plugins = new Map<string, MonaPlugin>();

  register(plugin: MonaPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  getAgents(): Agent[] {
    return [...this.plugins.values()].flatMap((p) => p.registerAgents?.() ?? []);
  }

  getCommands(): CommandHandler[] {
    return [...this.plugins.values()].flatMap((p) => p.registerCommands?.() ?? []);
  }

  getPolicies(): PermissionPolicy[] {
    return [...this.plugins.values()].flatMap((p) => p.registerPolicies?.() ?? []);
  }

  getTools(): ToolDefinition[] {
    return [...this.plugins.values()].flatMap((p) => p.registerTools?.() ?? []);
  }

  attachEventBus(handlers: { onEvent: (e: MonaEvent) => void }): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.onEvent) {
        handlers.onEvent = (e) => void plugin.onEvent!(e);
      }
    }
  }
}

/** MCP agent wrapper contract — adapts MCP tool calls to Commands */
export interface MCPAgentConfig {
  serverUrl: string;
  serverId: string;
  capabilities: import('@repo/shared').Capability[];
  credentialsRef: string;
}

export type { Agent, CommandHandler, PermissionPolicy, ToolDefinition, MonaEvent };
