"use client";

import React from "react";
import { CloseXIcon, ArrowRightIcon, RestoreIcon, BranchIcon, UserAvatar } from "./icons";

/* ─────────────────────────────────────────────────────────────────────────────
 * Commit Details Panel Component (Bottom Right Panel Card)
 * ───────────────────────────────────────────────────────────────────────────── */

export interface CommitDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommitDetailsPanel({ isOpen, onClose }: CommitDetailsPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "320px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        border: "1px solid #dadce0",
        zIndex: 1400,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f1f3f4" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1f1f1f" }}>Commit details</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#5f6368", padding: "2px" }}>
          <CloseXIcon />
        </button>
      </div>

      {/* Commit Info */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1f1f1f" }}>
          <span style={{ color: "#5f6368", marginRight: "4px" }}>v7</span>
          Updated groceries amount and added total row
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserAvatar letter="M" color="#1a73e8" size={24} />
          <div style={{ fontSize: "12px", color: "#5f6368" }}>
            <span style={{ fontWeight: 600, color: "#1f1f1f" }}>Mona</span> • just now (Jun 26, 2025 10:30 AM)
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: "12px", color: "#444746", backgroundColor: "#f8f9fa", padding: "8px 10px", borderRadius: "6px", border: "1px solid #f1f3f4" }}>
          Adjusted groceries budget for June. Added total calculation.
        </div>

        {/* Changes Tree */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#70757a", textTransform: "uppercase" }}>Changes</span>
          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontWeight: 600, color: "#1f1f1f" }}>v Budget</div>
            <div style={{ paddingLeft: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#5f6368" }}>B3 Groceries</span>
              <span style={{ backgroundColor: "#fce8e6", color: "#c5221f", padding: "0 4px", borderRadius: "3px" }}>8000</span>
              <ArrowRightIcon />
              <span style={{ backgroundColor: "#e6f4ea", color: "#137333", padding: "0 4px", borderRadius: "3px" }}>10000</span>
            </div>
            <div style={{ paddingLeft: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#5f6368" }}>B7 Total Amount</span>
              <span style={{ color: "#70757a" }}>(new)</span>
              <ArrowRightIcon />
              <span style={{ backgroundColor: "#e6f4ea", color: "#137333", padding: "0 4px", borderRadius: "3px" }}>50000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div style={{ padding: "10px 16px", backgroundColor: "#f8f9fa", borderTop: "1px solid #f1f3f4", display: "flex", alignItems: "center", gap: "8px" }}>
        <button style={{ flex: 1, padding: "6px 10px", fontSize: "12px", fontWeight: 500, border: "1px solid #dadce0", borderRadius: "6px", backgroundColor: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <RestoreIcon /> Restore this version
        </button>
        <button style={{ padding: "6px 10px", fontSize: "12px", fontWeight: 500, border: "1px solid #dadce0", borderRadius: "6px", backgroundColor: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <BranchIcon /> Create branch
        </button>
      </div>
    </div>
  );
}
