import type { MonaEvent } from '@repo/events';
import type { MemoryStore } from './store';

/** Incrementally patches semantic workbook summary on structural edits */
export class SemanticSummarizer {
  constructor(private store: MemoryStore) {}

  async onEvent(event: MonaEvent, workbookId: string): Promise<void> {
    if (event.type === 'CellEdited' || event.type === 'SheetCreated') {
      const dirty = await this.store.get('workbook', 'semantic.dirtyRegions', workbookId);
      const regions = Array.isArray(dirty) ? dirty : [];
      regions.push(event.type === 'CellEdited' ? event.cellRef : 'sheet');
      await this.store.set('workbook', 'semantic.dirtyRegions', regions, { scopeId: workbookId });

      if (regions.length > 50) {
        await this.store.set('workbook', 'semantic.needsFullRegen', true, { scopeId: workbookId });
      }
    }
  }
}
