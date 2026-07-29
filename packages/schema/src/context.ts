/**
 * Context Schema Types
 *
 * Types for the context window assembled for each LLM call.
 */

import type { CellValue, NamedRange, RangeRef, SheetInfo } from "./workbook";
import type { Message } from "./session";
import type { MemoryEntry } from "./memory";

// ── Context Window ───────────────────────────────────────────────────

/** The full context assembled by the ContextBuilder for a single LLM call. */
export interface ContextWindow {
  readonly workbook: WorkbookContext;
  readonly selection: SelectionContext | null;
  readonly history: HistoryContext;
  readonly memory: MemoryContext;
  readonly user: UserContext;
  readonly estimatedTokens: number;
}

// ── Workbook Context ─────────────────────────────────────────────────

export interface WorkbookContext {
  readonly workbookId: string;
  readonly workbookName: string;
  readonly sheets: SheetInfo[];
  readonly activeSheetId: string;
  readonly namedRanges: NamedRange[];
}

// ── Selection Context ────────────────────────────────────────────────

export interface SelectionContext {
  readonly range: RangeRef;
  readonly values: CellValue[][];
  readonly formulas: string[];
  readonly neighborCells: NeighborCells;
}

export interface NeighborCells {
  readonly above: CellValue[];
  readonly below: CellValue[];
  readonly left: CellValue[];
  readonly right: CellValue[];
  readonly headers: CellValue[];
}

// ── History Context ──────────────────────────────────────────────────

export interface HistoryContext {
  readonly recentMessages: Message[];
  readonly totalMessages: number;
  readonly summarizedHistory?: string;
}

// ── Memory Context ───────────────────────────────────────────────────

export interface MemoryContext {
  readonly relevantMemories: MemoryEntry[];
  readonly workbookInsights: string[];
}

// ── User Context ─────────────────────────────────────────────────────

export interface UserContext {
  readonly userId: string;
  readonly preferences: Record<string, unknown>;
  readonly permissionLevel: PermissionLevel;
}

export type PermissionLevel = "viewer" | "editor" | "admin" | "owner";

// ── Context Options ──────────────────────────────────────────────────

export type ContextBudget = "full" | "normal" | "compact" | "minimal";

export interface ContextOptions {
  readonly budget: ContextBudget;
  readonly maxTokens: number;
  readonly includeFormulas: boolean;
  readonly includeHistory: boolean;
  readonly includeMemory: boolean;
  readonly maxHistoryMessages: number;
}
