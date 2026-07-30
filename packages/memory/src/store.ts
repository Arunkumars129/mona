import type { MemoryHit, MemoryScope } from '@repo/shared';

export interface MemoryStore {
  get(scope: MemoryScope, key: string, scopeId?: string): Promise<unknown>;
  set(
    scope: MemoryScope,
    key: string,
    value: unknown,
    opts?: { ttlSec?: number; scopeId?: string }
  ): Promise<void>;
  delete(scope: MemoryScope, key: string, scopeId?: string): Promise<void>;
  semanticSearch(scope: MemoryScope, query: string, k: number, scopeId?: string): Promise<MemoryHit[]>;
}

/** In-memory implementation for dev/tests; production uses Postgres + pgvector + Redis */
export class InMemoryStore implements MemoryStore {
  private data = new Map<string, unknown>();

  private key(scope: MemoryScope, key: string, scopeId?: string): string {
    return `${scope}:${scopeId ?? 'default'}:${key}`;
  }

  async get(scope: MemoryScope, key: string, scopeId?: string): Promise<unknown> {
    return this.data.get(this.key(scope, key, scopeId));
  }

  async set(
    scope: MemoryScope,
    key: string,
    value: unknown,
    opts?: { ttlSec?: number; scopeId?: string }
  ): Promise<void> {
    this.data.set(this.key(scope, key, opts?.scopeId), value);
    if (opts?.ttlSec) {
      setTimeout(() => this.data.delete(this.key(scope, key, opts.scopeId)), opts.ttlSec * 1000);
    }
  }

  async delete(scope: MemoryScope, key: string, scopeId?: string): Promise<void> {
    this.data.delete(this.key(scope, key, scopeId));
  }

  async semanticSearch(): Promise<MemoryHit[]> {
    return [];
  }
}
