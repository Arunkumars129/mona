/**
 * Context Builder
 *
 * Assembles the context window for each LLM call from multiple sources.
 * Token-budget aware: compresses context based on the budget level.
 */

import type {
  ContextWindow,
  ContextOptions,
  ContextBudget,
  WorkbookContext,
  SelectionContext,
  HistoryContext,
  MemoryContext,
  UserContext,
  Message,
  WorkbookSnapshot,
  CellValue,
} from "@mona/schema";
import type { WorkbookService } from "@mona/workbook-service";

// ── Budget Defaults ──────────────────────────────────────────────────

const BUDGET_DEFAULTS: Record<ContextBudget, ContextOptions> = {
  full: {
    budget: "full",
    maxTokens: 50_000,
    includeFormulas: true,
    includeHistory: true,
    includeMemory: true,
    maxHistoryMessages: 50,
  },
  normal: {
    budget: "normal",
    maxTokens: 25_000,
    includeFormulas: true,
    includeHistory: true,
    includeMemory: true,
    maxHistoryMessages: 20,
  },
  compact: {
    budget: "compact",
    maxTokens: 10_000,
    includeFormulas: false,
    includeHistory: true,
    includeMemory: false,
    maxHistoryMessages: 10,
  },
  minimal: {
    budget: "minimal",
    maxTokens: 4_000,
    includeFormulas: false,
    includeHistory: true,
    includeMemory: false,
    maxHistoryMessages: 3,
  },
};

// ── Context Builder ──────────────────────────────────────────────────

export class ContextBuilder {
  /**
   * Build context from a workbook snapshot (sent from the browser).
   * This is the primary path for API route-based context building.
   */
  buildFromSnapshot(
    snapshot: WorkbookSnapshot,
    messages: Message[],
    budget: ContextBudget = "normal"
  ): ContextWindow {
    const options = BUDGET_DEFAULTS[budget];

    const workbook: WorkbookContext = {
      workbookId: snapshot.workbookId,
      workbookName: "Workbook",
      sheets: snapshot.sheets,
      activeSheetId: snapshot.activeSheetId,
      namedRanges: snapshot.namedRanges ?? [],
    };

    const selection: SelectionContext | null = snapshot.selection && snapshot.selectedValues
      ? {
          range: snapshot.selection,
          values: snapshot.selectedValues,
          formulas: options.includeFormulas
            ? snapshot.selectedValues.flat().filter((v) => v.formula).map((v) => v.formula!)
            : [],
          neighborCells: { above: [], below: [], left: [], right: [], headers: [] },
        }
      : null;

    const history: HistoryContext = {
      recentMessages: messages.slice(-options.maxHistoryMessages),
      totalMessages: messages.length,
      summarizedHistory: messages.length > options.maxHistoryMessages
        ? `[${messages.length - options.maxHistoryMessages} earlier messages omitted]`
        : undefined,
    };

    const memory: MemoryContext = {
      relevantMemories: [],
      workbookInsights: [],
    };

    const user: UserContext = {
      userId: "current-user",
      preferences: {},
      permissionLevel: "editor",
    };

    return {
      workbook,
      selection,
      history,
      memory,
      user,
      estimatedTokens: this.estimateTokens(workbook, selection, history),
    };
  }

  /**
   * Build context directly from WorkbookService (for in-process usage).
   */
  async buildFromService(
    workbookService: WorkbookService,
    messages: Message[],
    budget: ContextBudget = "normal"
  ): Promise<ContextWindow> {
    const options = BUDGET_DEFAULTS[budget];

    const info = await workbookService.getWorkbookInfo();
    const activeSheetId = await workbookService.getActiveSheetId();
    const selectionRange = await workbookService.getSelection();

    const workbook: WorkbookContext = {
      workbookId: info.id,
      workbookName: info.name,
      sheets: info.sheets,
      activeSheetId,
      namedRanges: info.namedRanges,
    };

    let selection: SelectionContext | null = null;
    if (selectionRange) {
      const values = await workbookService.getCellValues(selectionRange.sheetId, selectionRange);
      selection = {
        range: selectionRange,
        values,
        formulas: options.includeFormulas
          ? values.flat().filter((v) => v.formula).map((v) => v.formula!)
          : [],
        neighborCells: { above: [], below: [], left: [], right: [], headers: [] },
      };
    }

    const history: HistoryContext = {
      recentMessages: messages.slice(-options.maxHistoryMessages),
      totalMessages: messages.length,
    };

    const memory: MemoryContext = {
      relevantMemories: [],
      workbookInsights: [],
    };

    const user: UserContext = {
      userId: "current-user",
      preferences: {},
      permissionLevel: "editor",
    };

    return {
      workbook,
      selection,
      history,
      memory,
      user,
      estimatedTokens: this.estimateTokens(workbook, selection, history),
    };
  }

  /**
   * Serialize context to a system prompt string for the LLM.
   */
  toSystemPrompt(ctx: ContextWindow): string {
    const parts: string[] = [];

    // Workbook metadata
    parts.push(`## Workbook: ${ctx.workbook.workbookName}`);
    parts.push(`Sheets: ${ctx.workbook.sheets.map((s) => `"${s.name}" (${s.id}, ${s.rowCount}×${s.colCount})`).join(", ")}`);
    parts.push(`Active sheet: ${ctx.workbook.activeSheetId}`);

    if (ctx.workbook.namedRanges.length > 0) {
      parts.push(`Named ranges: ${ctx.workbook.namedRanges.map((r) => r.name).join(", ")}`);
    }

    // Selection context
    if (ctx.selection) {
      const r = ctx.selection.range;
      parts.push(`\n## Current Selection: Row ${r.startRow + 1}:${r.endRow + 1}, Col ${r.startCol + 1}:${r.endCol + 1}`);
      parts.push(`Values:\n${this.formatCellGrid(ctx.selection.values)}`);

      if (ctx.selection.formulas.length > 0) {
        parts.push(`Formulas in selection: ${ctx.selection.formulas.join(", ")}`);
      }
    }

    return parts.join("\n");
  }

  // ── Private Helpers ──────────────────────────────────────────────

  private formatCellGrid(values: CellValue[][]): string {
    if (values.length === 0) return "(empty)";

    // Limit display to first 20 rows and 10 cols
    const maxRows = Math.min(values.length, 20);
    const maxCols = Math.min(values[0]?.length ?? 0, 10);

    const rows = values.slice(0, maxRows).map((row) =>
      row.slice(0, maxCols).map((cell) => cell.formatted || "(empty)").join(" | ")
    );

    let result = rows.join("\n");
    if (values.length > maxRows) {
      result += `\n... (${values.length - maxRows} more rows)`;
    }
    return result;
  }

  private estimateTokens(
    workbook: WorkbookContext,
    selection: SelectionContext | null,
    history: HistoryContext
  ): number {
    let tokens = 0;
    // Rough estimation: 4 chars ≈ 1 token
    tokens += JSON.stringify(workbook).length / 4;
    if (selection) tokens += JSON.stringify(selection.values).length / 4;
    tokens += history.recentMessages.reduce((sum, m) => sum + m.content.length / 4, 0);
    return Math.round(tokens);
  }
}
