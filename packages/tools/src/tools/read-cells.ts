import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { parseRange } from "./utils";

export function createReadCellsTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "read_cells",
    description: "Read cell values from a specified range in a sheet. Returns the values, types, and any formulas. Use this to understand the data before making changes.",
    parameters: {
      type: "object",
      properties: {
        sheetId: { type: "string", description: "The ID of the sheet to read from. Use get_sheet_list to find sheet IDs." },
        range: { type: "string", description: 'The range to read, in A1 notation (e.g., "A1:D10", "B2", "A1:Z100").' },
      },
      required: ["sheetId", "range"],
    },
    permissions: ["cells:read"],
    async execute(params: { sheetId: string; range: string }, _ctx: ToolContext) {
      const rangeRef = parseRange(params.range, params.sheetId);
      const values = await workbookService.getCellValues(params.sheetId, rangeRef);
      return {
        range: params.range,
        sheetId: params.sheetId,
        rowCount: values.length,
        colCount: values[0]?.length ?? 0,
        values: values.map((row) =>
          row.map((cell) => ({
            value: cell.formatted,
            type: cell.type,
            formula: cell.formula ?? null,
          }))
        ),
      };
    },
  };
}
