export type AgentId = string;

export type Capability =
  | 'formula'
  | 'chart'
  | 'formatting'
  | 'cleaning'
  | 'sql'
  | 'python'
  | 'visualization'
  | 'pivot'
  | 'import'
  | 'export'
  | 'version'
  | 'automation'
  | 'review'
  | 'audit'
  | 'comment'
  | 'assistant'
  | 'mcp';

export type RiskLevel = 'safe' | 'review' | 'approval_required' | 'blocked';

export type ActorRole = 'viewer' | 'editor' | 'admin';

export type WorkbookClassification = 'public' | 'internal' | 'confidential';

export interface A1Range {
  sheetId: string;
  start: string;
  end: string;
}

export interface IssuedBy {
  kind: 'agent' | 'user' | 'system';
  id: string;
}

export interface PolicyContext {
  workbook: {
    id: string;
    classification: WorkbookClassification;
  };
  actorRole: ActorRole;
  tenantId: string;
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface WorkbookMetadata {
  id: string;
  name: string;
  sheetNames: string[];
  ownerId: string;
  classification: WorkbookClassification;
}

export interface SheetSummary {
  id: string;
  name: string;
  rowCount: number;
  colCount: number;
}

export interface NamedRange {
  name: string;
  range: A1Range;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'formula' | 'reference' | 'chart';
}

export interface CellEditSummary {
  cellRef: string;
  before: unknown;
  after: unknown;
  timestamp: string;
}

export interface CommitSummary {
  id: string;
  message: string;
  authorId: string;
  createdAt: string;
}

export type MemoryScope = 'session' | 'workbook' | 'workspace' | 'user';

export interface MemoryHit {
  key: string;
  value: unknown;
  score: number;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function pickHighestRisk<T extends { riskLevel: RiskLevel }>(
  items: T[]
): T | undefined {
  const order: RiskLevel[] = ['blocked', 'approval_required', 'review', 'safe'];
  return items.sort(
    (a, b) => order.indexOf(a.riskLevel) - order.indexOf(b.riskLevel)
  )[0];
}
