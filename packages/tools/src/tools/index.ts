import type { ToolDefinition } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";

import { createReadCellsTool } from "./read-cells";
import { createWriteCellsTool } from "./write-cells";
import { createRunFormulaTool } from "./run-formula";
import { createGetSheetListTool } from "./get-sheet-list";
import { createGetWorkbookInfoTool } from "./get-workbook-info";
import { createCreateSheetTool } from "./create-sheet";
import { createInsertRowsTool } from "./insert-rows";
import { createDeleteRowsTool } from "./delete-rows";
import { createSortRangeTool } from "./sort-range";
import { createCreateChartTool } from "./create-chart";

export * from "./utils";
export * from "./read-cells";
export * from "./write-cells";
export * from "./run-formula";
export * from "./get-sheet-list";
export * from "./get-workbook-info";
export * from "./create-sheet";
export * from "./insert-rows";
export * from "./delete-rows";
export * from "./sort-range";
export * from "./create-chart";

export function createSpreadsheetTools(workbookService: WorkbookService): ToolDefinition[] {
  return [
    createReadCellsTool(workbookService),
    createWriteCellsTool(workbookService),
    createRunFormulaTool(workbookService),
    createGetSheetListTool(workbookService),
    createGetWorkbookInfoTool(workbookService),
    createCreateSheetTool(workbookService),
    createInsertRowsTool(workbookService),
    createDeleteRowsTool(workbookService),
    createSortRangeTool(workbookService),
    createCreateChartTool(workbookService),
  ];
}
