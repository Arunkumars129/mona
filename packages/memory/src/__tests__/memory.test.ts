import { describe, it, expect } from 'vitest';
import { InMemoryStore } from '../store';

describe('InMemoryStore', () => {
  it('get returns undefined for missing keys', async () => {
    const store = new InMemoryStore();
    const val = await store.get('session', 'missing-key');
    expect(val).toBeUndefined();
  });

  it('set then get returns the value', async () => {
    const store = new InMemoryStore();
    await store.set('session', 'my-key', { foo: 'bar' });
    const val = await store.get('session', 'my-key');
    expect(val).toEqual({ foo: 'bar' });
  });

  it('scoped keys isolate data across scopes', async () => {
    const store = new InMemoryStore();
    await store.set('session', 'key', 'session-value');
    await store.set('workbook', 'key', 'workbook-value');

    expect(await store.get('session', 'key')).toBe('session-value');
    expect(await store.get('workbook', 'key')).toBe('workbook-value');
  });

  it('scoped keys isolate data across scopeIds', async () => {
    const store = new InMemoryStore();
    await store.set('session', 'key', 'value-a', { scopeId: 'session-a' });
    await store.set('session', 'key', 'value-b', { scopeId: 'session-b' });

    expect(await store.get('session', 'key', 'session-a')).toBe('value-a');
    expect(await store.get('session', 'key', 'session-b')).toBe('value-b');
  });

  it('delete removes the key', async () => {
    const store = new InMemoryStore();
    await store.set('session', 'key', 'value');
    await store.delete('session', 'key');
    const val = await store.get('session', 'key');
    expect(val).toBeUndefined();
  });

  it('semanticSearch returns empty array (stub)', async () => {
    const store = new InMemoryStore();
    const results = await store.semanticSearch('workbook', 'find me', 5);
    expect(results).toEqual([]);
  });

  it('stores complex objects', async () => {
    const store = new InMemoryStore();
    const data = [
      { role: 'user', content: 'hello', timestamp: '2025-01-01' },
      { role: 'assistant', content: 'hi', timestamp: '2025-01-02' },
    ];
    await store.set('session', 'conversation', data, { scopeId: 's1' });
    const result = await store.get('session', 'conversation', 's1');
    expect(result).toEqual(data);
  });
});
