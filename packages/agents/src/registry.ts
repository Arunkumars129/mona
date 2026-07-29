import type { AgentId, AgentDefinition } from "@mona/schema";
import { PlannerAgent } from "./planner/planner-agent";
import { FormulaAgent } from "./formula/formula-agent";
import { CleaningAgent } from "./cleaning/cleaning-agent";
import { ChartAgent } from "./chart/chart-agent";
import { InsightAgent } from "./insight/insight-agent";

export class AgentRegistry {
  private readonly agents: Map<AgentId, AgentDefinition> = new Map();

  constructor() {
    // Register standard default agents
    this.register(new PlannerAgent());
    this.register(new FormulaAgent());
    this.register(new CleaningAgent());
    this.register(new ChartAgent());
    this.register(new InsightAgent());
  }

  register(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent);
  }

  get(id: AgentId): AgentDefinition | undefined {
    return this.agents.get(id);
  }

  getAll(): AgentDefinition[] {
    return [...this.agents.values()];
  }
}
