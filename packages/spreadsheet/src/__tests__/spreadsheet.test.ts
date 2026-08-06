import { describe, it, expect } from 'vitest';
import { UniverAdapter, DependencyGraph } from '../univer-adapter';

describe('UniverAdapter', () => {
  it('returns null for empty cells', () => {
    const adapter = new UniverAdapter();

    expect(adapter.getCellValue('sheet-1', 'A1')).toBeNull();
    expect(adapter.getCellFormula('sheet-1', 'A1')).toBeNull();
  });

  it('sets and gets cell values', () => {
    const adapter = new UniverAdapter();

    adapter.setCellValue('sheet-1', 'A1', 42);
    adapter.setCellValue('sheet-1', 'B1', 'hello');

    expect(adapter.getCellValue('sheet-1', 'A1')).toBe(42);
    expect(adapter.getCellValue('sheet-1', 'B1')).toBe('hello');
  });

  it('sets and gets formulas', () => {
    const adapter = new UniverAdapter();

    adapter.setFormula('sheet-1', 'C1', '=SUM(A1:B1)');

    expect(adapter.getCellFormula('sheet-1', 'C1')).toBe('=SUM(A1:B1)');
    expect(adapter.getCellValue('sheet-1', 'C1')).toBe('=SUM(A1:B1)');
  });

  it('preserves formula when setting cell value', () => {
    const adapter = new UniverAdapter();

    adapter.setFormula('sheet-1', 'A1', '=1+1');
    adapter.setCellValue('sheet-1', 'A1', 2);

    expect(adapter.getCellValue('sheet-1', 'A1')).toBe(2);
    expect(adapter.getCellFormula('sheet-1', 'A1')).toBe('=1+1');
  });

  it('isolates cells across sheets', () => {
    const adapter = new UniverAdapter();

    adapter.setCellValue('sheet-1', 'A1', 'first');
    adapter.setCellValue('sheet-2', 'A1', 'second');

    expect(adapter.getCellValue('sheet-1', 'A1')).toBe('first');
    expect(adapter.getCellValue('sheet-2', 'A1')).toBe('second');
  });

  it('rangeExists returns true (stub)', () => {
    const adapter = new UniverAdapter();
    expect(adapter.rangeExists('sheet-1', { sheetId: 'sheet-1', start: 'A1', end: 'Z100' })).toBe(
      true
    );
  });

  it('verifyFormula returns valid for normal cells', () => {
    const adapter = new UniverAdapter();
    const result = adapter.verifyFormula('sheet-1', 'A1');

    expect(result.formulaValid).toBe(true);
    expect(result.brokenReferences).toEqual([]);
    expect(result.permissionCompliant).toBe(true);
  });

  it('verifyFormula detects #REF errors', () => {
    const adapter = new UniverAdapter();
    const result = adapter.verifyFormula('sheet-1', '#REF!A1');

    expect(result.formulaValid).toBe(false);
    expect(result.brokenReferences).toContain('#REF!A1');
  });
});

describe('DependencyGraph', () => {
  it('starts with no edges', () => {
    const graph = new DependencyGraph();
    expect(graph.sliceForCell('A1')).toEqual([]);
  });

  it('adds edges and slices by cell', () => {
    const graph = new DependencyGraph();
    graph.addEdge({ from: 'A1', to: 'B1', type: 'formula' });
    graph.addEdge({ from: 'B1', to: 'C1', type: 'formula' });

    const slice = graph.sliceForCell('A1', 2);

    expect(slice.length).toBeGreaterThan(0);
    expect(slice.some((e) => e.from === 'A1' && e.to === 'B1')).toBe(true);
  });

  it('limits slice by hop count', () => {
    const graph = new DependencyGraph();
    graph.addEdge({ from: 'A1', to: 'B1', type: 'formula' });
    graph.addEdge({ from: 'B1', to: 'C1', type: 'formula' });
    graph.addEdge({ from: 'C1', to: 'D1', type: 'formula' });
    graph.addEdge({ from: 'D1', to: 'E1', type: 'formula' });

    const slice1 = graph.sliceForCell('A1', 1);
    const slice3 = graph.sliceForCell('A1', 3);

    // 1 hop should not reach D1→E1
    expect(slice1.length).toBeLessThan(slice3.length);
  });

  it('hasCycle returns false (stub)', () => {
    const graph = new DependencyGraph();
    graph.addEdge({ from: 'A1', to: 'B1', type: 'formula' });
    expect(graph.hasCycle()).toBe(false);
  });
});
