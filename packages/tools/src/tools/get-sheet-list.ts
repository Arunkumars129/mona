import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";

export function createGetSheetListTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "get_sheet_list",
    description: "Get a list of all sheets in the workbook with their IDs, names, row counts, and column counts.",
    parameters: {
      type: "object",
      properties: {},
    },
    permissions: ["sheets:read"],
    async execute(_params: Record<string, never>, _ctx: ToolContext) {
      const sheets = await workbookService.getSheetList();
      return { sheets };
    },
  };
}
