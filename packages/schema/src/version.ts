/**
 * Version History Schema Types
 *
 * First-class version control for workbook changes.
 * Every AI edit creates a snapshot; users can browse, diff, and rollback.
 */

import type { CommandSource, SpreadsheetCommand } from "./event";

// ── Snapshot ─────────────────────────────────────────────────────────

export interface VersionSnapshot {
  readonly id: string;
  readonly workbookId: string;
  readonly parentId: string | null;
  readonly message: string;
  readonly source: CommandSource;
  readonly commands: SpreadsheetCommand[];
  readonly timestamp: Date;
}

// ── Commit ───────────────────────────────────────────────────────────

export interface VersionCommit {
  readonly id: string;
  readonly workbookId: string;
  readonly snapshots: VersionSnapshot[];
  readonly message: string;
  readonly source: CommandSource;
  readonly timestamp: Date;
}

// ── Version History ──────────────────────────────────────────────────

export interface VersionHistory {
  readonly workbookId: string;
  readonly commits: VersionCommit[];
  readonly currentCommitId: string | null;
}

// ── Version Diff ─────────────────────────────────────────────────────

export interface VersionDiff {
  readonly fromCommitId: string;
  readonly toCommitId: string;
  readonly changes: VersionChange[];
}

export interface VersionChange {
  readonly type: "cell_changed" | "row_inserted" | "row_deleted" | "sheet_created" | "sheet_deleted" | "chart_added" | "formula_changed";
  readonly description: string;
  readonly sheetId?: string;
  readonly details: Record<string, unknown>;
}

// ── Version Manager Interface ────────────────────────────────────────

export interface VersionManager {
  commit(workbookId: string, message: string, source: CommandSource): Promise<VersionCommit>;
  getHistory(workbookId: string, limit?: number): Promise<VersionCommit[]>;
  diff(workbookId: string, fromId: string, toId: string): Promise<VersionDiff>;
  rollback(workbookId: string, commitId: string): Promise<void>;
}
