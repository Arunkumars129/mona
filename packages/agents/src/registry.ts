import type { Agent } from './agent-base.js';
import { createStubAgent } from './create-stub-agent.js';
import { FormulaAgent } from './formula-agent/index.js';
import { MCPAgent } from './mcp-agent/index.js';

/** All built-in specialized agents — swappable via the same Agent interface */
export function createDefaultAgentRegistry(): Map<string, Agent> {
  const agents: Agent[] = [
    new FormulaAgent(),
    createStubAgent({ id: 'chart-agent', capabilities: ['chart'] }),
    createStubAgent({ id: 'formatting-agent', capabilities: ['formatting'] }),
    createStubAgent({ id: 'data-cleaning-agent', capabilities: ['cleaning'] }),
    createStubAgent({ id: 'sql-agent', capabilities: ['sql'] }),
    createStubAgent({ id: 'python-agent', capabilities: ['python'] }),
    createStubAgent({ id: 'visualization-agent', capabilities: ['visualization'] }),
    createStubAgent({ id: 'pivot-agent', capabilities: ['pivot'] }),
    createStubAgent({ id: 'import-agent', capabilities: ['import'] }),
    createStubAgent({ id: 'export-agent', capabilities: ['export'] }),
    createStubAgent({ id: 'version-agent', capabilities: ['version'] }),
    createStubAgent({ id: 'automation-agent', capabilities: ['automation'] }),
    createStubAgent({ id: 'review-agent', capabilities: ['review'] }),
    createStubAgent({ id: 'audit-agent', capabilities: ['audit'] }),
    createStubAgent({ id: 'comment-agent', capabilities: ['comment'] }),
    createStubAgent({ id: 'ai-assistant-agent', capabilities: ['assistant'] }),
    new MCPAgent(),
  ];

  return new Map(agents.map((a) => [a.id, a]));
}

export class AgentRegistry {
  private registry = new Map<string, Agent>();

  constructor(agents?: Agent[]) {
    for (const agent of agents ?? createDefaultAgentRegistry().values()) {
      this.register(agent);
    }
  }

  register(agent: Agent): void {
    this.registry.set(agent.id, agent);
  }

  get(id: string): Agent | undefined {
    return this.registry.get(id);
  }

  getByCapability(cap: import('@repo/shared').Capability): Agent[] {
    return [...this.registry.values()].filter((a) => a.capabilities.includes(cap));
  }

  all(): Agent[] {
    return [...this.registry.values()];
  }
}
