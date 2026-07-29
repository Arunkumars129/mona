import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { parseRange, makeSource } from "./utils";

export function createRunFormulaTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "run_formula",
    description: "Set a formula on a specific cell. The formula should start with '=' (e.g., '=SUM(A1:A10)', '=VLOOKUP(B2,D:E,2,FALSE)').",
    parameters: {
      type: "object",
      properties: {
        sheetId: { type: "string", description: "The ID of the sheet." },
        cell: { type: "string", description: 'The cell to set the formula on, in A1 notation (e.g., "A1", "C5").' },
        formula: { type: "string", description: "The formula to set. Must start with '='." },
      },
      required: ["sheetId", "cell", "formula"],
    },
    permissions: ["formulas:write"],
    async execute(params: { sheetId: string; cell: string; formula: string }, ctx: ToolContext) {
      const rangeRef = parseRange(params.cell, params.sheetId);
      await workbookService.setFormula(
        params.sheetId,
        { sheetId: params.sheetId, row: rangeRef.startRow, col: rangeRef.startCol },
        params.formula,
        makeSource(ctx)
      );
      return { success: true, cell: params.cell, formula: params.formula };
    },
  };
}
