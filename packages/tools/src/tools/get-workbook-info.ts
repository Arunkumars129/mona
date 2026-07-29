import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";

export function createGetWorkbookInfoTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "get_workbook_info",
    description: "Get workbook metadata including name, locale, and all sheet names.",
    parameters: {
      type: "object",
      properties: {},
    },
    permissions: ["cells:read"],
    async execute(_params: Record<string, never>, _ctx: ToolContext) {
      return await workbookService.getWorkbookInfo();
    },
  };
}
