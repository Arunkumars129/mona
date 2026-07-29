import type { AgentId, AgentDefinition } from "@mona/schema";

export abstract class BaseAgent implements AgentDefinition {
  abstract readonly id: AgentId;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly systemPrompt: string;
  abstract readonly tools: string[];
  readonly model?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly maxIterations?: number;
}
