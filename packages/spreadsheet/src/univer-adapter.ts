import type { CellStyle, SpreadsheetAdapter, VerificationResult } from '@repo/commands';
import type { A1Range, DependencyEdge } from '@repo/shared';

/** Sole package that imports Univer in production. This stub implements the adapter interface. */
export class UniverAdapter implements SpreadsheetAdapter {
  private cells = new Map<string, { value: unknown; formula: string | null }>();
  private styles = new Map<string, CellStyle>();

  private key(sheetId: string, cellRef: string): string {
    return `${sheetId}!${cellRef}`;
  }

  getCellValue(sheetId: string, cellRef: string): unknown {
    return this.cells.get(this.key(sheetId, cellRef))?.value ?? null;
  }

  getCellFormula(sheetId: string, cellRef: string): string | null {
    return this.cells.get(this.key(sheetId, cellRef))?.formula ?? null;
  }

  setCellValue(sheetId: string, cellRef: string, value: unknown): void {
    const k = this.key(sheetId, cellRef);
    const existing = this.cells.get(k);
    this.cells.set(k, { value, formula: existing?.formula ?? null });
  }

  setFormula(sheetId: string, cellRef: string, formula: string): void {
    const k = this.key(sheetId, cellRef);
    this.cells.set(k, { value: formula, formula });
  }

  getCellStyle(sheetId: string, cellRef: string): CellStyle | null {
    return this.styles.get(this.key(sheetId, cellRef)) ?? null;
  }

  setRangeStyle(sheetId: string, range: A1Range, style: CellStyle): void {
    for (const cellRef of expandRange(range.start, range.end)) {
      this.styles.set(this.key(sheetId, cellRef), style);
    }
  }

  rangeExists(_sheetId: string, _range: A1Range): boolean {
    return true;
  }

  verifyFormula(_sheetId: string, cellRef: string): VerificationResult {
    const hasRefError = cellRef.includes('#REF');
    return {
      formulaValid: !hasRefError,
      brokenReferences: hasRefError ? [cellRef] : [],
      circularDependencies: [],
      rangeExists: true,
      permissionCompliant: true,
    };
  }

  /** Dump all cells written so far, so later tasks can see prior work */
  getSnapshot(): Array<{
    cellRef: string;
    value: unknown;
    formula: string | null;
    style?: CellStyle;
  }> {
    return [...this.cells.entries()].map(([key, v]) => ({
      cellRef: key.split('!')[1] ?? key,
      value: v.value,
      formula: v.formula,
      style: this.styles.get(key) ?? undefined,
    }));
  }
}

function expandRange(start: string, end: string): string[] {
  const parse = (ref: string): { row: number; col: number } | null => {
    const m = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!m) return null;
    let col = 0;
    for (let i = 0; i < m[1]!.length; i++) {
      col = col * 26 + (m[1]!.charCodeAt(i) - 64);
    }
    return { row: parseInt(m[2]!, 10) - 1, col: col - 1 };
  };

  const startRef = parse(start);
  const endRef = parse(end);
  if (!startRef || !endRef) return [start];

  const cells: string[] = [];
  for (let r = startRef.row; r <= endRef.row; r++) {
    for (let c = startRef.col; c <= endRef.col; c++) {
      cells.push(a1FromIndex(r, c));
    }
  }
  return cells;
}

function a1FromIndex(row: number, col: number): string {
  let c = col + 1;
  let colStr = '';
  while (c > 0) {
    const rem = (c - 1) % 26;
    colStr = String.fromCharCode(65 + rem) + colStr;
    c = Math.floor((c - 1) / 26);
  }
  return `${colStr}${row + 1}`;
}

/** Incremental formula dependency graph — updated on each SetFormula command */
export class DependencyGraph {
  private edges: DependencyEdge[] = [];

  addEdge(edge: DependencyEdge): void {
    this.edges.push(edge);
  }

  sliceForCell(cellRef: string, hops = 2): DependencyEdge[] {
    const visited = new Set<string>();
    const result: DependencyEdge[] = [];
    const queue = [{ ref: cellRef, depth: 0 }];

    while (queue.length > 0) {
      const { ref, depth } = queue.shift()!;
      if (visited.has(ref) || depth > hops) continue;
      visited.add(ref);

      for (const e of this.edges) {
        if (e.from === ref || e.to === ref) {
          result.push(e);
          queue.push({ ref: e.from === ref ? e.to : e.from, depth: depth + 1 });
        }
      }
    }
    return result;
  }

  hasCycle(): boolean {
    // Tarjan's or DFS cycle detection stub
    return false;
  }
}
