"use client";

import React from "react";
import { CloseXIcon, ArrowRightIcon } from "./icons";

/* ─────────────────────────────────────────────────────────────────────────────
 * Changes In This Commit Card Component (Floating Popover - Bottom Left)
 * ───────────────────────────────────────────────────────────────────────────── */

export interface ChangesInCommitCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangesInCommitCard({ isOpen, onClose }: ChangesInCommitCardProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "24px",
        width: "280px",
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",
        border: "1px solid #e0e3e7",
        zIndex: 1400,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid #f1f3f4" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1f1f1f" }}>Changes in this commit (v7)</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#5f6368", padding: "2px" }}>
          <CloseXIcon />
        </button>
      </div>

      {/* Sheet & count info */}
      <div style={{ padding: "10px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#1f1f1f" }}>v Sheet: Budget</span>
        <span style={{ fontSize: "11px", color: "#5f6368", backgroundColor: "#f1f3f4", padding: "2px 6px", borderRadius: "10px" }}>
          2 changes
        </span>
      </div>

      {/* Changed Cells List */}
      <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Row B3 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: "#5f6368", minWidth: "24px" }}>B3</span>
          <span style={{ color: "#1f1f1f", flex: 1, marginLeft: "8px" }}>Groceries</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ backgroundColor: "#fce8e6", color: "#c5221f", padding: "1px 6px", borderRadius: "4px", textDecoration: "line-through" }}>
              8000
            </span>
            <ArrowRightIcon />
            <span style={{ backgroundColor: "#e6f4ea", color: "#137333", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
              10000
            </span>
          </div>
        </div>

        {/* Row B7 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: "#5f6368", minWidth: "24px" }}>B7</span>
          <span style={{ color: "#1f1f1f", flex: 1, marginLeft: "8px" }}>Total Amount</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#70757a" }}>(new)</span>
            <ArrowRightIcon />
            <span style={{ backgroundColor: "#e6f4ea", color: "#137333", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
              50000
            </span>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div style={{ padding: "8px 14px", backgroundColor: "#f8f9fa", borderTop: "1px solid #f1f3f4", display: "flex", gap: "12px", fontSize: "11px", color: "#5f6368" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "3px", backgroundColor: "#34a853", borderRadius: "1px" }} /> Added
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "3px", backgroundColor: "#fbbc04", borderRadius: "1px" }} /> Modified
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "3px", backgroundColor: "#ea4335", borderRadius: "1px" }} /> Deleted
        </span>
      </div>
    </div>
  );
}
