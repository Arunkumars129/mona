import type { AgentId } from "@mona/schema";
import { BaseAgent } from "../base";
import { CLEANING_SYSTEM_PROMPT } from "./prompts";

export class CleaningAgent extends BaseAgent {
  readonly id: AgentId = "cleaning";
  readonly name = "Mona Data Cleaning Specialist";
  readonly description = "Handles row/column insertions, deletions, sorting, and data structural updates.";
  readonly systemPrompt = CLEANING_SYSTEM_PROMPT;
  readonly tools = ["read_cells", "write_cells", "insert_rows", "delete_rows", "sort_range", "get_sheet_list"];
}
