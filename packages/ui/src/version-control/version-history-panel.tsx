"use client";

import React, { useState } from "react";
import { CloseXIcon, CompareIcon, UserAvatar } from "./icons";

/* ─────────────────────────────────────────────────────────────────────────────
 * Version History Panel Component (Right Sidebar)
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
