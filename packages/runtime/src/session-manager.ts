/**
 * Session Manager
 *
 * In-memory session store for Phase 1.
 * Sessions track conversation state per workbook per user.
 */

import type { Session, SessionStatus, Message, TokenUsage, SessionMetadata } from "@mona/schema";

export class SessionManager {
  private readonly sessions: Map<string, Session> = new Map();

  /** Create a new session. */
  create(workbookId: string, userId: string): Session {
    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      workbookId,
      userId,
      messages: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalTokens: 0,
        totalCost: 0,
        messageCount: 0,
        toolCallCount: 0,
      },
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /** Get a session by ID. */
  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /** Add a message to a session. */
  addMessage(sessionId: string, message: Message): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    // Sessions are readonly in the schema, so we create a new one
    const updated: Session = {
      ...session,
      messages: [...session.messages, message],
      updatedAt: new Date(),
      metadata: {
        ...session.metadata,
        messageCount: session.metadata.messageCount + 1,
        toolCallCount: session.metadata.toolCallCount + (message.toolCalls?.length ?? 0),
        totalTokens: session.metadata.totalTokens + (message.usage?.totalTokens ?? 0),
      },
    };
    this.sessions.set(sessionId, updated);
  }

  /** Update session status. */
  setStatus(sessionId: string, status: SessionStatus): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const updated: Session = { ...session, status, updatedAt: new Date() };
    this.sessions.set(sessionId, updated);
  }

  /** Update cost tracking. */
  addCost(sessionId: string, cost: number, tokens: TokenUsage): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const updated: Session = {
      ...session,
      updatedAt: new Date(),
      metadata: {
        ...session.metadata,
        totalCost: session.metadata.totalCost + cost,
        totalTokens: session.metadata.totalTokens + tokens.totalTokens,
      },
    };
    this.sessions.set(sessionId, updated);
  }

  /** End a session. */
  end(sessionId: string): void {
    this.setStatus(sessionId, "completed");
  }

  /** List all active sessions for a user. */
  listForUser(userId: string): Session[] {
    return [...this.sessions.values()].filter(
      (s) => s.userId === userId && s.status === "active"
    );
  }
}
