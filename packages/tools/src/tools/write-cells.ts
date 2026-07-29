import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { parseRange, makeSource } from "./utils";

export function createWriteCellsTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "write_cells",
    description: "Write values to a range of cells. Each row is an array of values. The range must match the dimensions of the values array.",
    parameters: {
      type: "object",
      properties: {
        sheetId: { type: "string", description: "The ID of the sheet to write to." },
        range: { type: "string", description: 'The range to write to, in A1 notation (e.g., "A1:D10").' },
        values: { type: "array", description: "2D array of values to write. Each inner array is a row.", items: { type: "array", items: { type: "string" } } },
      },
      required: ["sheetId", "range", "values"],
    },
    permissions: ["cells:write"],
    async execute(params: { sheetId: string; range: string; values: unknown[][] }, ctx: ToolContext) {
      const rangeRef = parseRange(params.range, params.sheetId);
      await workbookService.setCellValues(params.sheetId, rangeRef, params.values, makeSource(ctx));
      return {
        success: true,
        range: params.range,
        cellsWritten: params.values.reduce((sum, row) => sum + row.length, 0),
      };
    },
  };
}
