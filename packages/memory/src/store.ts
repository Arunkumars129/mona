import type { MemoryEntry, MemoryQuery, MemoryScope } from "@mona/schema";

export interface MemoryStore {
  /** Retrieve entries matching query criteria */
  query(query: MemoryQuery): Promise<MemoryEntry[]>;

  /** Add or update a memory entry */
  set(entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">): Promise<MemoryEntry>;

  /** Delete a specific memory entry by ID */
  delete(id: string): Promise<boolean>;

  /** Clear all memory entries within a given scope and scopeId */
  clear(scope: MemoryScope, scopeId: string): Promise<void>;
}
