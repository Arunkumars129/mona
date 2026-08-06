import { describe, it, expect } from 'vitest';
import { CommitStore } from '../commit';

describe('CommitStore', () => {
  it('creates a commit with generated id and timestamp', async () => {
    const store = new CommitStore();
    const commit = await store.commit(
      ['cmd-1', 'cmd-2'],
      'Initial data',
      { kind: 'agent', id: 'runtime' }
    );

    expect(commit.id).toBeDefined();
    expect(commit.message).toBe('Initial data');
    expect(commit.commandIds).toEqual(['cmd-1', 'cmd-2']);
    expect(commit.branch).toBe('main');
    expect(commit.parentId).toBeNull();
    expect(commit.createdAt).toBeDefined();
    expect(commit.author).toEqual({ kind: 'agent', id: 'runtime' });
  });

  it('chains commits with parent references', async () => {
    const store = new CommitStore();
    const c1 = await store.commit(['cmd-1'], 'First', { kind: 'user', id: 'u1' });
    const c2 = await store.commit(['cmd-2'], 'Second', { kind: 'user', id: 'u1' });

    expect(c2.parentId).toBe(c1.id);
  });

  it('advances branch head on commit', async () => {
    const store = new CommitStore();
    const c1 = await store.commit(['cmd-1'], 'First', { kind: 'user', id: 'u1' });
    const c2 = await store.commit(['cmd-2'], 'Second', { kind: 'user', id: 'u1' });

    // Second commit's parent should be the first
    expect(c2.parentId).toBe(c1.id);
  });

  it('getCommit retrieves stored commit by id', async () => {
    const store = new CommitStore();
    const commit = await store.commit(['cmd-1'], 'Test', { kind: 'user', id: 'u1' });

    const retrieved = store.getCommit(commit.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.message).toBe('Test');
  });

  it('getCommit returns undefined for unknown id', () => {
    const store = new CommitStore();
    expect(store.getCommit('nonexistent')).toBeUndefined();
  });

  it('supports custom branches', async () => {
    const store = new CommitStore();
    const main = await store.commit(['cmd-1'], 'Main commit', { kind: 'user', id: 'u1' });
    const exp = await store.commit(
      ['cmd-2'],
      'Experiment',
      { kind: 'user', id: 'u1' },
      'experiment'
    );

    expect(exp.branch).toBe('experiment');
    // experiment branch parent should be main's head (since experiment didn't have prior commits)
    expect(exp.parentId).toBe(main.id);
  });

  it('shouldSnapshot triggers at correct interval', () => {
    const store = new CommitStore(10);

    expect(store.shouldSnapshot(0)).toBe(true); // 0 % 10 === 0
    expect(store.shouldSnapshot(5)).toBe(false);
    expect(store.shouldSnapshot(10)).toBe(true);
    expect(store.shouldSnapshot(20)).toBe(true);
    expect(store.shouldSnapshot(15)).toBe(false);
  });
});
