"use client";

import React from "react";
import { Loader2 } from "lucide-react";

const LoaderIcon = Loader2 as unknown as React.ComponentType<{
  style?: React.CSSProperties;
  className?: string;
}>;

/**
 * Professional skeleton screen mimicking an active spreadsheet grid
 * while the WebGL/Canvas UniverJS engine initializes on the client.
 *
 * This file has NO dependencies on @univerjs/* or @repo/sheet-core,
 * making it completely safe for SSR rendering.
 */
export function UniverSkeleton() {
  const columns = Array.from({ length: 15 }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const rows = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "#ffffff",
        userSelect: "none",
        overflow: "hidden",
        minHeight: "600px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Skeleton Toolbar */}
      <div
        style={{
          height: "40px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        {[32, 32, 32, 64, 48].map((w, i) => (
          <div
            key={i}
            style={{
              height: "20px",
              width: `${w}px`,
              borderRadius: "4px",
              backgroundColor: "#cbd5e1",
            }}
          />
        ))}
        <div
          style={{
            height: "20px",
            width: "96px",
            borderRadius: "4px",
            backgroundColor: "#cbd5e1",
            marginLeft: "auto",
          }}
        />
      </div>

      {/* Skeleton Formula Bar */}
      <div
        style={{
          height: "32px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f1f5f9",
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "20px",
            width: "32px",
            borderRadius: "4px",
            backgroundColor: "#cbd5e1",
          }}
        />
        <div
          style={{
            height: "16px",
            width: "16px",
            borderRadius: "4px",
            backgroundColor: "#cbd5e1",
          }}
        />
        <div
          style={{
            height: "20px",
            flex: 1,
            borderRadius: "4px",
            backgroundColor: "#e2e8f0",
          }}
        />
      </div>

      {/* Skeleton Grid with Loader Overlay */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#fafafa",
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(2px)",
            zIndex: 50,
            gap: "8px",
          }}
        >
          <LoaderIcon
            style={{
              width: "24px",
              height: "24px",
              color: "#10b981",
              animation: "univer-spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes univer-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#475569",
            }}
          >
            Initializing Spreadsheet Engine...
          </span>
        </div>

        <table
          style={{
            borderCollapse: "collapse",
            tableLayout: "fixed",
            width: "100%",
            minWidth: "1000px",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "40px",
                  height: "24px",
                  backgroundColor: "#f1f5f9",
                  borderRight: "1px solid #cbd5e1",
                  borderBottom: "1px solid #cbd5e1",
                  position: "sticky",
                  top: 0,
                  left: 0,
                  zIndex: 30,
                }}
              />
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    width: "96px",
                    height: "24px",
                    backgroundColor: "#f8fafc",
                    borderRight: "1px solid #cbd5e1",
                    borderBottom: "1px solid #cbd5e1",
                    textAlign: "center",
                    fontSize: "10px",
                    color: "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowVal) => (
              <tr key={rowVal}>
                <td
                  style={{
                    height: "24px",
                    backgroundColor: "#f8fafc",
                    borderRight: "1px solid #cbd5e1",
                    borderBottom: "1px solid #cbd5e1",
                    textAlign: "center",
                    fontSize: "10px",
                    color: "#94a3b8",
                    fontWeight: 700,
                    position: "sticky",
                    left: 0,
                    zIndex: 10,
                  }}
                >
                  {rowVal}
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      height: "24px",
                      borderRight: "1px solid #e2e8f0",
                      borderBottom: "1px solid #e2e8f0",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
