import type { MemoryEntry, MemoryQuery, MemoryScope } from "@mona/schema";
import type { MemoryStore } from "./store";

export class InMemoryMemoryStore implements MemoryStore {
  private readonly entries: Map<string, MemoryEntry> = new Map();

  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    let results = Array.from(this.entries.values());

    if (query.scope) {
      results = results.filter((e) => e.scope === query.scope);
    }

    if (query.scopeId) {
      results = results.filter((e) => e.scopeId === query.scopeId);
    }

    if (query.category) {
      results = results.filter((e) => e.category === query.category);
    }

    if (query.query?.trim()) {
      const q = query.query.toLowerCase().trim();
      results = results.filter(
        (e) =>
          e.key.toLowerCase().includes(q) ||
          e.value.toLowerCase().includes(q)
      );
    }

    // Sort by newest first
    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    if (query.limit && query.limit > 0) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  async set(
    input: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry> {
    const existingKey = Array.from(this.entries.values()).find(
      (e) =>
        e.scope === input.scope &&
        e.scopeId === input.scopeId &&
        e.key === input.key
    );

    const now = new Date();
    const id = existingKey ? existingKey.id : `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const entry: MemoryEntry = {
      id,
      scope: input.scope,
      category: input.category,
      scopeId: input.scopeId,
      key: input.key,
      value: input.value,
      metadata: input.metadata,
      createdAt: existingKey ? existingKey.createdAt : now,
      updatedAt: now,
    };

    this.entries.set(id, entry);
    return entry;
  }

  async delete(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }

  async clear(scope: MemoryScope, scopeId: string): Promise<void> {
    for (const [id, entry] of this.entries.entries()) {
      if (entry.scope === scope && entry.scopeId === scopeId) {
        this.entries.delete(id);
      }
    }
  }
}
