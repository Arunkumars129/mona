import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { makeSource } from "./utils";

export function createDeleteRowsTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "delete_rows",
    description: "Delete rows from a sheet at the specified position.",
    parameters: {
      type: "object",
      properties: {
        sheetId: { type: "string", description: "The ID of the sheet." },
        startRow: { type: "number", description: "The first row to delete (1-indexed)." },
        count: { type: "number", description: "The number of rows to delete." },
      },
      required: ["sheetId", "startRow", "count"],
    },
    permissions: ["rows:delete"],
    async execute(params: { sheetId: string; startRow: number; count: number }, ctx: ToolContext) {
      await workbookService.deleteRows(params.sheetId, params.startRow - 1, params.count, makeSource(ctx));
      return { success: true, startRow: params.startRow, count: params.count };
    },
  };
}
