import type { IssuedBy } from '@repo/shared';

export interface Commit {
  id: string;
  parentId: string | null;
  branch: string;
  message: string;
  commandIds: string[];
  createdAt: string;
  author: IssuedBy;
  snapshotRef?: string;
}

export interface Branch {
  name: string;
  headCommitId: string;
}

export interface WorkbookSnapshot {
  id: string;
  commitId: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export class CommitStore {
  private commits = new Map<string, Commit>();
  private branches = new Map<string, Branch>();
  private head: string | null = null;

  constructor(private snapshotInterval = 50) {}

  async commit(
    commandIds: string[],
    message: string,
    author: IssuedBy,
    branch = 'main'
  ): Promise<Commit> {
    const parentId = this.branches.get(branch)?.headCommitId ?? this.head;
    const commit: Commit = {
      id: crypto.randomUUID(),
      parentId,
      branch,
      message,
      commandIds,
      createdAt: new Date().toISOString(),
      author,
    };

    this.commits.set(commit.id, commit);
    this.head = commit.id;
    this.branches.set(branch, { name: branch, headCommitId: commit.id });

    return commit;
  }

  getCommit(id: string): Commit | undefined {
    return this.commits.get(id);
  }

  shouldSnapshot(commitCount: number): boolean {
    return commitCount % this.snapshotInterval === 0;
  }
}
