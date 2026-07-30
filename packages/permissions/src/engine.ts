import type { BaseCommand } from '@repo/commands';
import type { PolicyContext, RiskLevel } from '@repo/shared';

export interface PermissionPolicy {
  matches(cmd: BaseCommand, ctx: PolicyContext): boolean;
  riskLevel: RiskLevel;
  reason: string;
}

export interface PermissionDecision {
  decision: 'allow' | 'deny' | 'pending';
  riskLevel: RiskLevel;
  reason: string;
}

export class PermissionEngine {
  constructor(
    private policies: PermissionPolicy[],
    private ctx: PolicyContext
  ) {}

  evaluate(cmd: BaseCommand): PermissionDecision {
    const matched = this.policies.filter((p) => p.matches(cmd, this.ctx));
    if (matched.length === 0) {
      return {
        decision: 'deny',
        riskLevel: 'blocked',
        reason: 'no policy matched — deny by default',
      };
    }

    const highest = matched.reduce((best, p) =>
      riskOrder(p.riskLevel) < riskOrder(best.riskLevel) ? p : best
    );

    if (highest.riskLevel === 'blocked') {
      return { decision: 'deny', riskLevel: 'blocked', reason: highest.reason };
    }
    if (highest.riskLevel === 'approval_required') {
      return { decision: 'pending', riskLevel: highest.riskLevel, reason: highest.reason };
    }
    return { decision: 'allow', riskLevel: highest.riskLevel, reason: highest.reason };
  }

  evaluateBatch(cmds: BaseCommand[]): PermissionDecision[] {
    return cmds.map((c) => this.evaluate(c));
  }
}

function riskOrder(r: RiskLevel): number {
  const order: RiskLevel[] = ['blocked', 'approval_required', 'review', 'safe'];
  return order.indexOf(r);
}
