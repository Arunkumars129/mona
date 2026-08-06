import { describe, it, expect } from 'vitest';
import { rankAndCompress, boundContext, type LayeredContext } from '../layers';
import { ContextManager, type ContextManagerDeps } from '../context-manager';

/* ── Helpers ──────────────────────────────────────────────── */

function makeContext(overrides: Partial<LayeredContext> = {}): LayeredContext {
  return {
    conversation: [
      { role: 'user', content: 'create a table', timestamp: '2025-01-01T00:00:00Z' },
      { role: 'assistant', content: 'done', timestamp: '2025-01-01T00:00:01Z' },
    ],
    workbookMeta: {
      id: 'wb-1',
      name: 'Test Workbook',
      sheetNames: ['Sheet1'],
      ownerId: 'user-1',
      classification: 'internal',
    },
    activeSheet: {
      id: 'sheet-1',
      name: 'Sheet1',
      rowCount: 100,
      colCount: 26,
    },
    selectedCells: [{ sheetId: 'sheet-1', start: 'A1', end: 'A10' }],
    referencedRanges: [{ sheetId: 'sheet-1', start: 'A1', end: 'A10' }],
    dependencyGraphSlice: [],
    namedRanges: [],
    versionSummary: [],
    recentEdits: [],
    semanticSummary: 'A simple spreadsheet with sales data.',
    ...overrides,
  };
}

/* ── Tests ────────────────────────────────────────────────── */

describe('rankAndCompress', () => {
  it('returns context as-is when under budget', () => {
    const ctx = makeContext();
    const compressed = rankAndCompress(ctx, 100_000);

    expect(compressed.selectedCells).toEqual(ctx.selectedCells);
    expect(compressed.conversation).toEqual(ctx.conversation);
    expect(compressed.tokenEstimate).toBeDefined();
    expect(compressed.tokenEstimate!).toBeLessThan(100_000);
  });

  it('truncates conversation to 5 turns under pressure', () => {
    const longConvo = Array.from({ length: 20 }, (_, i) => ({
      role: 'user' as const,
      content: `Message ${i} with some content that takes up tokens`,
      timestamp: new Date(2025, 0, 1, 0, i).toISOString(),
    }));

    const ctx = makeContext({ conversation: longConvo });
    const compressed = rankAndCompress(ctx, 500); // very tight budget

    expect(compressed.conversation.length).toBeLessThanOrEqual(5);
  });

  it('preserves selectedCells and referencedRanges (never dropped)', () => {
    const ctx = makeContext({
      semanticSummary: 'A'.repeat(10_000),
      versionSummary: Array.from({ length: 100 }, (_, i) => ({
        id: `commit-${i}`,
        message: `Commit ${i}`,
        authorId: 'user-1',
        createdAt: new Date().toISOString(),
      })),
    });

    const compressed = rankAndCompress(ctx, 100); // extremely tight

    expect(compressed.selectedCells).toEqual(ctx.selectedCells);
    expect(compressed.referencedRanges).toEqual(ctx.referencedRanges);
  });

  it('truncates semanticSummary under pressure', () => {
    const ctx = makeContext({
      semanticSummary: 'B'.repeat(5_000),
    });

    const compressed = rankAndCompress(ctx, 200);

    expect(compressed.semanticSummary.length).toBeLessThanOrEqual(200);
  });
});

describe('boundContext', () => {
  it('filters selectedCells to allowed ranges', () => {
    const ctx = makeContext({
      selectedCells: [
        { sheetId: 'sheet-1', start: 'A1', end: 'A10' },
        { sheetId: 'sheet-2', start: 'B1', end: 'B10' },
      ],
    });

    const allowed = [{ sheetId: 'sheet-1', start: 'A1', end: 'A10' }];
    const bounded = boundContext(ctx, allowed);

    expect(bounded.selectedCells).toHaveLength(1);
    expect(bounded.selectedCells[0]!.sheetId).toBe('sheet-1');
    expect(bounded.referencedRanges).toEqual(allowed);
  });

  it('returns empty selectedCells when no overlap', () => {
    const ctx = makeContext({
      selectedCells: [{ sheetId: 'sheet-1', start: 'A1', end: 'A10' }],
    });

    const allowed = [{ sheetId: 'sheet-99', start: 'Z1', end: 'Z10' }];
    const bounded = boundContext(ctx, allowed);

    expect(bounded.selectedCells).toHaveLength(0);
  });
});

describe('ContextManager', () => {
  it('builds a LayeredContext from sources', async () => {
    const deps: ContextManagerDeps = {
      memory: {
        get: async () => undefined,
        set: async () => {},
        delete: async () => {},
        semanticSearch: async () => [],
      },
      getWorkbookMeta: async (id) => ({
        id,
        name: 'Test WB',
        sheetNames: ['Sheet1'],
        ownerId: 'user-1',
        classification: 'internal',
      }),
      getSelection: async () => [{ sheetId: 'sheet-1', start: 'A1', end: 'A1' }],
    };

    const cm = new ContextManager(deps);
    const ctx = await cm.build('session-1', 'wb-1', 'create a table', 8000);

    expect(ctx.workbookMeta.id).toBe('wb-1');
    expect(ctx.activeSheet.id).toBe('Sheet1');
    expect(ctx.selectedCells).toHaveLength(1);
    expect(ctx.tokenEstimate).toBeDefined();
  });

  it('invalidate marks a layer', () => {
    const deps: ContextManagerDeps = {
      memory: {
        get: async () => undefined,
        set: async () => {},
        delete: async () => {},
        semanticSearch: async () => [],
      },
      getWorkbookMeta: async () => ({
        id: 'wb-1',
        name: 'WB',
        sheetNames: ['S1'],
        ownerId: 'u1',
        classification: 'internal',
      }),
      getSelection: async () => [],
    };

    const cm = new ContextManager(deps);
    // Should not throw
    cm.invalidate('selectedCells');
    cm.invalidate('semanticSummary');
  });
});
