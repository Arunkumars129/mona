"use client";

import React, { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
 * SVG Icons for Version Control UI
 * ───────────────────────────────────────────────────────────────────────────── */

function CloseXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <line x1="3" y1="5" x2="21" y2="5" />
      <polyline points="7 23 3 19 7 15" />
      <line x1="21" y1="19" x2="3" y2="19" />
    </svg>
  );
}

function BranchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function UserAvatar({ letter = "M", color = "#1a73e8", size = 22 }: { letter?: string; color?: string; size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: color,
        color: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${size * 0.55}px`,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. Commit Changes Modal (Center Dialog)
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

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. Version History Panel (Right Sidebar)
 * ───────────────────────────────────────────────────────────────────────────── */

export interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCompare?: () => void;
}

export function VersionHistoryPanel({ isOpen, onClose, onOpenCompare }: VersionHistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<"history" | "branches">("history");
  const [selectedVersion, setSelectedVersion] = useState("v7");

  if (!isOpen) return null;

  const timeline = [
    {
      group: "Today",
      items: [
        {
          id: "v7",
          version: "v7",
          title: "Updated groceries amount and added total row",
          badge: "Current",
          user: "Mona",
          time: "just now",
        },
        {
          id: "v6",
          version: "v6",
          title: "Added total amount formula",
          user: "Mona",
          time: "5m ago",
        },
      ],
    },
    {
      group: "Yesterday",
      items: [
        {
          id: "v5",
          version: "v5",
          title: "Modified entertainment budget",
          user: "Mona",
          time: "Yesterday 4:32 PM",
        },
        {
          id: "v4",
          version: "v4",
          title: "Initial budget setup",
          user: "Mona",
          time: "Yesterday 3:10 PM",
        },
      ],
    },
    {
      group: "Jun 24, 2025",
      items: [
        {
          id: "v3",
          version: "v3",
          title: "Imported data from June sheet",
          user: "Mona",
          time: "Jun 24, 2025 11:20 AM",
        },
        {
          id: "v2",
          version: "v2",
          title: "Created budget categories",
          user: "Mona",
          time: "Jun 24, 2025 10:05 AM",
        },
        {
          id: "v1",
          version: "v1",
          title: "Workbook created",
          user: "Mona",
          time: "Jun 24, 2025 09:45 AM",
        },
      ],
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "320px",
        height: "100vh",
        backgroundColor: "#ffffff",
        boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.12)",
        zIndex: 1500,
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderLeft: "1px solid #dadce0",
      }}
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
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#1f1f1f" }}>Version history</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#5f6368", padding: "4px" }}>
          <CloseXIcon />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e0e3e7", backgroundColor: "#ffffff" }}>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "13px",
            fontWeight: activeTab === "history" ? 600 : 400,
            color: activeTab === "history" ? "#1a73e8" : "#5f6368",
            border: "none",
            borderBottom: activeTab === "history" ? "2px solid #1a73e8" : "none",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "13px",
            fontWeight: activeTab === "branches" ? 600 : 400,
            color: activeTab === "branches" ? "#1a73e8" : "#5f6368",
            border: "none",
            borderBottom: activeTab === "branches" ? "2px solid #1a73e8" : "none",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          Branches
        </button>
      </div>

      {/* History Timeline Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {timeline.map((group) => (
          <div key={group.group} style={{ marginBottom: "16px" }}>
            <div style={{ padding: "4px 20px 8px", fontSize: "11px", fontWeight: 600, color: "#70757a", textTransform: "uppercase" }}>
              {group.group}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {group.items.map((item) => {
                const isSelected = selectedVersion === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedVersion(item.id)}
                    style={{
                      padding: "10px 20px",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#e8f0fe" : "transparent",
                      borderLeft: isSelected ? "3px solid #1a73e8" : "3px solid transparent",
                      display: "flex",
                      gap: "10px",
                      transition: "background 0.1s",
                    }}
                  >
                    <div style={{ paddingTop: "2px" }}>
                      <UserAvatar letter="M" color="#1a73e8" size={24} />
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", fontWeight: isSelected ? 600 : 500, color: "#1f1f1f" }}>
                          <span style={{ fontWeight: 700, marginRight: "4px" }}>{item.version}</span>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              color: "#1a73e8",
                              backgroundColor: "#ffffff",
                              border: "1px solid #c2e7ff",
                              borderRadius: "10px",
                              padding: "1px 6px",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "11px", color: "#5f6368" }}>
                        {item.user} • {item.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Compare Button */}
      <div style={{ padding: "16px", borderTop: "1px solid #f1f3f4", backgroundColor: "#ffffff" }}>
        <button
          onClick={onOpenCompare}
          style={{
            width: "100%",
            padding: "9px 16px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#3c4043",
            backgroundColor: "#ffffff",
            border: "1px solid #dadce0",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <CompareIcon />
          <span>Compare versions</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 3. Changes In This Commit Card (Floating Card - Bottom Left)
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

/* ─────────────────────────────────────────────────────────────────────────────
 * 4. Compare Versions Modal (Bottom Center Overlay)
 * ───────────────────────────────────────────────────────────────────────────── */

export interface CompareVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompareVersionsModal({ isOpen, onClose }: CompareVersionsModalProps) {
  const [highlightChanges, setHighlightChanges] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 1900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "860px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f1f3f4" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#1f1f1f" }}>Compare versions</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#5f6368", padding: "4px" }}>
            <CloseXIcon />
          </button>
        </div>

        {/* Controls & Selectors Bar */}
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e3e7", flexWrap: "wrap", gap: "12px" }}>
          {/* Version dropdown selectors */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select style={{ padding: "6px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid #dadce0", backgroundColor: "#ffffff" }}>
              <option>v6 (5m ago)</option>
              <option>v5 (Yesterday)</option>
            </select>

            <CompareIcon />

            <select style={{ padding: "6px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid #dadce0", backgroundColor: "#ffffff" }}>
              <option>v7 (just now)</option>
            </select>
          </div>

          {/* View Toggles */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "#5f6368", fontWeight: 500 }}>2 changes</span>
            <div style={{ display: "flex", backgroundColor: "#e0e3e7", borderRadius: "6px", padding: "2px" }}>
              <button style={{ padding: "4px 10px", fontSize: "12px", fontWeight: 600, border: "none", borderRadius: "4px", backgroundColor: "#ffffff", color: "#1a73e8", cursor: "pointer" }}>
                Sheet view
              </button>
              <button style={{ padding: "4px 10px", fontSize: "12px", fontWeight: 400, border: "none", borderRadius: "4px", backgroundColor: "transparent", color: "#5f6368", cursor: "pointer" }}>
                Cell list
              </button>
            </div>

            {/* Toggle Highlight Changes */}
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "#3c4043" }}>
              Highlight changes
              <input type="checkbox" checked={highlightChanges} onChange={(e) => setHighlightChanges(e.target.checked)} style={{ cursor: "pointer" }} />
            </label>

            <button style={{ padding: "5px 10px", fontSize: "12px", border: "1px solid #dadce0", borderRadius: "6px", backgroundColor: "#ffffff", cursor: "pointer" }}>
              Filters
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Tables */}
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#ffffff" }}>
          {/* Left Table (v6) */}
          <div style={{ border: "1px solid #e0e3e7", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", backgroundColor: "#f1f3f4", fontSize: "12px", fontWeight: 600, color: "#1a73e8" }}>
              Budget (v6)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e3e7" }}>
                  <th style={{ padding: "6px 10px", textAlign: "left", width: "30px", borderRight: "1px solid #e0e3e7", color: "#70757a" }}>#</th>
                  <th style={{ padding: "6px 10px", textAlign: "left", borderRight: "1px solid #e0e3e7" }}>A: Category</th>
                  <th style={{ padding: "6px 10px", textAlign: "right" }}>B: Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>1</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Rent</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>15000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f3f4", backgroundColor: highlightChanges ? "#fce8e6" : "transparent" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>2</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Groceries</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", color: highlightChanges ? "#c5221f" : "inherit", fontWeight: highlightChanges ? 600 : 400 }}>8000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>3</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Utilities</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>5000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>4</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Entertainment</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>5000</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>5</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Savings/Misc</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>15000</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Table (v7) */}
          <div style={{ border: "1px solid #e0e3e7", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", backgroundColor: "#f1f3f4", fontSize: "12px", fontWeight: 600, color: "#1a73e8" }}>
              Budget (v7)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e3e7" }}>
                  <th style={{ padding: "6px 10px", textAlign: "left", width: "30px", borderRight: "1px solid #e0e3e7", color: "#70757a" }}>#</th>
                  <th style={{ padding: "6px 10px", textAlign: "left", borderRight: "1px solid #e0e3e7" }}>A: Category</th>
                  <th style={{ padding: "6px 10px", textAlign: "right" }}>B: Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>1</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Rent</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>15000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f3f4", backgroundColor: highlightChanges ? "#e6f4ea" : "transparent" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>2</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Groceries</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", color: highlightChanges ? "#137333" : "inherit", fontWeight: highlightChanges ? 600 : 400 }}>10000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>3</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Utilities</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>5000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>4</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Entertainment</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>5000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>5</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4" }}>Savings/Misc</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>15000</td>
                </tr>
                <tr style={{ backgroundColor: highlightChanges ? "#f3e8fd" : "transparent" }}>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", color: "#70757a" }}>6</td>
                  <td style={{ padding: "6px 10px", borderRight: "1px solid #f1f3f4", fontWeight: 600 }}>Total Amount</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                    <span>50000</span>
                    <span style={{ fontSize: "10px", backgroundColor: "#9333ea", color: "#ffffff", padding: "1px 5px", borderRadius: "8px" }}>New</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend Footer */}
        <div style={{ padding: "10px 20px", backgroundColor: "#f8f9fa", borderTop: "1px solid #f1f3f4", display: "flex", gap: "16px", fontSize: "12px", color: "#5f6368" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "4px", backgroundColor: "#34a853", borderRadius: "1px" }} /> Added
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "4px", backgroundColor: "#fbbc04", borderRadius: "1px" }} /> Modified
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "4px", backgroundColor: "#ea4335", borderRadius: "1px" }} /> Deleted
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 5. Commit Details Panel (Bottom Right Panel Card)
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
