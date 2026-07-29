/**
 * Permission Schema Types
 *
 * First-class permission model for cell, sheet, and workbook-level access control.
 */

import type { RangeRef } from "./workbook";
import type { Permission } from "./tool";

// ── Access Policy ────────────────────────────────────────────────────

export type AccessLevel = "none" | "read" | "write" | "admin";

export interface AccessPolicy {
  readonly userId: string;
  readonly workbookId: string;
  readonly level: AccessLevel;
  readonly sheetOverrides?: Record<string, AccessLevel>;
  readonly rangeOverrides?: RangeAccessOverride[];
  readonly deniedPermissions?: Permission[];
}

export interface RangeAccessOverride {
  readonly range: RangeRef;
  readonly level: AccessLevel;
}

// ── Permission Check ─────────────────────────────────────────────────

export interface PermissionCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly requiredLevel: AccessLevel;
  readonly actualLevel: AccessLevel;
}

// ── Permission Engine Interface ──────────────────────────────────────

export interface PermissionEngine {
  check(userId: string, workbookId: string, permission: Permission, target?: RangeRef): PermissionCheckResult;
  getPolicy(userId: string, workbookId: string): AccessPolicy;
  setPolicy(policy: AccessPolicy): void;
  requiresApproval(permission: Permission): boolean;
}

// ── Destructive Action Guard ─────────────────────────────────────────

/**
 * Destructive actions (delete sheet, overwrite large ranges, etc.)
 * require human approval before execution.
 */
export interface ApprovalRequest {
  readonly id: string;
  readonly sessionId: string;
  readonly action: string;
  readonly description: string;
  readonly severity: "low" | "medium" | "high" | "critical";
  readonly status: "pending" | "approved" | "rejected";
  readonly createdAt: Date;
}
