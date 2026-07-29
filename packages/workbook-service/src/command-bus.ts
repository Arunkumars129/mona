/**
 * Command Bus Implementation
 *
 * All mutating spreadsheet operations go through the Command Bus.
 * This ensures:
 * 1. Permissions are checked before execution
 * 2. Commands are recorded for undo/redo history
 * 3. Domain events are emitted after execution
 * 4. Version history is maintained
 */

import type {
  SpreadsheetCommand,
  CommandBus,
  CommandResult,
  CommandSource,
  EventBus,
  DomainEvent,
} from "@mona/schema";
import type { PermissionEngine, Permission } from "@mona/schema";

// ── Command Handler ──────────────────────────────────────────────────

export type CommandHandler = (command: SpreadsheetCommand) => Promise<CommandResult>;

// ── Command Bus Implementation ───────────────────────────────────────

export class SpreadsheetCommandBus implements CommandBus {
  private handler: CommandHandler | null = null;
  private readonly undoStack: SpreadsheetCommand[] = [];
  private readonly redoStack: SpreadsheetCommand[] = [];
  private readonly history: Array<{ command: SpreadsheetCommand; result: CommandResult; timestamp: Date }> = [];
  private eventBus: EventBus | null = null;
  private permissionEngine: PermissionEngine | null = null;

  /** Register the handler that executes commands (typically the Univer adapter). */
  setHandler(handler: CommandHandler): void {
    this.handler = handler;
  }

  /** Wire up the event bus for post-command event emission. */
  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus;
  }

  /** Wire up the permission engine for pre-command access checks. */
  setPermissionEngine(engine: PermissionEngine): void {
    this.permissionEngine = engine;
  }

  async execute(command: SpreadsheetCommand): Promise<CommandResult> {
    if (!this.handler) {
      return { success: false, error: "No command handler registered" };
    }

    // 1. Check permissions
    if (this.permissionEngine && command.type !== "undo" && command.type !== "redo") {
      const permission = this.getRequiredPermission(command);
      if (permission) {
        const source = this.getCommandSource(command);
        const check = this.permissionEngine.check(
          source.userId ?? "anonymous",
          "current-workbook",
          permission
        );
        if (!check.allowed) {
          return { success: false, error: `Permission denied: ${check.reason ?? permission}` };
        }
      }
    }

    // 2. Execute the command
    const result = await this.handler(command);

    // 3. Record in history
    if (result.success) {
      this.history.push({ command, result, timestamp: new Date() });

      if (command.type !== "undo" && command.type !== "redo") {
        this.undoStack.push(command);
        this.redoStack.length = 0; // Clear redo stack on new action
      }

      // 4. Emit domain event
      if (this.eventBus) {
        const event = this.commandToEvent(command);
        if (event) {
          this.eventBus.emit(event);
        }
      }
    }

    return result;
  }

  /** Get the undo stack for debugging/inspection. */
  getUndoHistory(): SpreadsheetCommand[] {
    return [...this.undoStack];
  }

  /** Get the full command history. */
  getHistory(): Array<{ command: SpreadsheetCommand; result: CommandResult; timestamp: Date }> {
    return [...this.history];
  }

  // ── Private Helpers ────────────────────────────────────────────────

  private getRequiredPermission(command: SpreadsheetCommand): Permission | null {
    switch (command.type) {
      case "write_cells": return "cells:write";
      case "insert_rows": return "rows:insert";
      case "delete_rows": return "rows:delete";
      case "insert_columns": return "columns:insert";
      case "delete_columns": return "columns:delete";
      case "create_sheet": return "sheets:write";
      case "delete_sheet": return "sheets:delete";
      case "rename_sheet": return "sheets:write";
      case "set_formula": return "formulas:write";
      case "create_chart": return "charts:write";
      case "update_chart": return "charts:write";
      case "delete_chart": return "charts:delete";
      case "sort_range": return "sort:execute";
      case "filter_range": return "filter:execute";
      case "conditional_format": return "format:write";
      default: return null;
    }
  }

  private getCommandSource(command: SpreadsheetCommand): CommandSource {
    if ("source" in command) {
      return command.source;
    }
    return { origin: "user" };
  }

  private commandToEvent(command: SpreadsheetCommand): DomainEvent | null {
    const timestamp = new Date();
    const source = this.getCommandSource(command);

    switch (command.type) {
      case "write_cells":
        return { type: "cells.written", payload: { sheetId: command.sheetId, range: command.range, source }, timestamp };
      case "insert_rows":
        return { type: "rows.inserted", payload: { sheetId: command.sheetId, startRow: command.startRow, count: command.count, source }, timestamp };
      case "delete_rows":
        return { type: "rows.deleted", payload: { sheetId: command.sheetId, startRow: command.startRow, count: command.count, source }, timestamp };
      case "create_sheet":
        return { type: "sheet.created", payload: { sheetId: "pending", name: command.name, source }, timestamp };
      case "delete_sheet":
        return { type: "sheet.deleted", payload: { sheetId: command.sheetId, source }, timestamp };
      case "rename_sheet":
        return { type: "sheet.renamed", payload: { sheetId: command.sheetId, oldName: "", newName: command.newName, source }, timestamp };
      case "set_formula":
        return { type: "formula.set", payload: { sheetId: command.sheetId, cell: command.cell, formula: command.formula, source }, timestamp };
      case "create_chart":
        return { type: "chart.created", payload: { chartId: "pending", sheetId: command.sheetId, config: command.config, source }, timestamp };
      case "undo":
        return { type: "undo.executed", payload: { workbookId: "current", source }, timestamp };
      case "redo":
        return { type: "redo.executed", payload: { workbookId: "current", source }, timestamp };
      default:
        return null;
    }
  }
}
