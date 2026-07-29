/**
 * Workbook Service
 *
 * The abstraction layer between the AI runtime and the spreadsheet engine.
 * Tools never talk to Univer directly — they call WorkbookService methods,
 * which go through the Command Bus for undo integration.
 */

import type {
  CellRef,
  CellValue,
  RangeRef,
  SheetInfo,
  WorkbookInfo,
  NamedRange,
  ChartConfig,
  ChartRef,
  CommandSource,
  SortSpec,
  FilterSpec,
} from "@mona/schema";

// ── WorkbookService Interface ────────────────────────────────────────

/**
 * All spreadsheet operations go through this service.
 * It wraps the Command Bus so every mutation is undo-friendly
 * and emits domain events for history tracking.
 */
export interface WorkbookService {
  // ── Read Operations (bypass Command Bus — no state change) ───────

  /** Get workbook metadata. */
  getWorkbookInfo(): Promise<WorkbookInfo>;

  /** Get information about a specific sheet. */
  getSheetInfo(sheetId: string): Promise<SheetInfo>;

  /** Get all sheet metadata. */
  getSheetList(): Promise<SheetInfo[]>;

  /** Read cell values from a range. */
  getCellValues(sheetId: string, range: RangeRef): Promise<CellValue[][]>;

  /** Read a single cell value. */
  getCellValue(sheetId: string, cell: CellRef): Promise<CellValue>;

  /** Get formula dependencies for a cell. */
  getFormulaDependencies(sheetId: string, cell: CellRef): Promise<CellRef[]>;

  /** Get named ranges. */
  getNamedRanges(): Promise<NamedRange[]>;

  /** Get the active sheet ID. */
  getActiveSheetId(): Promise<string>;

  /** Get the current selection. */
  getSelection(): Promise<RangeRef | null>;

  // ── Write Operations (go through Command Bus) ────────────────────

  /** Write values to a range. Returns the undo ID. */
  setCellValues(sheetId: string, range: RangeRef, values: unknown[][], source: CommandSource): Promise<string>;

  /** Set a formula on a cell. */
  setFormula(sheetId: string, cell: CellRef, formula: string, source: CommandSource): Promise<string>;

  /** Insert rows. */
  insertRows(sheetId: string, startRow: number, count: number, source: CommandSource): Promise<string>;

  /** Delete rows. */
  deleteRows(sheetId: string, startRow: number, count: number, source: CommandSource): Promise<string>;

  /** Insert columns. */
  insertColumns(sheetId: string, startCol: number, count: number, source: CommandSource): Promise<string>;

  /** Delete columns. */
  deleteColumns(sheetId: string, startCol: number, count: number, source: CommandSource): Promise<string>;

  /** Create a new sheet. */
  createSheet(name: string, source: CommandSource): Promise<string>;

  /** Delete a sheet. */
  deleteSheet(sheetId: string, source: CommandSource): Promise<void>;

  /** Rename a sheet. */
  renameSheet(sheetId: string, newName: string, source: CommandSource): Promise<void>;

  /** Create a chart. */
  createChart(sheetId: string, config: ChartConfig, source: CommandSource): Promise<ChartRef>;

  /** Sort a range. */
  sortRange(sheetId: string, range: RangeRef, specs: SortSpec[], source: CommandSource): Promise<void>;

  /** Filter a range. */
  filterRange(sheetId: string, range: RangeRef, specs: FilterSpec[], source: CommandSource): Promise<void>;

  /** Undo the last operation. */
  undo(source: CommandSource): Promise<void>;

  /** Redo the last undone operation. */
  redo(source: CommandSource): Promise<void>;
}
