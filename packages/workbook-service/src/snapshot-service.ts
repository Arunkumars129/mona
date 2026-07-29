import type { CellValue, CellRef, RangeRef, SheetInfo, WorkbookInfo, NamedRange, ChartConfig, ChartRef, CommandSource, SortSpec, FilterSpec, WorkbookSnapshot, CellType } from "@mona/schema";
import type { WorkbookService } from "./service";

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export class SnapshotWorkbookService implements WorkbookService {
  private sheets: Map<string, { name: string; rowCount: number; colCount: number }> = new Map();
  /** sheetId → cellKey → raw value */
  private data: Map<string, Map<string, unknown>> = new Map();
  private activeSheetId = "sheet-01";
  private sheetCounter = 1;

  constructor(snapshot?: WorkbookSnapshot) {
    this.sheets.set("sheet-01", { name: "Sheet1", rowCount: 1000, colCount: 26 });
    this.data.set("sheet-01", new Map());

    if (snapshot?.sheets) {
      for (const sheet of snapshot.sheets) {
        this.sheets.set(sheet.id, { name: sheet.name, rowCount: sheet.rowCount, colCount: sheet.colCount });
        if (!this.data.has(sheet.id)) {
          this.data.set(sheet.id, new Map());
        }
      }
      if (snapshot.activeSheetId) {
        this.activeSheetId = snapshot.activeSheetId;
      }
    }
  }

  async getWorkbookInfo(): Promise<WorkbookInfo> {
    return {
      id: "default",
      name: "Workbook",
      sheets: await this.getSheetList(),
      namedRanges: [],
      locale: "en-US",
    };
  }

  async getSheetInfo(sheetId: string): Promise<SheetInfo> {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) throw new Error(`Sheet not found: ${sheetId}`);
    return { id: sheetId, name: sheet.name, rowCount: sheet.rowCount, colCount: sheet.colCount, index: 0 };
  }

  async getSheetList(): Promise<SheetInfo[]> {
    return Array.from(this.sheets.entries()).map(([id, s], i) => ({
      id, name: s.name, rowCount: s.rowCount, colCount: s.colCount, index: i,
    }));
  }

  async getCellValues(sheetId: string, range: RangeRef): Promise<CellValue[][]> {
    const sheetData = this.data.get(sheetId);
    const result: CellValue[][] = [];
    for (let row = range.startRow; row <= range.endRow; row++) {
      const rowValues: CellValue[] = [];
      for (let col = range.startCol; col <= range.endCol; col++) {
        const raw = sheetData?.get(cellKey(row, col)) ?? null;
        rowValues.push({
          raw,
          formatted: raw != null ? String(raw) : "",
          type: this.detectCellType(raw),
        });
      }
      result.push(rowValues);
    }
    return result;
  }

  async getCellValue(sheetId: string, cell: CellRef): Promise<CellValue> {
    const values = await this.getCellValues(sheetId, {
      sheetId,
      startRow: cell.row,
      startCol: cell.col,
      endRow: cell.row,
      endCol: cell.col,
    });
    return values[0]?.[0] ?? { raw: null, formatted: "", type: "empty" };
  }

  async getFormulaDependencies(_sheetId: string, _cell: CellRef): Promise<CellRef[]> {
    return [];
  }

  async getNamedRanges(): Promise<NamedRange[]> {
    return [];
  }

  async getActiveSheetId(): Promise<string> {
    return this.activeSheetId;
  }

  async getSelection(): Promise<RangeRef | null> {
    return null;
  }

  async setCellValues(sheetId: string, range: RangeRef, values: unknown[][], _source: CommandSource): Promise<string> {
    if (!this.data.has(sheetId)) {
      this.data.set(sheetId, new Map());
    }
    const sheetData = this.data.get(sheetId)!;
    for (let row = 0; row < values.length; row++) {
      for (let col = 0; col < values[row]!.length; col++) {
        const r = range.startRow + row;
        const c = range.startCol + col;
        sheetData.set(cellKey(r, c), values[row]![col]);
      }
    }
    return `undo_${Date.now()}`;
  }

  async setFormula(_sheetId: string, _cell: CellRef, _formula: string, _source: CommandSource): Promise<string> {
    return `undo_${Date.now()}`;
  }

  async insertRows(_sheetId: string, _startRow: number, _count: number, _source: CommandSource): Promise<string> {
    return `undo_${Date.now()}`;
  }

  async deleteRows(_sheetId: string, _startRow: number, _count: number, _source: CommandSource): Promise<string> {
    return `undo_${Date.now()}`;
  }

  async insertColumns(_sheetId: string, _startCol: number, _count: number, _source: CommandSource): Promise<string> {
    return `undo_${Date.now()}`;
  }

  async deleteColumns(_sheetId: string, _startCol: number, _count: number, _source: CommandSource): Promise<string> {
    return `undo_${Date.now()}`;
  }

  async createSheet(name: string, _source: CommandSource): Promise<string> {
    this.sheetCounter++;
    const sheetId = `sheet-${String(this.sheetCounter).padStart(2, "0")}`;
    this.sheets.set(sheetId, { name, rowCount: 1000, colCount: 26 });
    this.data.set(sheetId, new Map());
    return sheetId;
  }

  async deleteSheet(sheetId: string, _source: CommandSource): Promise<void> {
    this.sheets.delete(sheetId);
  }

  async renameSheet(sheetId: string, newName: string, _source: CommandSource): Promise<void> {
    const sheet = this.sheets.get(sheetId);
    if (sheet) sheet.name = newName;
  }

  async createChart(_sheetId: string, _config: ChartConfig, _source: CommandSource): Promise<ChartRef> {
    return { id: `chart_${Date.now()}`, sheetId: _sheetId, config: _config };
  }

  async sortRange(_sheetId: string, _range: RangeRef, _specs: SortSpec[], _source: CommandSource): Promise<void> {}

  async filterRange(_sheetId: string, _range: RangeRef, _specs: FilterSpec[], _source: CommandSource): Promise<void> {}

  async undo(_source: CommandSource): Promise<void> {}

  async redo(_source: CommandSource): Promise<void> {}

  toSnapshot(): WorkbookSnapshot {
    const sheets: SheetInfo[] = Array.from(this.sheets.entries()).map(([id, s], i) => ({
      id, name: s.name, rowCount: s.rowCount, colCount: s.colCount, index: i,
    }));
    return {
      workbookId: "default",
      activeSheetId: this.activeSheetId,
      sheets,
    };
  }

  /** Export all cell data as a map: sheetId → { cells: { row, col, value }[] } */
  exportCellData(): Record<string, { row: number; col: number; value: unknown }[]> {
    const result: Record<string, { row: number; col: number; value: unknown }[]> = {};
    for (const [sheetId, cells] of this.data) {
      const list: { row: number; col: number; value: unknown }[] = [];
      for (const [key, value] of cells) {
        const [row, col] = key.split(",").map(Number);
        list.push({ row: row!, col: col!, value });
      }
      result[sheetId] = list;
    }
    return result;
  }

  private detectCellType(value: unknown): CellType {
    if (value == null) return "empty";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "string") {
      if (value.startsWith("#")) return "error";
      if (value.startsWith("=")) return "formula";
      return "string";
    }
    return "string";
  }
}
