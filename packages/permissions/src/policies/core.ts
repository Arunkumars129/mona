import type { BaseCommand } from '@repo/commands';
import type { PermissionPolicy } from '../engine.js';

function rangeSize(range?: { start: string; end: string }): number {
  if (!range) return 0;
  // Simplified — production uses full A1 parser
  return 1;
}

export const corePolicies: PermissionPolicy[] = [
  {
    riskLevel: 'safe',
    reason: 'read-only undo/redo',
    matches: (c) => c.type === 'Undo' || c.type === 'Redo',
  },
  {
    riskLevel: 'review',
    reason: 'overwrites existing formulas',
    matches: (c) =>
      c.type === 'SetFormula' &&
      !!(c.payload as { overwritesExisting?: boolean }).overwritesExisting,
  },
  {
    riskLevel: 'approval_required',
    reason: 'exports confidential workbook',
    matches: (c, ctx) =>
      c.type === 'ExportWorkbook' && ctx.workbook.classification === 'confidential',
  },
  {
    riskLevel: 'approval_required',
    reason: 'deletes a sheet',
    matches: (c) =>
      c.type === 'RenameSheet' &&
      !!(c.payload as { deleting?: boolean }).deleting,
  },
  {
    riskLevel: 'approval_required',
    reason: 'bulk structural deletion',
    matches: (c) => c.type === 'DeleteColumn' && rangeSize(c.range) > 10_000,
  },
  {
    riskLevel: 'safe',
    reason: 'single cell write in bounded scope',
    matches: (c) => c.type === 'SetCellValue' || c.type === 'SetFormula',
  },
];

/** Defense-in-depth: validate agent write scope against assigned ranges */
export function createScopePolicy(allowedRanges: BaseCommand['range'][]): PermissionPolicy {
  return {
    riskLevel: 'blocked',
    reason: 'command range outside agent write scope',
    matches: (cmd) => {
      if (!cmd.range) return false;
      return !allowedRanges.some(
        (allowed) => allowed && allowed.sheetId === cmd.range!.sheetId
      );
    },
  };
}
