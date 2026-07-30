import type { SpreadsheetAdapter, VerificationResult } from '@repo/commands';
import type { A1Range, DependencyEdge } from '@repo/shared';

/** Sole package that imports Univer in production. This stub implements the adapter interface. */
export class UniverAdapter implements SpreadsheetAdapter {
  private cells = new Map<string, { value: unknown; formula: string | null }>();

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
