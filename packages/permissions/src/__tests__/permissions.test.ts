import { describe, it, expect } from 'vitest';
import { PermissionEngine, type PermissionPolicy, type PermissionDecision } from '../engine';
import { corePolicies, createScopePolicy } from '../policies/core';
import { createCommand, type BaseCommand } from '@repo/commands';
import type { PolicyContext } from '@repo/shared';

/* ── Helpers ──────────────────────────────────────────────── */

const defaultCtx: PolicyContext = {
  workbook: { id: 'wb-1', classification: 'internal' },
  actorRole: 'editor',
  tenantId: 'tenant-1',
};

const confidentialCtx: PolicyContext = {
  workbook: { id: 'wb-2', classification: 'confidential' },
  actorRole: 'editor',
  tenantId: 'tenant-1',
};

function makeCmd(overrides: Partial<BaseCommand> = {}): BaseCommand {
  return createCommand({
    type: 'SetCellValue',
    payload: { cellRef: 'A1', value: 42 },
    issuedBy: { kind: 'agent', id: 'test-agent' },
    targetSheetId: 'sheet-1',
    correlationId: 'corr-1',
    ...overrides,
  });
}

/* ── Tests ────────────────────────────────────────────────── */

describe('PermissionEngine', () => {
  describe('core policy matrix', () => {
    it('allows SetCellValue (safe)', () => {
      const engine = new PermissionEngine(corePolicies, defaultCtx);
      const decision = engine.evaluate(makeCmd({ type: 'SetCellValue' }));

      expect(decision.decision).toBe('allow');
      expect(decision.riskLevel).toBe('safe');
    });

    it('allows SetFormula without overwrite (safe)', () => {
      const engine = new PermissionEngine(corePolicies, defaultCtx);
      const decision = engine.evaluate(
        makeCmd({
          type: 'SetFormula',
          payload: { cellRef: 'A1', formula: '=SUM(A:A)', overwritesExisting: false },
        })
      );

      expect(decision.decision).toBe('allow');
      expect(decision.riskLevel).toBe('safe');
    });

    it('allows SetFormula with overwrite at review risk level', () => {
      const engine = new PermissionEngine(corePolicies, defaultCtx);
      const decision = engine.evaluate(
        makeCmd({
          type: 'SetFormula',
          payload: { cellRef: 'A1', formula: '=SUM(A:A)', overwritesExisting: true },
        })
      );

      // Review matches, but safe also matches. Highest risk (worst) wins:
      // The reduce picks the one with lower index in riskOrder, which is 'review' (index 2) vs 'safe' (index 3).
      // So 'review' has lower index = higher risk. Result should be 'allow' because review = allow.
      expect(decision.decision).toBe('allow');
      expect(decision.riskLevel).toBe('review');
    });

    it('allows Undo (safe)', () => {
      const engine = new PermissionEngine(corePolicies, defaultCtx);
      const decision = engine.evaluate(makeCmd({ type: 'Undo' }));

      expect(decision.decision).toBe('allow');
      expect(decision.riskLevel).toBe('safe');
    });

    it('allows Redo (safe)', () => {
      const engine = new PermissionEngine(corePolicies, defaultCtx);
      const decision = engine.evaluate(makeCmd({ type: 'Redo' }));

      expect(decision.decision).toBe('allow');
      expect(decision.riskLevel).toBe('safe');
    });

    it('requires approval for ExportWorkbook on confidential', () => {
      const engine = new PermissionEngine(corePolicies, confidentialCtx);
      const decision = engine.evaluate(
        makeCmd({ type: 'ExportWorkbook' })
      );

      expect(decision.decision).toBe('pending');
      expect(decision.riskLevel).toBe('approval_required');
    });

    it('denies unrecognized command type (no policy match → deny by default)', () => {
      const engine = new PermissionEngine(corePolicies, defaultCtx);
      const decision = engine.evaluate(
        makeCmd({ type: 'InsertImage' as any })
      );

      expect(decision.decision).toBe('deny');
      expect(decision.riskLevel).toBe('blocked');
      expect(decision.reason).toContain('no policy matched');
    });
  });

  describe('evaluateBatch', () => {
    it('evaluates each command independently', () => {
      const engine = new PermissionEngine(corePolicies, defaultCtx);
      const cmds = [
        makeCmd({ type: 'SetCellValue' }),
        makeCmd({ type: 'Undo' }),
      ];

      const decisions = engine.evaluateBatch(cmds);

      expect(decisions).toHaveLength(2);
      expect(decisions[0]!.decision).toBe('allow');
      expect(decisions[1]!.decision).toBe('allow');
    });
  });

  describe('createScopePolicy', () => {
    it('blocks commands outside allowed scope', () => {
      const policy = createScopePolicy([
        { sheetId: 'allowed-sheet', start: 'A1', end: 'Z100' },
      ]);

      const cmd = makeCmd({
        range: { sheetId: 'other-sheet', start: 'A1', end: 'A1' },
      });

      expect(policy.matches(cmd, defaultCtx)).toBe(true);
      expect(policy.riskLevel).toBe('blocked');
    });

    it('does not block commands within allowed scope', () => {
      const policy = createScopePolicy([
        { sheetId: 'allowed-sheet', start: 'A1', end: 'Z100' },
      ]);

      const cmd = makeCmd({
        range: { sheetId: 'allowed-sheet', start: 'A1', end: 'A1' },
      });

      expect(policy.matches(cmd, defaultCtx)).toBe(false);
    });

    it('does not block commands without a range', () => {
      const policy = createScopePolicy([
        { sheetId: 'allowed-sheet', start: 'A1', end: 'Z100' },
      ]);

      const cmd = makeCmd(); // no range
      expect(policy.matches(cmd, defaultCtx)).toBe(false);
    });
  });
});
