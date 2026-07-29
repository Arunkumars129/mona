/**
 * Mona Runtime
 *
 * The core AI orchestration engine. This is the main entry point for all AI operations.
 *
 * Flow: User message → Context build → LLM call → Tool execution loop → Stream response
 */

import type {
  CompletionRequest,
  ProviderMessage,
  ToolFunctionDef,
  ToolCall,
  ToolResult,
  ToolContext,
  Message,
  TokenUsage,
  WorkbookSnapshot,
  RuntimeProviderConfig,
  CostEntry,
} from "@mona/schema";
import { createLLMClient, ModelRouter } from "@mona/provider";
import type { LLMClient } from "@mona/provider";
import { ToolRegistry, createSpreadsheetTools } from "@mona/tools";
import { ContextBuilder } from "@mona/context";
import type { WorkbookService } from "@mona/workbook-service";
import { SessionManager } from "./session-manager";
import type { StreamEvent } from "./stream";

// ── Agent System Prompts ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Mona, an AI assistant for spreadsheets. You help users analyze data, create formulas, build charts, clean data, and automate spreadsheet tasks.

## Core Rules
1. Always read data before modifying it — use read_cells first.
2. Use the active sheet unless the user specifies otherwise.
3. When writing formulas, always start with "=".
4. For destructive operations (delete rows/sheets), confirm what you're about to do in your response.
5. After making changes, briefly explain what you did and why.
6. When you don't have enough context, ask the user to clarify.

## Available Context
You will receive workbook metadata, the current selection, and conversation history.
Use this context to give relevant, precise responses.

## Tool Usage
You have access to spreadsheet tools. Use them to read/write cells, manage sheets, create formulas and charts.
Always use get_sheet_list first if you don't know the sheet IDs.`;

// ── Runtime Configuration ────────────────────────────────────────────

export interface RuntimeConfig {
  readonly providers: RuntimeProviderConfig;
  readonly maxIterations?: number;
  readonly maxTokensPerRequest?: number;
  readonly systemPrompt?: string;
}

// ── Mona Runtime ─────────────────────────────────────────────────────

export type SnapshotProvider = () => {
  sheets: { id: string; name: string }[];
  cells: Record<string, { row: number; col: number; value: unknown }[]>;
};

export class MonaRuntime {
  private readonly config: RuntimeConfig;
  private readonly sessionManager: SessionManager;
  private readonly toolRegistry: ToolRegistry;
  private readonly contextBuilder: ContextBuilder;
  private readonly modelRouter: ModelRouter;
  private readonly llmClients: Map<string, LLMClient> = new Map();
  private readonly costLog: CostEntry[] = [];
  private snapshotProvider: SnapshotProvider | null = null;

  constructor(config: RuntimeConfig) {
    this.config = config;
    this.sessionManager = new SessionManager();
    this.toolRegistry = new ToolRegistry();
    this.contextBuilder = new ContextBuilder();
    this.modelRouter = new ModelRouter();

    // Initialize LLM clients for each configured provider
    for (const [providerId, providerConfig] of Object.entries(config.providers.providers)) {
      if (providerConfig) {
        const client = createLLMClient(providerId as any, providerConfig);
        this.llmClients.set(providerId, client);
      }
    }
  }

  /**
   * Initialize tools with a WorkbookService instance.
   * Called when the runtime is connected to a workbook.
   */
  initializeTools(workbookService: WorkbookService): void {
    const tools = createSpreadsheetTools(workbookService);
    for (const tool of tools) {
      this.toolRegistry.register(tool);
    }
  }

  setSnapshotProvider(provider: SnapshotProvider): void {
    this.snapshotProvider = provider;
  }

  /** Create a new session. */
  createSession(workbookId: string, userId: string) {
    return this.sessionManager.create(workbookId, userId);
  }

  /** Get an existing session. */
  getSession(sessionId: string) {
    return this.sessionManager.get(sessionId);
  }

  /**
   * Process a user message and yield streaming events.
   */
  async *processMessage(
    sessionId: string,
    userMessage: string,
    workbookSnapshot?: WorkbookSnapshot
  ): AsyncGenerator<StreamEvent> {
    const session = this.sessionManager.get(sessionId);
    if (!session) {
      yield { type: "error", message: "Session not found", recoverable: false };
      return;
    }

    // 1. Add user message to session
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    this.sessionManager.addMessage(sessionId, userMsg);

    yield { type: "status", message: "Analyzing your request..." };

    // 2. Build context
    const updatedSession = this.sessionManager.get(sessionId)!;
    const context = workbookSnapshot
      ? this.contextBuilder.buildFromSnapshot(workbookSnapshot, updatedSession.messages, "normal")
      : this.contextBuilder.buildFromSnapshot(
          { workbookId: session.workbookId, activeSheetId: "sheet-01", sheets: [] },
          updatedSession.messages,
          "normal"
        );

    // 3. Build messages for LLM
    const systemPrompt = (this.config.systemPrompt ?? SYSTEM_PROMPT) + "\n\n" + this.contextBuilder.toSystemPrompt(context);

    const providerMessages: ProviderMessage[] = [
      { role: "system", content: systemPrompt },
      ...this.buildMessageHistory(updatedSession.messages),
    ];

    // 4. Get tools
    const allTools = this.toolRegistry.getAll();
    const toolDefs: ToolFunctionDef[] = this.toolRegistry.toLLMFormat(allTools);

    // 5. Execute the agent loop (LLM call → tool execution → repeat)
    const maxIterations = this.config.maxIterations ?? 10;
    let iteration = 0;
    let totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let totalCost = 0;

    while (iteration < maxIterations) {
      iteration++;

      // Resolve model and provider
      const requestedModelId = this.config.providers.defaultModel;
      let { provider: providerId } = this.modelRouter.resolve(requestedModelId);
      let modelId = requestedModelId;
      let client = this.llmClients.get(providerId);

      // If the primary provider has no key configured, fallback to any provider that HAS a key configured
      if (!client && this.llmClients.size > 0) {
        const [availableProvider, availableClient] = Array.from(this.llmClients.entries())[0]!;
        providerId = availableProvider as any;
        client = availableClient;
        if (providerId === "anthropic") modelId = "claude-sonnet-4-20250514";
        else if (providerId === "openai") modelId = "gpt-4o-mini";
        else if (providerId === "google") modelId = "gemini-2.0-flash";
      }

      if (!client) {
        const envVarName =
          providerId === "google" ? "GOOGLE_AI_API_KEY or GEMINI_API_KEY" :
          providerId === "anthropic" ? "ANTHROPIC_API_KEY" :
          providerId === "openai" ? "OPENAI_API_KEY" :
          "OPENROUTER_API_KEY";

        yield {
          type: "error",
          message: `No API key configured for provider "${providerId}". Please add ${envVarName} to apps/web/.env.local and restart the server.`,
          recoverable: false,
        };
        return;
      }

      // Make the LLM call
      const request: CompletionRequest = {
        model: modelId,
        messages: providerMessages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
        maxTokens: this.config.maxTokensPerRequest ?? 4096,
        temperature: 0.3,
        stream: false,
      };

      let response;
      try {
        response = await client.complete(request);
      } catch (err) {
        const errStr = String(err);
        const isQuotaError = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded");

        // Fallback: If gemini-2.0-flash hit a 429 quota error, retry with gemini-1.5-flash
        if (isQuotaError && providerId === "google" && modelId !== "gemini-1.5-flash") {
          yield { type: "status", message: "Gemini 2.0 quota exhausted. Retrying with Gemini 1.5 Flash..." };
          try {
            const fallbackRequest = { ...request, model: "gemini-1.5-flash" };
            response = await client.complete(fallbackRequest);
            modelId = "gemini-1.5-flash";
          } catch (fallbackErr) {
            yield {
              type: "error",
              message: `Google Gemini Rate Limit / Quota Exceeded (429). Change MONA_DEFAULT_MODEL=gemini-1.5-flash in apps/web/.env.local or use OPENAI_API_KEY / ANTHROPIC_API_KEY. (${String(fallbackErr)})`,
              recoverable: true,
            };
            return;
          }
        } else {
          yield {
            type: "error",
            message: isQuotaError
              ? `API Quota Exceeded (429) for provider "${providerId}". Please wait a moment or set a different provider/model in apps/web/.env.local.`
              : `LLM error: ${errStr}`,
            recoverable: true,
          };
          return;
        }
      }

      // Track usage and cost
      totalUsage = {
        promptTokens: totalUsage.promptTokens + response.usage.promptTokens,
        completionTokens: totalUsage.completionTokens + response.usage.completionTokens,
        totalTokens: totalUsage.totalTokens + response.usage.totalTokens,
      };
      const iterationCost = this.modelRouter.estimateCost(modelId, response.usage);
      totalCost += iterationCost;
      this.sessionManager.addCost(sessionId, iterationCost, response.usage);

      // Yield text content
      if (response.content) {
        yield { type: "text", content: response.content };
      }

      // If no tool calls, we're done
      if (!response.toolCalls || response.toolCalls.length === 0) {
        const assistantMsg: Message = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          usage: response.usage,
        };
        this.sessionManager.addMessage(sessionId, assistantMsg);
        break;
      }

      // Execute tool calls
      const assistantMsg: Message = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: response.content,
        toolCalls: response.toolCalls.map((tc) => ({
          id: tc.id,
          name: tc.name,
          arguments: tc.arguments,
        })),
        timestamp: new Date(),
        usage: response.usage,
      };
      this.sessionManager.addMessage(sessionId, assistantMsg);

      providerMessages.push({
        role: "assistant",
        content: response.content,
        toolCalls: response.toolCalls,
      });

      for (const toolCall of response.toolCalls) {
        yield {
          type: "tool_call_start",
          name: toolCall.name,
          arguments: toolCall.arguments,
        };

        const toolResult = await this.executeTool(toolCall, session.workbookId, session.userId);

        yield {
          type: "tool_call_result",
          name: toolCall.name,
          result: toolResult.content,
          isError: toolResult.isError,
        };

        providerMessages.push({
          role: "tool",
          content: toolResult.content,
          toolCallId: toolCall.id,
        });

        const toolMsg: Message = {
          id: `msg_${Date.now()}_tool`,
          role: "tool",
          content: toolResult.content,
          toolResults: [toolResult],
          timestamp: new Date(),
        };
        this.sessionManager.addMessage(sessionId, toolMsg);
      }
    }

    // Emit snapshot if a provider is available
    if (this.snapshotProvider) {
      try {
        const snap = this.snapshotProvider();
        yield { type: "snapshot", ...snap };
      } catch {
        // ignore snapshot errors
      }
    }

    this.costLog.push({
      id: `cost_${Date.now()}`,
      sessionId,
      userId: session.userId,
      workbookId: session.workbookId,
      model: this.config.providers.defaultModel,
      provider: this.config.providers.defaultProvider,
      usage: totalUsage,
      costUsd: totalCost,
      timestamp: new Date(),
    });

    yield { type: "done", usage: totalUsage, cost: totalCost };
  }

  getCostLog(): CostEntry[] {
    return [...this.costLog];
  }

  private async executeTool(toolCall: ToolCall, workbookId: string, userId: string): Promise<ToolResult> {
    const tool = this.toolRegistry.get(toolCall.name);
    if (!tool) {
      return {
        toolCallId: toolCall.id,
        content: `Error: Unknown tool "${toolCall.name}"`,
        isError: true,
      };
    }

    const ctx: ToolContext = {
      sessionId: "current",
      workbookId,
      userId,
      activeSheetId: "sheet-01",
    };

    try {
      const startTime = Date.now();
      const result = await tool.execute(toolCall.arguments, ctx);
      const durationMs = Date.now() - startTime;

      return {
        toolCallId: toolCall.id,
        content: JSON.stringify(result, null, 2),
        isError: false,
        durationMs,
      };
    } catch (err) {
      return {
        toolCallId: toolCall.id,
        content: `Error executing ${toolCall.name}: ${String(err)}`,
        isError: true,
      };
    }
  }

  private buildMessageHistory(messages: Message[]): ProviderMessage[] {
    return messages.map((m) => {
      if (m.role === "tool" && m.toolResults?.length) {
        return {
          role: "tool" as const,
          content: m.toolResults[0]!.content,
          toolCallId: m.toolResults[0]!.toolCallId,
        };
      }
      if (m.role === "assistant" && m.toolCalls?.length) {
        return {
          role: "assistant" as const,
          content: m.content,
          toolCalls: m.toolCalls.map((tc) => ({
            id: tc.id,
            name: tc.name,
            arguments: tc.arguments,
          })),
        };
      }
      return {
        role: m.role as "user" | "assistant",
        content: m.content,
      };
    });
  }
}
