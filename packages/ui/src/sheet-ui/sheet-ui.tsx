"use client";
/* eslint-disable */

import React, { useEffect, useRef, useState } from "react";
import {
    createUniver,
    LocaleType,
    createSheetPreset,
    getPresetLocales,
    getSalesForecastData,
    registerCustomMenuItems,
    HomeRibbonPlugin,
} from "@repo/sheet-core";

import "@univerjs/preset-sheets-core/lib/index.css";
import { UniverSkeleton } from "./univer-skeleton";
import AiPanel from "./ai-panel";
import { setUniverAPI, saveWorkbook, downloadWorkbook, loadSavedWorkbook } from "./univer-bridge";
import {
    CommitChangesModal,
    VersionHistoryPanel,
    ChangesInCommitCard,
    CompareVersionsModal,
    CommitDetailsPanel,
} from "./version-control-components";

export { UniverSkeleton, AiPanel };

/* ── Inline SVG Icons matching Google Sheets Header ── */

function GoogleSheetsLogo({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="#0F9D58" />
            <path d="M10 11H26V25H10V11Z" fill="white" fillOpacity="0.2" />
            <path d="M10 11H26V16H10V11Z" fill="white" />
            <path d="M10 18H17V25H10V18Z" fill="white" />
            <path d="M19 18H26V25H19V18Z" fill="white" />
        </svg>
    );
}

function StarIcon({ isStarred }: { isStarred?: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isStarred ? "#f4b400" : "none"} stroke={isStarred ? "#f4b400" : "#5f6368"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

// function CommentBubbleIcon() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//     </svg>
//   );
// }

// function VideoCallIcon() {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#444746" }}>
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <polygon points="23 7 16 12 23 17 23 7" />
//         <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
//       </svg>
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M6 9l6 6 6-6" />
//       </svg>
//     </div>
//   );
// }

function LockIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function GeminiHeaderSparkle({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 16.4771 12 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
                fill="url(#header-gemini-grad)"
            />
            <defs>
                <linearGradient id="header-gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1A73E8" />
                    <stop offset="0.5" stopColor="#9B51E0" />
                    <stop offset="1" stopColor="#EA4335" />
                </linearGradient>
            </defs>
        </svg>
    );
}

function ProfileAvatar() {
    return (
        <div
            style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1a73e8 0%, #34a853 50%, #fbbc04 100%)",
                padding: "2px",
                boxSizing: "border-box",
                cursor: "pointer",
            }}
            title="Google Account"
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundColor: "#1a73e8",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "14px",
                }}
            >
                M
            </div>
        </div>
    );
}

function SunIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

/* ──────────────────────────────────────────────
 * SheetUI — Main Univer spreadsheet component
 * ────────────────────────────────────────────── */

export interface SheetUIProps {
    /** Custom header title displayed above the spreadsheet */
    headerTitle?: string;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles for the root container */
    style?: React.CSSProperties;
    /** Callback fired when the Univer API is ready */
    onReady?: (univerAPI: any) => void;
}

export function SheetUI({
    headerTitle = "Untitled spreadsheet",
    className,
    style,
    onReady,
}: SheetUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [docTitle, setDocTitle] = useState(headerTitle);
    const [isStarred, setIsStarred] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const univerRef = useRef<any>(null);
    const sidebarRef = useRef<any>(null);

    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Version Control UI state
    const [isCommitModalOpen, setIsCommitModalOpen] = useState(true);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(true);
    const [isChangesCardOpen, setIsChangesCardOpen] = useState(true);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(true);
    const [isCommitDetailsOpen, setIsCommitDetailsOpen] = useState(true);

    const closeSidebar = () => {
        if (sidebarRef.current) {
            try { sidebarRef.current.dispose(); } catch { /* ignore */ }
            sidebarRef.current = null;
        }
    };

    const handleSave = () => {
        if (saveWorkbook()) {
            setSaveStatus("Saved");
            setTimeout(() => setSaveStatus(null), 2000);
        }
    };

    const handleDownload = () => {
        if (downloadWorkbook()) {
            setSaveStatus("Downloaded");
            setTimeout(() => setSaveStatus(null), 2000);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        let resizeTimer: ReturnType<typeof setTimeout>;

        try {
            const { univerAPI } = createUniver({
                locale: LocaleType.EN_US,
                locales: getPresetLocales(),
                darkMode: false,
                presets: [
                    createSheetPreset({
                        container: containerRef.current,
                        header: true,
                        footer: true,
                        toolbar: true,
                        formulaBar: true,
                    }),
                ],
            });

            univerRef.current = univerAPI;
            setUniverAPI(univerAPI);

            // Load saved workbook or default sales forecast
            const saved = loadSavedWorkbook();
            if (saved) {
                univerAPI.createWorkbook(saved);
            } else {
                univerAPI.createWorkbook(getSalesForecastData());
            }

            // Register AI copilot component
            univerAPI.registerComponent("AiCopilotPanel", () => (
                <AiPanel darkMode={false} onClose={closeSidebar} />
            ));

            // Register custom plugin menu commands
            registerCustomMenuItems(univerAPI, [
                { id: "mona.menu.monaai", title: "Mona", action: () => toggleSidebar() },
            ]);

            setIsLoaded(true);

            if (onReady) {
                onReady(univerAPI);
            }

            resizeTimer = setTimeout(() => {
                window.dispatchEvent(new Event("resize"));
            }, 100);
        } catch (err) {
            console.error("Failed to initialize Univer sheet engine:", err);
        }

        return () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            if (sidebarRef.current) {
                try { sidebarRef.current.dispose(); } catch { /* ignore */ }
                sidebarRef.current = null;
            }
            if (univerRef.current) {
                try {
                    univerRef.current.dispose();
                } catch {
                    // ignore cleanup error
                }
                univerRef.current = null;
            }
        };
    }, []);

    const toggleSidebar = () => {
        const api = univerRef.current;
        if (!api) return;
        if (sidebarRef.current) {
            closeSidebar();
        } else {
            sidebarRef.current = api.openSidebar({
                header: { title: "Mona" },
                children: { label: "AiCopilotPanel" },
                width: 380,
                onClose: () => {
                    sidebarRef.current = null;
                },
            });
        }
    };

    const toggleDark = () => {
        const api = univerRef.current;
        if (!api) return;
        const next = !darkMode;
        api.toggleDarkMode(next);
        api.registerComponent("AiCopilotPanel", () => (
            <AiPanel darkMode={next} onClose={closeSidebar} />
        ));

        if (sidebarRef.current) {
            closeSidebar();
            sidebarRef.current = api.openSidebar({
                header: { title: "Mona" },
                children: { label: "AiCopilotPanel" },
                width: 380,
                onClose: () => { sidebarRef.current = null; },
            });
        }
        setDarkMode(next);
    };

    const menuItems = [
        ""
        // { name: "File", commandId: "mona.menu.file" },
        // { name: "Edit", commandId: "mona.menu.edit" },
        // { name: "View", commandId: "mona.menu.view" },
        // { name: "Insert", commandId: "mona.menu.insert" },
        // { name: "Format", commandId: "mona.menu.format" },
        // { name: "Data", commandId: "mona.menu.data" },
        // { name: "Tools", commandId: "mona.menu.tools" },
        // { name: "Mona", commandId: "mona.menu.gemini", isHighlighted: true },
        // { name: "Extensions", commandId: "mona.menu.extensions" },
        // { name: "Help", commandId: "mona.menu.help" },
    ];

    return (
        <div
            className={className}
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                minHeight: "650px",
                overflow: "hidden",
                backgroundColor: darkMode ? "#18181b" : "#f9fbfd",
                fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                ...style,
            }}
        >
            {/* ── Top Google Sheets Header Bar ──────────────────────────────────── */}
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 16px 4px 14px",
                    backgroundColor: darkMode ? "#1f1f1f" : "#f9fbfd",
                    borderBottom: `1px solid ${darkMode ? "#27272a" : "#e0e3e7"}`,
                    flexShrink: 0,
                }}
            >
                {/* Left: Green Logo + Title + Menu Bar */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ paddingTop: "2px", cursor: "pointer" }} title="Sheets home">
                        <GoogleSheetsLogo size={32} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {/* Document Title & Star */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 500,
                                    color: darkMode ? "#e8eaed" : "#1f1f1f",
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontFamily: "inherit",
                                    width: "180px",
                                    borderRadius: "4px",
                                    padding: "1px 4px",
                                }}
                            />
                            <button
                                onClick={() => setIsStarred(!isStarred)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex" }}
                                title={isStarred ? "Starred" : "Star document"}
                            >
                                <StarIcon isStarred={isStarred} />
                            </button>
                        </div>

                        {/* Menu Bar Row */}
                        {/* <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === "Gemini") {
                      toggleSidebar();
                    } else if (univerRef.current) {
                      try {
                        univerRef.current.executeCommand(item.commandId);
                      } catch {
                      
                      }
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: item.isHighlighted ? "#1a73e8" : darkMode ? "#9aa0a6" : "#444746",
                    padding: "3px 7px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkMode ? "#292a2d" : "#eaeef4")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {item.isHighlighted ? <strong>{item.name}</strong> : item.name}
                </button>
              ))}
            </div> */}
                    </div>
                </div>

                {/* Right: Comments + Video + Share + Gemini Sparkle + Profile Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex" }} title="Open comment history">
                        {/* <CommentBubbleIcon /> */}
                    </button>

                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex" }} title="Start or join a video call">
                        {/* <VideoCallIcon /> */}
                    </button>

                    {/* Google Sheets Light Blue Share Button */}
                    <button
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "#c2e7ff",
                            color: "#001d35",
                            fontSize: "14px",
                            fontWeight: 600,
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b3e0ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c2e7ff")}
                    >
                        <LockIcon />
                        <span>Share</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    {/* Version Control Header Controls */}
                    <button
                        onClick={() => setIsCommitModalOpen(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#1a73e8",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 600,
                            padding: "7px 14px",
                            borderRadius: "18px",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(26,115,232,0.25)",
                        }}
                    >
                        <span>Commit changes</span>
                    </button>

                    <button
                        onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                        title="Toggle Version History"
                        style={{
                            background: isHistoryPanelOpen ? "#e8f0fe" : "#ffffff",
                            border: "1px solid #dadce0",
                            cursor: "pointer",
                            padding: "6px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: isHistoryPanelOpen ? "#1a73e8" : "#3c4043",
                        }}
                    >
                        History
                    </button>

                    <button
                        onClick={() => setIsCompareModalOpen(!isCompareModalOpen)}
                        title="Toggle Compare Versions"
                        style={{
                            background: isCompareModalOpen ? "#e8f0fe" : "#ffffff",
                            border: "1px solid #dadce0",
                            cursor: "pointer",
                            padding: "6px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: isCompareModalOpen ? "#1a73e8" : "#3c4043",
                        }}
                    >
                        Compare
                    </button>

                    {/* Save Status Indicator */}
                    {saveStatus && (
                        <span
                            style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#0F9D58",
                                animation: "fadeOut 2s forwards",
                            }}
                        >
                            {saveStatus}
                        </span>
                    )}
                    <style>{`@keyframes fadeOut { 0% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; } }`}</style>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        title="Save to browser"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            display: "flex",
                            borderRadius: "50%",
                            color: darkMode ? "#9aa0a6" : "#5f6368",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkMode ? "#3c4043" : "#eaeef4")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        title="Download as JSON"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            display: "flex",
                            borderRadius: "50%",
                            color: darkMode ? "#9aa0a6" : "#5f6368",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkMode ? "#3c4043" : "#eaeef4")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        <DownloadIcon />
                    </button>

                    {/* Gemini AI Sparkle Action Button */}
                    <button
                        onClick={toggleSidebar}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            display: "flex",
                            borderRadius: "50%",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eaeef4")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        title="Open Gemini AI"
                    >
                        <GeminiHeaderSparkle size={24} />
                    </button>

                    {/* Profile Avatar */}
                    <ProfileAvatar />
                </div>
            </header>

            {/* Global CSS Overrides for Univer UI contrast, sidebar, and left-aligning Univer's internal ribbon menu tabs */}
            <style>{`
        /* Move existing Univer ribbon menu tabs (Start, Formulas, Data) inside Univer Sheet to the left side */
        /* Ribbon tab bar: left-align the tablist inside the header menu */
  [data-u-comp="ribbon-header-menu"] [role="tablist"] {
    justify-content: flex-start !important;
    align-items: center !important;
    padding-left: 0 !important;
    margin-left: 0 !important;
    padding-left: 16px !important;
  }

       /* Ribbon toolbar: left-align toolbar items */
  [data-u-comp="ribbon-toolbar"] {
    display: flex !important;
    justify-content: flex-start !important;
  }


        /* Ensure clean high-contrast text inside context menus, popups, and dropdowns */
        .univer-menu,
        .univer-context-menu,
        .univer-dropdown-menu,
        .univer-popup-menu {
          color: #1e293b !important;
          background-color: #ffffff !important;
        }

        .univer-menu-item,
        .univer-context-menu-item {
          color: #1e293b !important;
        }

        .univer-menu-item:hover,
        .univer-context-menu-item:hover {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }

        /* Fix context menu icons color */
        .univer-menu-item-icon,
        .univer-icon,
        [class*="univer-icon"] {
          color: #475569 !important;
          fill: currentColor !important;
        }

        .univer-menu-item:hover .univer-menu-item-icon,
        .univer-menu-item:hover [class*="univer-icon"] {
          color: #0284c7 !important;
        }

        /* Sidebar Mona style overrides */
        .univer-sidebar {
          border-left: 1px solid #dadce0 !important;
          background-color: #ffffff !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.05) !important;
          border-top-left-radius: 16px !important;
          border-bottom-left-radius: 16px !important;
          overflow: hidden !important;
        }

        .univer-sidebar-header {
          display: none !important;
        }

        .univer-sidebar-body,
        .univer-sidebar-content {
          padding: 0 !important;
          height: 100% !important;
          background-color: #ffffff !important;
        }

        /* Univer Toolbar Container Google Sheets Styling */
        .univer-toolbar,
        [class*="univer-toolbar"] {
          background-color: #edf2fa !important;
          border-bottom: 1px solid #e0e3e7 !important;
        }
      `}</style>

            {/* Floating Dark Mode Toggle Button */}
            {isLoaded && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "16px",
                        zIndex: 100,
                    }}
                >
                    <button
                        onClick={toggleDark}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            border: `1px solid ${darkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.8)"}`,
                            background: darkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(8px)",
                            color: darkMode ? "#fbbf24" : "#475569",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                            transition: "all 0.15s",
                        }}
                    >
                        {darkMode ? <SunIcon /> : <MoonIcon />}
                    </button>
                </div>
            )}

            {/* Univer canvas container */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    width: "100%",
                    height: "calc(100% - 58px)",
                    minHeight: "600px",
                    position: "relative",
                    overflow: "hidden",
                }}
            />

            {/* ── Version Control UI Overlays matching reference image ── */}
            <CommitChangesModal
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
                onCommit={(msg) => setSaveStatus(`Committed: ${msg.slice(0, 20)}...`)}
            />

            <VersionHistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                onOpenCompare={() => setIsCompareModalOpen(true)}
            />

            <ChangesInCommitCard
                isOpen={isChangesCardOpen}
                onClose={() => setIsChangesCardOpen(false)}
            />

            <CompareVersionsModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
            />

            <CommitDetailsPanel
                isOpen={isCommitDetailsOpen}
                onClose={() => setIsCommitDetailsOpen(false)}
            />
        </div>
    );
}
