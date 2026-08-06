import { describe, it, expect } from 'vitest';
import { SessionStore, RecoveryManager, type RecoveryCheckpoint } from '../session';
import type { SessionState } from '../runtime';

describe('SessionStore', () => {
  it('save and load returns session state', async () => {
    const store = new SessionStore();
    const state: SessionState = {
      turnId: 'turn-1',
      completedTaskIds: ['task-1'],
    };

    await store.save('s1', state);
    const loaded = await store.load('s1');

    expect(loaded).toBeDefined();
    expect(loaded!.turnId).toBe('turn-1');
    expect(loaded!.completedTaskIds).toEqual(['task-1']);
  });

  it('load returns undefined for unknown session', async () => {
    const store = new SessionStore();
    const loaded = await store.load('nonexistent');
    expect(loaded).toBeUndefined();
  });

  it('delete removes the session', async () => {
    const store = new SessionStore();
    await store.save('s1', { turnId: 't1', completedTaskIds: [] });
    await store.delete('s1');
    const loaded = await store.load('s1');
    expect(loaded).toBeUndefined();
  });

  it('overwrites on duplicate save', async () => {
    const store = new SessionStore();
    await store.save('s1', { turnId: 't1', completedTaskIds: [] });
    await store.save('s1', { turnId: 't2', completedTaskIds: ['x'] });

    const loaded = await store.load('s1');
    expect(loaded!.turnId).toBe('t2');
    expect(loaded!.completedTaskIds).toEqual(['x']);
  });
});

describe('RecoveryManager', () => {
  it('saves and recovers a checkpoint', async () => {
    const store = new SessionStore();
    const recovery = new RecoveryManager(store);

    const checkpoint: RecoveryCheckpoint = {
      sessionId: 's1',
      turnId: 'turn-1',
      lastCommitId: 'commit-1',
      pendingCommandIds: ['cmd-1', 'cmd-2'],
      completedTaskIds: ['task-1'],
    };

    await recovery.saveCheckpoint(checkpoint);
    const recovered = await recovery.recover('s1');

    expect(recovered).toBeDefined();
    expect(recovered!.sessionId).toBe('s1');
    expect(recovered!.turnId).toBe('turn-1');
    expect(recovered!.completedTaskIds).toEqual(['task-1']);
  });

  it('returns undefined for unrecovered session', async () => {
    const store = new SessionStore();
    const recovery = new RecoveryManager(store);

    const result = await recovery.recover('nonexistent');
    expect(result).toBeUndefined();
  });
});
