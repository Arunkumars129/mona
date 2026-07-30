"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { applySnapshot, getWorkbookSnapshot } from "./univer-bridge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiPanelProps {
  darkMode?: boolean;
  onClose?: () => void;
}

/* ── SVG Icons matching Google Gemini UI ── */

function MenuIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PanelLayoutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M15 3v18" />
    </svg>
  );
}

function ChevronDownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SuggestionArrowIcon({ size = 16, color = "#5f6368" }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 9l-6 6 6 6" />
      <path d="M4 15h11a4 4 0 0 0 4-4V5" />
    </svg>
  );
}

function SparklesListIcon({ size = 16, color = "#5f6368" }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="12" y2="6" />
      <line x1="3" y1="12" x2="12" y2="12" />
      <line x1="3" y1="18" x2="12" y2="18" />
      <path d="M16 10l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" />
    </svg>
  );
}

function TableGridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function TableSparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="12" height="12" rx="2" />
      <line x1="3" y1="9" x2="15" y2="9" />
      <line x1="9" y1="3" x2="9" y2="15" />
      <path d="M17 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  );
}

function UpArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function GeminiSparkleLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
        fill="url(#gemini-logo-grad)"
      />
      <defs>
        <linearGradient id="gemini-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A73E8" />
          <stop offset="0.5" stopColor="#9B51E0" />
          <stop offset="1" stopColor="#D93025" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AiPanel({ darkMode = false, onClose }: AiPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const clearHistory = useCallback(() => setMessages([]), []);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const sendPrompt = useCallback(
    async (promptText?: string) => {
      const text = (promptText || input).trim();
      if (!text || isStreaming) return;
      if (!promptText) setInput("");

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStatusText("Connecting to Mona AI...");

      const assistantMsgId = crypto.randomUUID();
      let assistantContent = "";
      let hasToolExecuted = false;

      try {
        const workbookContext = getWorkbookSnapshot();
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId || undefined,
            message: text,
            workbookContext: workbookContext ?? undefined,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const newSessionId = response.headers.get("X-Session-Id");
        if (newSessionId && newSessionId !== sessionId) {
          setSessionId(newSessionId);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(trimmed.slice(6));
              if (event.type === "session" && event.sessionId) {
                setSessionId(event.sessionId);
              } else if (event.type === "status") {
                setStatusText(event.message);
              } else if (event.type === "text") {
                setStatusText(null);
                assistantContent += event.content;
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.id !== assistantMsgId);
                  return [
                    ...filtered,
                    { id: assistantMsgId, role: "assistant", content: assistantContent },
                  ];
                });
              } else if (event.type === "tool_call_start") {
                hasToolExecuted = true;
                setStatusText(`Running tool: ${event.name}...`);
              } else if (event.type === "tool_call_result") {
                hasToolExecuted = true;
                setStatusText(`Tool ${event.name} finished`);
              } else if (event.type === "error") {
                setStatusText(null);
                assistantContent += `\n\n⚠️ Error: ${event.message}`;
                setMessages((prev) => [
                  ...prev.filter((m) => m.id !== assistantMsgId),
                  { id: assistantMsgId, role: "assistant", content: assistantContent },
                ]);
              } else if (event.type === "snapshot") {
                hasToolExecuted = true;
                const snap = event as { type: "snapshot"; sheets: { id: string; name: string }[]; cells: Record<string, { row: number; col: number; value: unknown }[]> };
                if (snap.sheets && snap.cells) {
                  applySnapshot(snap.sheets, snap.cells);
                }
              } else if (event.type === "done") {
                setStatusText(null);
              }
            } catch {
              // skip malformed SSE JSON
            }
          }
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ Failed to connect to Mona AI API. (${String(err)})`,
          },
        ]);
      } finally {
        setIsStreaming(false);
        setStatusText(null);
        setMessages((prev) => {
          const text = assistantContent.trim();
          const filtered = prev.filter((m) => m.id !== assistantMsgId);
          const finalContent = text || (hasToolExecuted ? "I've created and updated the spreadsheet according to your request!" : "I've processed your request.");
          return [
            ...filtered,
            { id: assistantMsgId, role: "assistant", content: finalContent },
          ];
        });
      }
    },
    [input, isStreaming, sessionId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendPrompt();
      }
    },
    [sendPrompt]
  );

  const c = {
    bg: darkMode ? "#1f1f1f" : "#ffffff",
    headerBg: darkMode ? "#1f1f1f" : "#ffffff",
    border: darkMode ? "#3c4043" : "#dadce0",
    text: darkMode ? "#e8eaed" : "#202124",
    textSubtle: darkMode ? "#9aa0a6" : "#5f6368",
    heroBlue: darkMode ? "#8ab4f8" : "#1a73e8",
    cardBg: darkMode ? "#292a2d" : "#ffffff",
    cardBorder: darkMode ? "#4a4d51" : "#dadce0",
    pillBg: darkMode ? "#3c4043" : "#f1f3f4",
    pillText: darkMode ? "#e8eaed" : "#3c4043",
    betaBg: darkMode ? "rgba(138, 180, 248, 0.2)" : "#e8f0fe",
    betaText: darkMode ? "#8ab4f8" : "#1a73e8",
    sendBtnDisabled: darkMode ? "#3c4043" : "#e3e3e3",
    sendBtnDisabledIcon: darkMode ? "#80868b" : "#9aa0a6",
    sendBtnActive: darkMode ? "#8ab4f8" : "#1a73e8",
    sendBtnActiveIcon: darkMode ? "#202124" : "#ffffff",
    userBubble: darkMode ? "#3c4043" : "#f1f3f4",
    aiBubble: darkMode ? "rgba(138, 180, 248, 0.12)" : "#f8faff",
  };

  const suggestions = [
    "Build me a workout tracker",
    "Create a sales territory plan",
    "Create a quarterly business review",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: c.bg,
        color: c.text,
        fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      {/* <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          backgroundColor: c.headerBg,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{ background: "none", border: "none", color: c.textSubtle, cursor: "pointer", display: "flex", padding: 0 }}
            title="Menu"
          >
            <MenuIcon size={20} />
          </button>
          <span style={{ fontSize: "18px", fontWeight: 500, color: c.text, letterSpacing: "-0.2px" }}>
            Mona
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={clearHistory}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              background: "none",
              border: "none",
              color: c.textSubtle,
              cursor: "pointer",
              padding: "4px",
            }}
            title="Panel Layout"
          >
            <PanelLayoutIcon size={18} />
            <ChevronDownIcon size={12} />
          </button>

          <button
            onClick={onClose || clearHistory}
            style={{ background: "none", border: "none", color: c.textSubtle, cursor: "pointer", padding: "4px", display: "flex" }}
            title="Close Panel"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </header> */}

      {/* ── Scrollable Body Area ──────────────────────────── */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? (
          /* Empty / Hero State matching Google Sheets Gemini design */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <GeminiSparkleLogo size={36} />
            </div>

            {/* Prominent Hero Blue Instruction Title */}
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: c.heroBlue,
                textAlign: "center",
                lineHeight: 1.35,
                maxWidth: "260px",
                margin: "0 0 44px 0",
                letterSpacing: "-0.3px",
              }}
            >
              Type @ to reference sources
            </h2>

            {/* Suggestion list with curved reply icons */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "22px",
                paddingLeft: "4px",
              }}
            >
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => sendPrompt(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    color: c.textSubtle,
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = c.heroBlue)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = c.textSubtle)}
                >
                  <SuggestionArrowIcon size={18} color={c.textSubtle} />
                  <span>{item}</span>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: "pointer",
                  color: c.textSubtle,
                  fontSize: "14px",
                  fontWeight: 500,
                  marginTop: "2px",
                }}
              >
                <SparklesListIcon size={18} color={c.textSubtle} />
                <span>View all suggestions</span>
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Messages History */
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    backgroundColor: msg.role === "user" ? c.userBubble : c.aiBubble,
                    color: c.text,
                    fontSize: "14px",
                    lineHeight: 1.45,
                    border: msg.role === "assistant" ? `1px solid ${c.cardBorder}` : "none",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {statusText && (
              <div
                style={{
                  fontSize: "12px",
                  color: c.heroBlue,
                  fontStyle: "italic",
                  padding: "4px 8px",
                  alignSelf: "flex-start",
                }}
              >
                ⚡ {statusText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Input Card ("Ask mona") ────────────────────── */}
      <div style={{ padding: "0 20px 16px 20px", flexShrink: 0 }}>
        <div
          style={{
            borderRadius: "24px",
            border: `1px solid ${c.cardBorder}`,
            backgroundColor: c.cardBg,
            padding: "14px 16px 10px 16px",
            boxShadow: darkMode ? "0 4px 16px rgba(0,0,0,0.3)" : "0 1px 6px rgba(60,64,67,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Text Area */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mona ..."
            rows={1}
            style={{
              width: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              color: c.text,
              fontSize: "16px",
              fontFamily: "inherit",
              lineHeight: 1.4,
              boxSizing: "border-box",
            }}
          />

          {/* Bottom Toolbar Row inside Card */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Left Scope Control Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "16px",
                  backgroundColor: c.pillBg,
                  color: c.pillText,
                  border: "none",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                title="Select Sheet Scope"
              >
                <TableGridIcon size={15} />
                <ChevronDownIcon size={11} />
              </button> */}

              {/* <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "16px",
                  backgroundColor: c.pillBg,
                  color: c.pillText,
                  border: "none",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                title="Format Settings"
              >
                <TableSparkleIcon size={15} />
                <ChevronDownIcon size={11} />
              </button> */}
            </div>

            {/* Right Controls: Beta badge + Up Arrow Send button */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: c.betaBg,
                  color: c.betaText,
                }}
              >
                Beta
              </span> */}

              <button
                onClick={() => sendPrompt()}
                disabled={!input.trim()}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: input.trim() ? c.sendBtnActive : c.sendBtnDisabled,
                  color: input.trim() ? c.sendBtnActiveIcon : c.sendBtnDisabledIcon,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  transition: "all 0.15s ease",
                }}
                title="Send to Gemini"
              >
                <UpArrowIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footnote Notice */}
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: c.textSubtle,
            marginTop: "10px",
          }}
        >
          Mona in Workspace can make mistakes.{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ color: c.textSubtle, textDecoration: "underline" }}
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
