/**
 * Event Schema Types
 *
 * Domain events for the Command Bus and Event Bus pattern.
 * AI edits go through the Command Bus so they integrate with undo/history.
 * The Event Bus emits events for observability and reactivity.
 */

import type { CellRef, CellValue, RangeRef, ChartConfig, SheetInfo } from "./workbook";
import type { TokenUsage } from "./session";
import type { AgentId } from "./agent";
import type { ToolResult } from "./tool";

// ── Command Bus ──────────────────────────────────────────────────────

/**
 * Commands are imperative operations that change workbook state.
 * Every command goes through the Command Bus so it can be:
 * 1. Validated against permissions
 * 2. Recorded for undo/redo history
 * 3. Emitted as a domain event after execution
 */
export type SpreadsheetCommand =
  | WriteCellsCommand
  | InsertRowsCommand
  | DeleteRowsCommand
  | InsertColumnsCommand
  | DeleteColumnsCommand
  | CreateSheetCommand
  | DeleteSheetCommand
  | RenameSheetCommand
  | SetFormulaCommand
  | CreateChartCommand
  | UpdateChartCommand
  | DeleteChartCommand
  | SortRangeCommand
  | FilterRangeCommand
  | ConditionalFormatCommand
  | UndoCommand
  | RedoCommand;

export interface WriteCellsCommand {
  readonly type: "write_cells";
  readonly sheetId: string;
  readonly range: RangeRef;
  readonly values: unknown[][];
  readonly source: CommandSource;
}

export interface InsertRowsCommand {
  readonly type: "insert_rows";
  readonly sheetId: string;
  readonly startRow: number;
  readonly count: number;
  readonly source: CommandSource;
}

export interface DeleteRowsCommand {
  readonly type: "delete_rows";
  readonly sheetId: string;
  readonly startRow: number;
  readonly count: number;
  readonly source: CommandSource;
}

export interface InsertColumnsCommand {
  readonly type: "insert_columns";
  readonly sheetId: string;
  readonly startCol: number;
  readonly count: number;
  readonly source: CommandSource;
}

export interface DeleteColumnsCommand {
  readonly type: "delete_columns";
  readonly sheetId: string;
  readonly startCol: number;
  readonly count: number;
  readonly source: CommandSource;
}

export interface CreateSheetCommand {
  readonly type: "create_sheet";
  readonly name: string;
  readonly source: CommandSource;
}

export interface DeleteSheetCommand {
  readonly type: "delete_sheet";
  readonly sheetId: string;
  readonly source: CommandSource;
}

export interface RenameSheetCommand {
  readonly type: "rename_sheet";
  readonly sheetId: string;
  readonly newName: string;
  readonly source: CommandSource;
}

export interface SetFormulaCommand {
  readonly type: "set_formula";
  readonly sheetId: string;
  readonly cell: CellRef;
  readonly formula: string;
  readonly source: CommandSource;
}

export interface CreateChartCommand {
  readonly type: "create_chart";
  readonly sheetId: string;
  readonly config: ChartConfig;
  readonly source: CommandSource;
}

export interface UpdateChartCommand {
  readonly type: "update_chart";
  readonly chartId: string;
  readonly config: Partial<ChartConfig>;
  readonly source: CommandSource;
}

export interface DeleteChartCommand {
  readonly type: "delete_chart";
  readonly chartId: string;
  readonly source: CommandSource;
}

export interface SortRangeCommand {
  readonly type: "sort_range";
  readonly sheetId: string;
  readonly range: RangeRef;
  readonly sortSpecs: SortSpec[];
  readonly source: CommandSource;
}

export interface FilterRangeCommand {
  readonly type: "filter_range";
  readonly sheetId: string;
  readonly range: RangeRef;
  readonly filterSpecs: FilterSpec[];
  readonly source: CommandSource;
}

export interface ConditionalFormatCommand {
  readonly type: "conditional_format";
  readonly sheetId: string;
  readonly range: RangeRef;
  readonly rules: ConditionalFormatRule[];
  readonly source: CommandSource;
}

export interface UndoCommand {
  readonly type: "undo";
  readonly source: CommandSource;
}

export interface RedoCommand {
  readonly type: "redo";
  readonly source: CommandSource;
}

/** Who initiated the command — user or an AI agent. */
export interface CommandSource {
  readonly origin: "user" | "ai";
  readonly sessionId?: string;
  readonly agentId?: AgentId;
  readonly userId?: string;
}

// ── Sort & Filter helpers ────────────────────────────────────────────

export interface SortSpec {
  readonly column: number;
  readonly ascending: boolean;
}

export interface FilterSpec {
  readonly column: number;
  readonly condition: string;
  readonly value: unknown;
}

export interface ConditionalFormatRule {
  readonly condition: string;
  readonly value: unknown;
  readonly format: Record<string, unknown>;
}

// ── Domain Events (Event Bus) ────────────────────────────────────────

/**
 * Domain events emitted AFTER a command executes successfully.
 * Consumers: audit log, version history, UI reactivity, analytics.
 */
export type DomainEvent =
  | { readonly type: "session.created"; readonly payload: { sessionId: string; workbookId: string; userId: string }; readonly timestamp: Date }
  | { readonly type: "session.ended"; readonly payload: { sessionId: string; totalTokens: number; totalCost: number }; readonly timestamp: Date }
  | { readonly type: "message.sent"; readonly payload: { sessionId: string; messageId: string; role: string; content: string }; readonly timestamp: Date }
  | { readonly type: "cells.written"; readonly payload: { sheetId: string; range: RangeRef; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "rows.inserted"; readonly payload: { sheetId: string; startRow: number; count: number; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "rows.deleted"; readonly payload: { sheetId: string; startRow: number; count: number; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "sheet.created"; readonly payload: { sheetId: string; name: string; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "sheet.deleted"; readonly payload: { sheetId: string; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "sheet.renamed"; readonly payload: { sheetId: string; oldName: string; newName: string; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "chart.created"; readonly payload: { chartId: string; sheetId: string; config: ChartConfig; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "formula.set"; readonly payload: { sheetId: string; cell: CellRef; formula: string; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "tool.executed"; readonly payload: { sessionId: string; tool: string; result: ToolResult; durationMs: number }; readonly timestamp: Date }
  | { readonly type: "agent.started"; readonly payload: { sessionId: string; agentId: AgentId; task: string }; readonly timestamp: Date }
  | { readonly type: "agent.completed"; readonly payload: { sessionId: string; agentId: AgentId; result: string; usage: TokenUsage }; readonly timestamp: Date }
  | { readonly type: "agent.failed"; readonly payload: { sessionId: string; agentId: AgentId; error: string }; readonly timestamp: Date }
  | { readonly type: "version.committed"; readonly payload: { workbookId: string; commitId: string; message: string; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "undo.executed"; readonly payload: { workbookId: string; source: CommandSource }; readonly timestamp: Date }
  | { readonly type: "redo.executed"; readonly payload: { workbookId: string; source: CommandSource }; readonly timestamp: Date };

// ── Bus Interfaces ───────────────────────────────────────────────────

export interface CommandBus {
  execute(command: SpreadsheetCommand): Promise<CommandResult>;
}

export interface CommandResult {
  readonly success: boolean;
  readonly error?: string;
  readonly undoId?: string;
}

export type EventHandler = (event: DomainEvent) => void | Promise<void>;

export interface EventBus {
  emit(event: DomainEvent): void;
  on(eventType: DomainEvent["type"], handler: EventHandler): () => void;
  onAny(handler: EventHandler): () => void;
}
