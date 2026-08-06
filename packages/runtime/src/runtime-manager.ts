/**
 * RuntimeManager — manages multiple runtime sessions.
 *
 * Instead of creating one runtime per request, this maintains:
 *   Map<sessionId, RuntimeSession>
 *
 * This allows:
 *   - 100 users → 100 isolated runtimes
 *   - Session persistence for approval flows
 *   - Conversation memory across turns
 */

import type { LLMProvider } from '@repo/ai';
import {
  AgentRegistry,
  createLLMAssistantAgent,
  createLLMFormattingAgent,
  createLLMFormulaAgent,
} from '@repo/agents';
import { ContextManager } from '@repo/context';
import { InMemoryStore } from '@repo/memory';
import { LLMPlannerImpl, PlannerAgent } from '@repo/planner';
import { UniverAdapter } from '@repo/spreadsheet';
import type { PolicyContext } from '@repo/shared';
import { MonaRuntime, type TurnInput, type TurnResult } from './runtime';

export interface RuntimeManagerConfig {
  provider: LLMProvider;
  policyContext?: PolicyContext;
  maxSessions?: number;
  sessionTtlMs?: number;
}

interface ManagedSession {
  runtime: MonaRuntime;
  createdAt: number;
  lastAccessedAt: number;
}

export class RuntimeManager {
  private sessions = new Map<string, ManagedSession>();
  private provider: LLMProvider;
  private policyContext: PolicyContext;
  private maxSessions: number;
  private sessionTtlMs: number;

  constructor(config: RuntimeManagerConfig) {
    this.provider = config.provider;
    this.policyContext = config.policyContext ?? {
      workbook: { id: 'default', classification: 'internal' },
      actorRole: 'editor',
      tenantId: 'default',
    };
    this.maxSessions = config.maxSessions ?? 100;
    this.sessionTtlMs = config.sessionTtlMs ?? 30 * 60 * 1000; // 30 min
  }

  /** Get or create a runtime for the given session */
  getOrCreate(sessionId: string): MonaRuntime {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      existing.lastAccessedAt = Date.now();
      return existing.runtime;
    }

    // Evict expired sessions if at capacity
    if (this.sessions.size >= this.maxSessions) {
      this.evictExpired();
    }

    const runtime = this.createRuntime();
    this.sessions.set(sessionId, {
      runtime,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    });

    return runtime;
  }

  /** Execute a turn on the appropriate session */
  async executeTurn(input: TurnInput): Promise<TurnResult> {
    const runtime = this.getOrCreate(input.sessionId);
    return runtime.executeTurn(input);
  }

  /** Approve or deny pending commands */
  async approvePending(sessionId: string, approved: boolean): Promise<TurnResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { turnId: '', status: 'error', error: 'Session not found' };
    }
    session.lastAccessedAt = Date.now();
    return session.runtime.approvePending(sessionId, approved);
  }

  /** Get the LLM provider (for agents to use) */
  getProvider(): LLMProvider {
    return this.provider;
  }

  private createRuntime(): MonaRuntime {
    const memory = new InMemoryStore();
    const spreadsheet = new UniverAdapter();

    const contextManager = new ContextManager({
      memory,
      getWorkbookMeta: async (workbookId) => ({
        id: workbookId,
        name: 'Workbook',
        sheetNames: ['Sheet1'],
        ownerId: 'user',
        classification: 'internal',
      }),
      getSelection: async () => [],
    });

    // Create LLM-powered agents
    const llmAssistant = createLLMAssistantAgent(this.provider);
    const llmFormula = createLLMFormulaAgent(this.provider);
    const llmFormatting = createLLMFormattingAgent(this.provider);

    // Build registry with LLM agents replacing stubs
    const registry = new AgentRegistry([llmAssistant, llmFormula, llmFormatting]);
    const agents = registry.all();

    // Create LLM-backed planner
    const llmPlanner = new LLMPlannerImpl(this.provider);

    return new MonaRuntime({
      planner: new PlannerAgent(llmPlanner),
      contextManager,
      spreadsheet,
      memory,
      policyContext: this.policyContext,
      agents,
    });
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastAccessedAt > this.sessionTtlMs) {
        this.sessions.delete(id);
      }
    }
  }
}
