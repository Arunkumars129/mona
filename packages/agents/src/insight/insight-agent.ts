import type { AgentId } from "@mona/schema";
import { BaseAgent } from "../base";
import { INSIGHT_SYSTEM_PROMPT } from "./prompts";

export class InsightAgent extends BaseAgent {
  readonly id: AgentId = "insight";
  readonly name = "Mona Data Insight Specialist";
  readonly description = "Analyzes spreadsheet data, metrics, and trends to deliver narrative insights.";
  readonly systemPrompt = INSIGHT_SYSTEM_PROMPT;
  readonly tools = ["read_cells", "get_sheet_list", "get_workbook_info"];
}
