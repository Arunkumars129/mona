/**
 * Spreadsheet Tool Implementations
 *
 * All tools go through the WorkbookService (never Univer directly).
 * Each tool has typed parameters, permissions, and a description
 * that the LLM uses to understand when and how to call it.
 */

import type { ToolDefinition, ToolContext, RangeRef, CommandSource } from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";

// ── Helper: Parse range string "A1:D10" → RangeRef ──────────────────

function parseRange(rangeStr: string, sheetId: string): RangeRef {
  const match = rangeStr.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i);
  if (!match) {
    // Try single cell: "A1"
    const cellMatch = rangeStr.match(/^([A-Z]+)(\d+)$/i);
    if (cellMatch) {
      const col = columnLetterToIndex(cellMatch[1]!);
      const row = parseInt(cellMatch[2]!, 10) - 1;
      return { sheetId, startRow: row, startCol: col, endRow: row, endCol: col };
    }
    throw new Error(`Invalid range format: ${rangeStr}. Use "A1:D10" or "A1".`);
  }

  return {
    sheetId,
    startRow: parseInt(match[2]!, 10) - 1,
    startCol: columnLetterToIndex(match[1]!),
    endRow: parseInt(match[4]!, 10) - 1,
    endCol: columnLetterToIndex(match[3]!),
  };
}

function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1;
}

function makeSource(ctx: ToolContext): CommandSource {
  return {
    origin: "ai",
    sessionId: ctx.sessionId,
    userId: ctx.userId,
  };
}

// ── Tool Factory ─────────────────────────────────────────────────────

export function createSpreadsheetTools(workbookService: WorkbookService): ToolDefinition[] {
  return [
    // ── Read Cells ─────────────────────────────────────────────────
    {
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
      async execute(params: { sheetId: string; range: string }, ctx: ToolContext) {
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
    },

    // ── Write Cells ────────────────────────────────────────────────
    {
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
    },

    // ── Run Formula ────────────────────────────────────────────────
    {
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
    },

    // ── Get Sheet List ─────────────────────────────────────────────
    {
      name: "get_sheet_list",
      description: "Get a list of all sheets in the workbook with their IDs, names, row counts, and column counts.",
      parameters: {
        type: "object",
        properties: {},
      },
      permissions: ["sheets:read"],
      async execute(_params: Record<string, never>, _ctx: ToolContext) {
        const sheets = await workbookService.getSheetList();
        return { sheets };
      },
    },

    // ── Get Workbook Info ──────────────────────────────────────────
    {
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
    },

    // ── Create Sheet ───────────────────────────────────────────────
    {
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
    },

    // ── Insert Rows ────────────────────────────────────────────────
    {
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
    },

    // ── Delete Rows ────────────────────────────────────────────────
    {
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
    },

    // ── Sort Range ─────────────────────────────────────────────────
    {
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
    },

    // ── Create Chart ───────────────────────────────────────────────
    {
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
    },
  ];
}
