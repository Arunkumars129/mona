import type { A1Range, IssuedBy, RiskLevel } from '@repo/shared';

export type CommandType =
  | 'SetCellValue'
  | 'SetFormula'
  | 'InsertRow'
  | 'DeleteColumn'
  | 'RenameSheet'
  | 'CreateChart'
  | 'FormatRange'
  | 'SortRange'
  | 'FilterRange'
  | 'MergeCells'
  | 'FreezePane'
  | 'InsertImage'
  | 'GeneratePivot'
  | 'ImportCSV'
  | 'ExportWorkbook'
  | 'CreateComment'
  | 'ResolveComment'
  | 'Undo'
  | 'Redo';

export interface BaseCommand<TPayload = unknown> {
  readonly id: string;
  readonly type: CommandType;
  readonly payload: TPayload;
  readonly issuedBy: IssuedBy;
  readonly targetSheetId: string;
  readonly range?: A1Range;
  readonly createdAt: string;
  readonly correlationId: string;
  readonly riskLevel?: RiskLevel;
}

export interface SetCellValuePayload {
  cellRef: string;
  value: unknown;
}

export interface SetFormulaPayload {
  cellRef: string;
  formula: string;
  overwritesExisting?: boolean;
}

export interface VerificationResult {
  formulaValid: boolean;
  brokenReferences: string[];
  circularDependencies: string[];
  rangeExists: boolean;
  permissionCompliant: boolean;
  chartValid?: boolean;
}

export interface CommandResult {
  commandId: string;
  status: 'applied' | 'rejected' | 'failed';
  inverse?: BaseCommand;
  verification: VerificationResult;
  error?: { code: string; message: string };
}

export type CommandHandler<T extends CommandType = CommandType> = {
  type: T;
  apply(cmd: BaseCommand, ctx: CommandContext): Promise<CommandResult>;
  computeInverse?(cmd: BaseCommand, ctx: CommandContext): BaseCommand | undefined;
};

export interface CommandContext {
  /** Spreadsheet adapter — sole path to Univer mutations */
  spreadsheet: SpreadsheetAdapter;
}

/** Minimal adapter interface; full impl in @repo/spreadsheet */
export interface SpreadsheetAdapter {
  getCellValue(sheetId: string, cellRef: string): unknown;
  getCellFormula(sheetId: string, cellRef: string): string | null;
  setCellValue(sheetId: string, cellRef: string, value: unknown): void;
  setFormula(sheetId: string, cellRef: string, formula: string): void;
  rangeExists(sheetId: string, range: A1Range): boolean;
  verifyFormula(sheetId: string, cellRef: string): VerificationResult;
}

export function createCommand<TPayload>(
  partial: Omit<BaseCommand<TPayload>, 'id' | 'createdAt'> & { id?: string }
): BaseCommand<TPayload> {
  return {
    ...partial,
    id: partial.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}
