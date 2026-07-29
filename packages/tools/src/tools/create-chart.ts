import type { ToolDefinition, ToolContext } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";
import { parseRange, makeSource } from "./utils";

export function createCreateChartTool(workbookService: WorkbookService): ToolDefinition {
  return {
    name: "create_chart",
    description: "Create a chart from a range of data. Supports bar, line, pie, scatter, area, column, donut, and histogram chart types.",
    parameters: {
      type: "object",
      properties: {
        sheetId: { type: "string", description: "The ID of the sheet." },
        range: { type: "string", description: "The data range for the chart (A1 notation)." },
        type: { type: "string", description: "Chart type.", enum: ["bar", "line", "pie", "scatter", "area", "column", "donut", "histogram"] },
        title: { type: "string", description: "Chart title." },
      },
      required: ["sheetId", "range", "type"],
    },
    permissions: ["charts:write"],
    async execute(params: { sheetId: string; range: string; type: string; title?: string }, ctx: ToolContext) {
      const rangeRef = parseRange(params.range, params.sheetId);
      const chart = await workbookService.createChart(
        params.sheetId,
        {
          type: params.type as any,
          title: params.title,
          dataRange: rangeRef,
        },
        makeSource(ctx)
      );
      return { success: true, chartId: chart.id };
    },
  };
}
