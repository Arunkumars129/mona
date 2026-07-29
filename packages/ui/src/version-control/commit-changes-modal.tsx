"use client";

import React, { useState } from "react";
import { CloseXIcon, RefreshIcon } from "./icons";

/* ─────────────────────────────────────────────────────────────────────────────
 * Commit Changes Modal Component (Center Dialog)
 * ───────────────────────────────────────────────────────────────────────────── */

export interface CommitChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit?: (msg: string, desc: string) => void;
}

export function CommitChangesModal({ isOpen, onClose, onCommit }: CommitChangesModalProps) {
  const [commitMsg, setCommitMsg] = useState("Updated groceries amount and added total row");
  const [desc, setDesc] = useState("Adjusted groceries budget for June. Added total calculation.");
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          animation: "modalFadeIn 0.18s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #f1f3f4",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#1f1f1f" }}>Commit changes</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#5f6368", padding: "4px", display: "flex" }}
          >
            <CloseXIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Commit Message */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#444746" }}>Commit message</label>
            <input
              type="text"
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                border: "1px solid #dadce0",
                borderRadius: "6px",
                outline: "none",
                color: "#1f1f1f",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Description (optional) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#444746" }}>Description (optional)</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                border: "1px solid #dadce0",
                borderRadius: "6px",
                outline: "none",
                color: "#1f1f1f",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Summary Box */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#444746" }}>Summary</span>
            <div
              style={{
                border: "1px solid #e0e3e7",
                borderRadius: "8px",
                padding: "12px 14px",
                backgroundColor: "#f8f9fa",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#3c4043", fontWeight: 500 }}>
                  <RefreshIcon /> 2 changes
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#137333", fontWeight: 600 }}>
                  + 1 addition
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#c5221f", fontWeight: 600 }}>
                  ✕ 0 deletions
                </span>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "12px",
                  color: "#1a73e8",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: 500,
                }}
              >
                {showDetails ? "Hide changes ▲" : "Show changes v"}
              </button>

              {showDetails && (
                <div style={{ paddingTop: "6px", borderTop: "1px solid #e0e3e7", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ color: "#3c4043" }}>• <strong>B3</strong> Groceries: 8000 → 10000</div>
                  <div style={{ color: "#137333" }}>• <strong>B7</strong> Total Amount: (new) → 50000</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            padding: "12px 20px",
            borderTop: "1px solid #f1f3f4",
            backgroundColor: "#ffffff",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#3c4043",
              backgroundColor: "#ffffff",
              border: "1px solid #dadce0",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (onCommit) onCommit(commitMsg, desc);
              onClose();
            }}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: "#1a73e8",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(26,115,232,0.3)",
            }}
          >
            Commit changes
          </button>
        </div>
      </div>
    </div>
  );
}
