import type { AgentId } from "@mona/schema";
import { BaseAgent } from "../base";
import { CHART_SYSTEM_PROMPT } from "./prompts";

export class ChartAgent extends BaseAgent {
  readonly id: AgentId = "chart";
  readonly name = "Mona Chart Specialist";
  readonly description = "Generates and configures spreadsheet charts and visual representations.";
  readonly systemPrompt = CHART_SYSTEM_PROMPT;
  readonly tools = ["read_cells", "create_chart", "get_sheet_list"];
}
