import type { SessionState } from './runtime.js';

/** Session persistence — production uses Postgres + Redis */
export class SessionStore {
  private sessions = new Map<string, SessionState>();

  async save(sessionId: string, state: SessionState): Promise<void> {
    this.sessions.set(sessionId, state);
  }

  async load(sessionId: string): Promise<SessionState | undefined> {
    return this.sessions.get(sessionId);
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}

/** Crash recovery: replay commands from last checkpoint */
export interface RecoveryCheckpoint {
  sessionId: string;
  turnId: string;
  lastCommitId: string;
  pendingCommandIds: string[];
  completedTaskIds: string[];
}

export class RecoveryManager {
  constructor(private sessionStore: SessionStore) {}

  async saveCheckpoint(checkpoint: RecoveryCheckpoint): Promise<void> {
    await this.sessionStore.save(checkpoint.sessionId, {
      turnId: checkpoint.turnId,
      completedTaskIds: checkpoint.completedTaskIds,
    });
  }

  async recover(sessionId: string): Promise<RecoveryCheckpoint | undefined> {
    const state = await this.sessionStore.load(sessionId);
    if (!state) return undefined;
    return {
      sessionId,
      turnId: state.turnId,
      lastCommitId: '',
      pendingCommandIds: [],
      completedTaskIds: state.completedTaskIds,
    };
  }
}
