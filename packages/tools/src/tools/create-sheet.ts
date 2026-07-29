import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { makeSource } from "./utils";

export function createCreateSheetTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "create_sheet",
    description: "Create a new sheet in the workbook with the specified name.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name for the new sheet." },
      },
      required: ["name"],
    },
    permissions: ["sheets:write"],
    async execute(params: { name: string }, ctx: ToolContext) {
      const sheetId = await workbookService.createSheet(params.name, makeSource(ctx));
      return { success: true, sheetId, name: params.name };
    },
  };
}
