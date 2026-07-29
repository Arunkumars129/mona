import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { makeSource } from "./utils";

export function createInsertRowsTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "insert_rows",
    description: "Insert new empty rows into a sheet at the specified position.",
    parameters: {
      type: "object",
      properties: {
        sheetId: { type: "string", description: "The ID of the sheet." },
        startRow: { type: "number", description: "The row number to insert before (1-indexed)." },
        count: { type: "number", description: "The number of rows to insert." },
      },
      required: ["sheetId", "startRow", "count"],
    },
    permissions: ["rows:insert"],
    async execute(params: { sheetId: string; startRow: number; count: number }, ctx: ToolContext) {
      await workbookService.insertRows(params.sheetId, params.startRow - 1, params.count, makeSource(ctx));
      return { success: true, startRow: params.startRow, count: params.count };
    },
  };
}
