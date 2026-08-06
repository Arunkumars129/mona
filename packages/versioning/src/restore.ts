import type { BaseCommand } from '@repo/commands';
import type { CommitStore, WorkbookSnapshot } from './commit';

export class VersionRestorer {
  constructor(
    private commits: CommitStore,
    private getSnapshot: (ref: string) => Promise<WorkbookSnapshot | null>,
    private getCommands: (ids: string[]) => Promise<BaseCommand[]>,
    private applyCommand: (state: Record<string, unknown>, cmd: BaseCommand) => Record<string, unknown>
  ) {}

  async restore(commitId: string): Promise<Record<string, unknown>> {
    const commit = this.commits.getCommit(commitId);
    if (!commit) throw new Error(`Commit ${commitId} not found`);

    let state: Record<string, unknown> = {};
    let snapshotCommit = commit;

    while (snapshotCommit.parentId && !snapshotCommit.snapshotRef) {
      const parent = this.commits.getCommit(snapshotCommit.parentId);
      if (!parent) break;
      snapshotCommit = parent;
    }

    if (snapshotCommit.snapshotRef) {
      const snap = await this.getSnapshot(snapshotCommit.snapshotRef);
      if (snap) state = { ...snap.data };
    }

    const cmds = await this.getCommands(commit.commandIds);
    for (const cmd of cmds) {
      state = this.applyCommand(state, cmd);
    }
    return state;
  }
}
