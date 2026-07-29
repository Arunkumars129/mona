/**
 * Memory Schema Types
 *
 * Types for short-term (session), long-term (workbook), and user-scoped memory storage.
 */

export type MemoryScope = "session" | "workbook" | "user" | "global";
export type MemoryCategory = "preference" | "fact" | "rule" | "history" | "insight";

export interface MemoryEntry {
  readonly id: string;
  readonly scope: MemoryScope;
  readonly category: MemoryCategory;
  readonly scopeId: string;
  readonly key: string;
  readonly value: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface MemoryQuery {
  readonly scope?: MemoryScope;
  readonly scopeId?: string;
  readonly category?: MemoryCategory;
  readonly query?: string;
  readonly limit?: number;
}
