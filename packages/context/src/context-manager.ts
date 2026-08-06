import type { MemoryStore } from '@repo/memory';
import type { ConversationTurn, WorkbookMetadata } from '@repo/shared';
import { boundContext, rankAndCompress, type LayeredContext } from './layers';

export interface ContextManagerDeps {
  memory: MemoryStore;
  getWorkbookMeta: (workbookId: string) => Promise<WorkbookMetadata>;
  getSelection: (sessionId: string) => Promise<LayeredContext['selectedCells']>;
}

export class ContextManager {
  private invalidated = new Set<string>();

  constructor(private deps: ContextManagerDeps) {}

  invalidate(layer: string): void {
    this.invalidated.add(layer);
  }

  async build(
    sessionId: string,
    workbookId: string,
    request: string,
    tokenBudget: number
  ): Promise<LayeredContext> {
    const conversation =
      ((await this.deps.memory.get('session', 'conversation', sessionId)) as ConversationTurn[]) ??
      [];

    const workbookMeta = await this.deps.getWorkbookMeta(workbookId);
    const selectedCells = await this.deps.getSelection(sessionId);

    const ctx: LayeredContext = {
      conversation,
      workbookMeta,
      activeSheet: {
        id: workbookMeta.sheetNames[0] ?? 'sheet-1',
        name: workbookMeta.sheetNames[0] ?? 'Sheet1',
        rowCount: 1000,
        colCount: 26,
      },
      selectedCells,
      referencedRanges: selectedCells,
      dependencyGraphSlice: [],
      namedRanges: [],
      versionSummary: [],
      recentEdits: [],
      semanticSummary:
        ((await this.deps.memory.get('workbook', 'semantic.summary', workbookId)) as string) ?? '',
    };

    return rankAndCompress(ctx, tokenBudget);
  }

  boundForTask(ctx: LayeredContext, inputRanges: LayeredContext['selectedCells']): LayeredContext {
    return boundContext(ctx, inputRanges);
  }
}

export * from './layers';
