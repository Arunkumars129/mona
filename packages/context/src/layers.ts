import type {
  A1Range,
  CellEditSummary,
  CommitSummary,
  ConversationTurn,
  DependencyEdge,
  NamedRange,
  SheetSummary,
  WorkbookMetadata,
} from '@repo/shared';

export type ContextLayer =
  | 'conversation'
  | 'workbookMeta'
  | 'activeSheet'
  | 'selectedCells'
  | 'referencedRanges'
  | 'dependencyGraph'
  | 'namedRanges'
  | 'versionSummary'
  | 'recentEdits'
  | 'semanticSummary';

export interface LayeredContext {
  conversation: ConversationTurn[];
  workbookMeta: WorkbookMetadata;
  activeSheet: SheetSummary;
  selectedCells: A1Range[];
  referencedRanges: A1Range[];
  dependencyGraphSlice: DependencyEdge[];
  namedRanges: NamedRange[];
  versionSummary: CommitSummary[];
  recentEdits: CellEditSummary[];
  semanticSummary: string;
  /** Live snapshot of cells written by earlier tasks in the current turn */
  currentCells?: Array<{ cellRef: string; value: unknown; formula: string | null }>;
  tokenEstimate?: number;
}

export interface ContextLayerProvider {
  layer: ContextLayer;
  fetch(sessionId: string, request: string): Promise<Partial<LayeredContext>>;
}

const PRIORITY: (keyof LayeredContext)[] = [
  'selectedCells',
  'referencedRanges',
  'activeSheet',
  'conversation',
  'dependencyGraphSlice',
  'workbookMeta',
  'namedRanges',
  'recentEdits',
  'versionSummary',
  'semanticSummary',
];

export function rankAndCompress(
  ctx: LayeredContext,
  tokenBudget: number
): LayeredContext {
  let estimate = estimateTokens(ctx);
  if (estimate <= tokenBudget) return { ...ctx, tokenEstimate: estimate };

  const compressed = { ...ctx };

  // Truncate conversation to last 5 turns
  if (compressed.conversation.length > 5) {
    compressed.conversation = compressed.conversation.slice(-5);
    estimate = estimateTokens(compressed);
  }

  // Drop lowest-priority layers under pressure
  for (let i = PRIORITY.length - 1; i >= 0 && estimate > tokenBudget; i--) {
    const key = PRIORITY[i]!;
    if (key === 'selectedCells' || key === 'referencedRanges') continue;
    if (key === 'semanticSummary') compressed.semanticSummary = compressed.semanticSummary.slice(0, 200);
    if (key === 'versionSummary') compressed.versionSummary = compressed.versionSummary.slice(0, 3);
    if (key === 'recentEdits') compressed.recentEdits = compressed.recentEdits.slice(0, 10);
    estimate = estimateTokens(compressed);
  }

  return { ...compressed, tokenEstimate: estimate };
}

function estimateTokens(ctx: LayeredContext): number {
  return JSON.stringify(ctx).length / 4;
}

export function boundContext(ctx: LayeredContext, allowed: A1Range[]): LayeredContext {
  return {
    ...ctx,
    selectedCells: intersectRanges(ctx.selectedCells, allowed),
    referencedRanges: allowed,
  };
}

function intersectRanges(cells: A1Range[], allowed: A1Range[]): A1Range[] {
  return cells.filter((c) =>
    allowed.some((a) => a.sheetId === c.sheetId)
  );
}
