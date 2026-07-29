import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { parseRange, makeSource } from "./utils";

export function createSortRangeTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "sort_range",
    description: "Sort a range of cells by one or more columns.",
    parameters: {
      type: "object",
      properties: {
        sheetId: { type: "string", description: "The ID of the sheet." },
        range: { type: "string", description: "The range to sort (A1 notation)." },
        column: { type: "number", description: "The column number to sort by (1-indexed)." },
        ascending: { type: "boolean", description: "Sort ascending (true) or descending (false)." },
      },
      required: ["sheetId", "range", "column", "ascending"],
    },
    permissions: ["sort:execute"],
    async execute(params: { sheetId: string; range: string; column: number; ascending: boolean }, ctx: ToolContext) {
      const rangeRef = parseRange(params.range, params.sheetId);
      await workbookService.sortRange(
        params.sheetId,
        rangeRef,
        [{ column: params.column - 1, ascending: params.ascending }],
        makeSource(ctx)
      );
      return { success: true, range: params.range };
    },
  };
}
