"use client";

import React, { useState } from "react";
import { CloseXIcon, CompareIcon } from "./icons";

/* ─────────────────────────────────────────────────────────────────────────────
 * Compare Versions Modal Component (Bottom Center Overlay)
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
