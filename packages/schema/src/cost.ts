/**
 * Cost Tracking Schema Types
 *
 * First-class cost tracking for LLM usage, per session, per user, per workbook.
 */

import type { ModelId, ProviderId } from "./provider";
import type { TokenUsage } from "./session";

// ── Cost Entry ───────────────────────────────────────────────────────

export interface CostEntry {
  readonly id: string;
  readonly sessionId: string;
  readonly userId: string;
  readonly workbookId: string;
  readonly model: ModelId;
  readonly provider: ProviderId;
  readonly usage: TokenUsage;
  readonly costUsd: number;
  readonly timestamp: Date;
  readonly agentId?: string;
  readonly toolName?: string;
}

// ── Cost Budget ──────────────────────────────────────────────────────

export interface CostBudget {
  readonly maxCostPerSession: number;
  readonly maxCostPerDay: number;
  readonly maxCostPerMonth: number;
  readonly maxTokensPerRequest: number;
  readonly warningThreshold: number;
}

// ── Usage Report ─────────────────────────────────────────────────────

export interface UsageReport {
  readonly period: { start: Date; end: Date };
  readonly totalCostUsd: number;
  readonly totalTokens: number;
  readonly requestCount: number;
  readonly byModel: Record<ModelId, { tokens: number; cost: number; requests: number }>;
  readonly byAgent: Record<string, { tokens: number; cost: number; requests: number }>;
}

// ── Cost Tracker Interface ───────────────────────────────────────────

export interface CostTracker {
  record(entry: CostEntry): void;
  getSessionCost(sessionId: string): number;
  getUserDailyCost(userId: string): number;
  checkBudget(userId: string, estimatedCost: number): BudgetCheckResult;
  getReport(userId: string, period: { start: Date; end: Date }): UsageReport;
}

export interface BudgetCheckResult {
  readonly allowed: boolean;
  readonly remainingBudget: number;
  readonly reason?: string;
}
