/**
 * Tool Registry
 *
 * Central registry for all spreadsheet tools.
 * Tools register themselves here; the runtime queries the registry
 * to provide tool definitions to LLM calls.
 */

import type { ToolDefinition, ToolFunctionDef, AgentId } from "@mona/schema";

// ── Tool-to-Agent Mapping ────────────────────────────────────────────

const AGENT_TOOL_MAP: Record<AgentId, string[]> = {
  planner: ["read_cells", "get_sheet_list", "get_workbook_info"],
  formula: ["read_cells", "write_cells", "run_formula", "validate_formula", "get_sheet_list"],
  cleaning: ["read_cells", "write_cells", "insert_rows", "delete_rows", "sort_range", "get_sheet_list"],
  chart: ["read_cells", "create_chart", "get_sheet_list"],
  dashboard: ["read_cells", "create_chart", "create_sheet", "get_sheet_list"],
  insight: ["read_cells", "get_sheet_list", "get_workbook_info"],
  sql: ["read_cells", "write_cells", "get_sheet_list"],
  python: ["read_cells", "write_cells", "get_sheet_list"],
  automation: ["read_cells", "write_cells", "create_sheet", "get_sheet_list"],
  "import-export": ["read_cells", "write_cells", "create_sheet", "get_sheet_list"],
  review: ["read_cells", "get_sheet_list", "get_workbook_info"],
};

// ── Tool Registry ────────────────────────────────────────────────────

export class ToolRegistry {
  private readonly tools: Map<string, ToolDefinition> = new Map();

  /** Register a tool. */
  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /** Get a tool by name. */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /** Get all registered tools. */
  getAll(): ToolDefinition[] {
    return [...this.tools.values()];
  }

  /** Get tools available to a specific agent. */
  getForAgent(agentId: AgentId): ToolDefinition[] {
    const allowedTools = AGENT_TOOL_MAP[agentId] ?? [];
    return allowedTools
      .map((name) => this.tools.get(name))
      .filter((t): t is ToolDefinition => t !== undefined);
  }

  /**
   * Convert tools to the LLM function definition format.
   * This is what gets passed in the `tools` parameter of LLM requests.
   */
  toLLMFormat(tools: ToolDefinition[]): ToolFunctionDef[] {
    return tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  }
}
