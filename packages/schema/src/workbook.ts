/**
 * Workbook Schema Types
 *
 * Core types for representing spreadsheet data structures.
 * Univer-agnostic — the runtime never depends on Univer types directly.
 */

// ── Cell Addressing ──────────────────────────────────────────────────

/** A reference to a single cell. */
export interface CellRef {
  readonly sheetId: string;
  readonly row: number;
  readonly col: number;
}

/** A reference to a rectangular range of cells. */
export interface RangeRef {
  readonly sheetId: string;
  readonly startRow: number;
  readonly startCol: number;
  readonly endRow: number;
  readonly endCol: number;
}

// ── Cell Values ──────────────────────────────────────────────────────

export type CellType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "formula"
  | "error"
  | "empty";

/** The value of a single cell, with its raw value, display string, and optional formula. */
export interface CellValue {
  readonly raw: unknown;
  readonly formatted: string;
  readonly formula?: string;
  readonly type: CellType;
}

// ── Sheet & Workbook ─────────────────────────────────────────────────

export interface SheetInfo {
  readonly id: string;
  readonly name: string;
  readonly rowCount: number;
  readonly colCount: number;
  readonly index: number;
}

export interface NamedRange {
  readonly name: string;
  readonly sheetId: string;
  readonly range: RangeRef;
}

export interface WorkbookInfo {
  readonly id: string;
  readonly name: string;
  readonly sheets: SheetInfo[];
  readonly namedRanges: NamedRange[];
  readonly locale: string;
}

// ── Chart ────────────────────────────────────────────────────────────

export type ChartType =
  | "bar"
  | "line"
  | "pie"
  | "scatter"
  | "area"
  | "column"
  | "donut"
  | "histogram";

export interface ChartConfig {
  readonly type: ChartType;
  readonly title?: string;
  readonly dataRange: RangeRef;
  readonly labelRange?: RangeRef;
  readonly options?: Record<string, unknown>;
}

export interface ChartRef {
  readonly id: string;
  readonly sheetId: string;
  readonly config: ChartConfig;
}

// ── Workbook Snapshot (for context) ──────────────────────────────────

/**
 * A lightweight snapshot of the workbook state sent from the browser
 * to the API for context building. Does NOT include all cell data —
 * only the active sheet, selection, and nearby cells.
 */
export interface WorkbookSnapshot {
  readonly workbookId: string;
  readonly activeSheetId: string;
  readonly sheets: SheetInfo[];
  readonly selection?: RangeRef;
  readonly selectedValues?: CellValue[][];
  readonly namedRanges?: NamedRange[];
}
