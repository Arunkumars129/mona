/**
 * Tool Schema Types
 *
 * Typed tool definitions with JSON Schema parameters, permission model,
 * and error handling policies.
 */

import type { RangeRef } from "./workbook";

// ── JSON Schema (subset for tool parameter definitions) ──────────────

export interface JSONSchemaProperty {
  readonly type: "string" | "number" | "boolean" | "array" | "object";
  readonly description?: string;
  readonly enum?: readonly string[];
  readonly items?: JSONSchemaProperty;
  readonly properties?: Record<string, JSONSchemaProperty>;
  readonly required?: readonly string[];
  readonly default?: unknown;
}

export interface JSONSchema {
  readonly type: "object";
  readonly properties: Record<string, JSONSchemaProperty>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean;
}

// ── Tool Definition ──────────────────────────────────────────────────

export interface ToolDefinition<
  TParams = Record<string, unknown>,
  TResult = unknown,
> {
  readonly name: string;
  readonly description: string;
  readonly parameters: JSONSchema;
  readonly permissions: readonly Permission[];
  readonly retryPolicy?: RetryPolicy;
  readonly timeout?: number;
  execute(params: TParams, ctx: ToolContext): Promise<TResult>;
}

// ── Tool Execution ───────────────────────────────────────────────────

export interface ToolCall {
  readonly id: string;
  readonly name: string;
  readonly arguments: Record<string, unknown>;
}

export interface ToolResult {
  readonly toolCallId: string;
  readonly content: string;
  readonly isError: boolean;
  readonly durationMs?: number;
}

/**
 * Execution context passed to every tool invocation.
 * Provides access to the workbook, session, and permissions
 * without coupling tools to specific implementations.
 */
export interface ToolContext {
  readonly sessionId: string;
  readonly workbookId: string;
  readonly userId: string;
  readonly activeSheetId: string;
  readonly selection?: RangeRef;
}

// ── Permission ───────────────────────────────────────────────────────

export type Permission =
  | "cells:read"
  | "cells:write"
  | "sheets:read"
  | "sheets:write"
  | "sheets:delete"
  | "formulas:read"
  | "formulas:write"
  | "charts:read"
  | "charts:write"
  | "charts:delete"
  | "format:write"
  | "rows:insert"
  | "rows:delete"
  | "columns:insert"
  | "columns:delete"
  | "sort:execute"
  | "filter:execute"
  | "python:execute"
  | "sql:execute"
  | "web:search";

// ── Retry Policy ─────────────────────────────────────────────────────

export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffMs: number;
  readonly backoffMultiplier: number;
  readonly retryableErrors?: readonly string[];
}
