/**
 * AI Chat API Route
 *
 * POST /api/ai/chat
 *
 * Accepts a user message and workbook context,
 * returns an SSE stream of StreamEvents.
 */

import { MonaRuntime, encodeSSE } from "@mona/runtime";
import type { RuntimeConfig, SnapshotProvider } from "@mona/runtime";
import type { WorkbookSnapshot } from "@mona/schema";
import { SnapshotWorkbookService } from "@mona/workbook-service";

// ── Runtime + Service per Session ────────────────────────────────────

interface SessionData {
  runtime: MonaRuntime;
  service: SnapshotWorkbookService;
}

const sessions = new Map<string, SessionData>();

function getOrCreateSessionData(
  sessionId?: string,
  workbookContext?: WorkbookSnapshot
): { sessionId: string; data: SessionData } {
  // Reuse existing session if valid
  if (sessionId && sessions.has(sessionId)) {
    return { sessionId, data: sessions.get(sessionId)! };
  }

  // Create new session
  const config: RuntimeConfig = {
    providers: {
      defaultProvider: (process.env["MONA_DEFAULT_PROVIDER"] as any) ?? "google",
      defaultModel: process.env["MONA_DEFAULT_MODEL"] ?? "gemini-3.1-flash-lite",
      providers: {
        anthropic: process.env["ANTHROPIC_API_KEY"]
          ? { apiKey: process.env["ANTHROPIC_API_KEY"] }
          : undefined,
        openai: process.env["OPENAI_API_KEY"]
          ? { apiKey: process.env["OPENAI_API_KEY"] }
          : undefined,
        google: (process.env["GOOGLE_AI_API_KEY"] || process.env["GEMINI_API_KEY"])
          ? { apiKey: (process.env["GOOGLE_AI_API_KEY"] || process.env["GEMINI_API_KEY"])! }
          : undefined,
        openrouter: process.env["OPENROUTER_API_KEY"]
          ? { apiKey: process.env["OPENROUTER_API_KEY"] }
          : undefined,
      },
    },
    maxIterations: 10,
    maxTokensPerRequest: 4096,
  };

  const rt = new MonaRuntime(config);
  const service = new SnapshotWorkbookService(workbookContext);
  rt.initializeTools(service);

  const provider: SnapshotProvider = () => ({
    sheets: service.toSnapshot().sheets.map((s) => ({ id: s.id, name: s.name })),
    cells: service.exportCellData(),
  });
  rt.setSnapshotProvider(provider);

  const newSessionId = rt.createSession(
    workbookContext?.workbookId ?? "default",
    "user-1"
  ).id;

  sessions.set(newSessionId, { runtime: rt, service });
  return { sessionId: newSessionId, data: sessions.get(newSessionId)! };
}

// ── POST Handler ─────────────────────────────────────────────────────

interface ChatRequestBody {
  sessionId?: string;
  message: string;
  workbookContext?: WorkbookSnapshot;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!body.message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const { sessionId, data: { runtime: rt, service } } = getOrCreateSessionData(
      body.sessionId,
      body.workbookContext
    );

    // Create SSE readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send session ID first
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "session", sessionId })}\n\n`)
          );

          // Stream all events from the runtime
          for await (const event of rt.processMessage(
            sessionId!,
            body.message,
            body.workbookContext
          )) {
            controller.enqueue(encoder.encode(encodeSSE(event)));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              encodeSSE({
                type: "error",
                message: `Runtime error: ${String(err)}`,
                recoverable: false,
              })
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Session-Id": sessionId,
      },
    });
  } catch (err) {
    return Response.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    );
  }
}
