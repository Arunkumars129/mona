import type { A1Range, RiskLevel } from '@repo/shared';
import type { CommandType } from '@repo/commands';

export interface BaseEvent {
  correlationId: string;
  at: string;
}

export type MonaEvent =
  | (BaseEvent & { type: 'WorkbookOpened'; workbookId: string; userId: string })
  | (BaseEvent & { type: 'SheetCreated'; sheetId: string; workbookId: string })
  | (BaseEvent & { type: 'SelectionChanged'; sheetId: string; range: A1Range; userId: string })
  | (BaseEvent & { type: 'CellEdited'; commandId: string; cellRef: string; before: unknown; after: unknown })
  | (BaseEvent & { type: 'FormulaCalculated'; cellRef: string; result: unknown; durationMs: number })
  | (BaseEvent & { type: 'ChartGenerated'; chartId: string; commandId: string })
  | (BaseEvent & { type: 'UndoExecuted'; commandId: string })
  | (BaseEvent & { type: 'AgentStarted'; agentId: string; taskId: string })
  | (BaseEvent & { type: 'AgentFinished'; agentId: string; taskId: string; status: 'ok' | 'error' })
  | (BaseEvent & { type: 'PermissionRequested'; commandId: string; riskLevel: RiskLevel; decision: 'allow' | 'deny' | 'pending'; reason: string })
  | (BaseEvent & { type: 'VersionCreated'; commitId: string; parentId: string | null; message: string })
  | (BaseEvent & { type: 'CommandExecuted'; commandId: string; commandType: CommandType; status: string })
  | (BaseEvent & { type: 'TurnStarted'; turnId: string; userId: string; workbookId: string })
  | (BaseEvent & { type: 'TurnFinished'; turnId: string; status: 'ok' | 'error' | 'cancelled' });

export type EventHandler = (event: MonaEvent) => void | Promise<void>;
export type Unsubscribe = () => void;
