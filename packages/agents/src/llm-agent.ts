/**
 * LLM-powered Agent base class.
 *
 * Uses the LLMProvider + tool loop pattern:
 *   Agent → LLMProvider.generate() → tool calls → execute → ... → done
 *
 * The agent doesn't know which LLM it's using — it only calls provider.generate().
 * Tool definitions are injected, not hardcoded.
 */

import type { LLMProvider, LLMToolDef, ToolCall } from '@repo/ai';
import { runToolLoop, type ToolExecutor, type ToolLoopEvent } from '@repo/ai';
import { createCommand, type BaseCommand } from '@repo/commands';
import type { LayeredContext } from '@repo/context';
import type { PlannedTask } from '@repo/planner';
import type { Capability, AgentId } from '@repo/shared';
import { BaseAgent, type AgentResult, type AgentRunOptions } from './agent-base';

/* ── Spreadsheet Tool Definitions ─────────────────────────── */

export const SPREADSHEET_TOOLS: LLMToolDef[] = [
  {
    name: 'set_cell_value',
    description:
      'Set a single cell value. Use this to write text, numbers, or data into spreadsheet cells. Call this multiple times to fill multiple cells.',
    parameters: {
      cellRef: {
        type: 'string',
        description: 'A1-style cell reference (e.g. "A1", "B3", "C10")',
        required: true,
      },
      value: {
        type: 'string',
        description: 'The value to set in the cell',
        required: true,
      },
    },
  },
  {
    name: 'set_formula',
    description:
      'Set a formula in a cell. Use Excel-style formulas like =SUM(A1:A10), =AVERAGE(B2:B20), =IF(A1>5,"Yes","No"), =VLOOKUP(...), etc.',
    parameters: {
      cellRef: {
        type: 'string',
        description: 'A1-style cell reference (e.g. "A1", "B3")',
        required: true,
      },
      formula: {
        type: 'string',
        description: 'Excel-style formula starting with = (e.g. "=SUM(A1:A10)")',
        required: true,
      },
    },
  },
  {
    name: 'set_range_style',
    description:
      'Apply formatting to a cell or range: background color, font color, bold, italic, underline, or font size. Use this for visual formatting like highlighting headers or coloring cells.',
    parameters: {
      range: {
        type: 'string',
        description: 'A1-style range (e.g. "A1", "A1:C1", "B2:B10")',
        required: true,
      },
      backgroundColor: {
        type: 'string',
        description: 'CSS color for the cell fill (e.g. "green", "#00FF00", "#4CAF50")',
        required: false,
      },
      fontColor: {
        type: 'string',
        description: 'CSS color for the text (e.g. "white", "#FFFFFF")',
        required: false,
      },
      bold: {
        type: 'boolean',
        description: 'Whether the text should be bold',
        required: false,
      },
      italic: {
        type: 'boolean',
        description: 'Whether the text should be italic',
        required: false,
      },
      underline: {
        type: 'boolean',
        description: 'Whether the text should be underlined',
        required: false,
      },
      fontSize: {
        type: 'number',
        description: 'Font size in points (e.g. 12, 14)',
        required: false,
      },
    },
  },
];

/* ── Tool Executor that builds Commands ───────────────────── */

interface CommandAccumulator {
  commands: BaseCommand[];
  agentId: AgentId;
  sheetId: string;
  correlationId: string;
}

function createToolExecutor(acc: CommandAccumulator): ToolExecutor {
  return {
    async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
      const cellRef = (args.cellRef as string) ?? 'A1';

      if (name === 'set_cell_value') {
        const cmd = createCommand({
          type: 'SetCellValue',
          payload: { cellRef, value: args.value },
          issuedBy: { kind: 'agent', id: acc.agentId },
          targetSheetId: acc.sheetId,
          correlationId: acc.correlationId,
        });
        acc.commands.push(cmd);
        return { success: true, cellRef, value: args.value };
      }

      if (name === 'set_formula') {
        const cmd = createCommand({
          type: 'SetFormula',
          payload: { cellRef, formula: args.formula, overwritesExisting: false },
          issuedBy: { kind: 'agent', id: acc.agentId },
          targetSheetId: acc.sheetId,
          correlationId: acc.correlationId,
        });
        acc.commands.push(cmd);
        return { success: true, cellRef, formula: args.formula };
      }

      if (name === 'set_range_style') {
        const { start, end } = parseRange((args.range as string) ?? cellRef);
        const style: Record<string, unknown> = {};
        for (const key of ['backgroundColor', 'fontColor', 'bold', 'italic', 'underline', 'fontSize'] as const) {
          if (args[key] !== undefined) style[key] = args[key];
        }

        const cmd = createCommand({
          type: 'FormatRange',
          payload: {
            range: { sheetId: acc.sheetId, start, end },
            style,
          },
          issuedBy: { kind: 'agent', id: acc.agentId },
          targetSheetId: acc.sheetId,
          range: { sheetId: acc.sheetId, start, end },
          correlationId: acc.correlationId,
        });
        acc.commands.push(cmd);
        return { success: true, range: `${start}:${end}`, style };
      }

      return { error: `Unknown tool: ${name}` };
    },
  };
}

function parseRange(input: string): { start: string; end: string } {
  const normalized = input.toUpperCase().replace(/\s+/g, '');
  const [start, end] = normalized.split(':');
  if (!end) {
    const match = normalized.match(/^([A-Z]+\d+)$/);
    if (match) return { start: match[1]!, end: match[1]! };
    return { start: 'A1', end: 'A1' };
  }
  return { start: start ?? 'A1', end: end ?? start ?? 'A1' };
}

/* ── LLM Agent ────────────────────────────────────────────── */

export interface LLMAgentConfig {
  id: AgentId;
  capabilities: Capability[];
  systemPrompt: string;
  tools?: LLMToolDef[];
  maxRetries?: number;
  timeoutMs?: number;
  maxToolIterations?: number;
}

export class LLMAgent extends BaseAgent {
  readonly id: AgentId;
  readonly capabilities: Capability[];
  override readonly maxRetries: number;
  override readonly timeoutMs: number;

  private provider: LLMProvider;
  private systemPrompt: string;
  private tools: LLMToolDef[];
  private maxToolIterations: number;
  private eventCallback?: (event: ToolLoopEvent) => void;

  constructor(provider: LLMProvider, config: LLMAgentConfig) {
    super();
    this.provider = provider;
    this.id = config.id;
    this.capabilities = config.capabilities;
    this.systemPrompt = config.systemPrompt;
    this.tools = config.tools ?? SPREADSHEET_TOOLS;
    this.maxRetries = config.maxRetries ?? 2;
    this.timeoutMs = config.timeoutMs ?? 60_000;
    this.maxToolIterations = config.maxToolIterations ?? 15;
  }

  /** Set an event callback for streaming tool loop events */
  onEvent(callback: (event: ToolLoopEvent) => void): void {
    this.eventCallback = callback;
  }

  async run(
    task: PlannedTask,
    context: LayeredContext,
    _opts?: AgentRunOptions,
  ): Promise<AgentResult> {
    const sheetId = context.activeSheet.id;
    const acc: CommandAccumulator = {
      commands: [],
      agentId: this.id,
      sheetId,
      correlationId: task.id,
    };

    const executor = createToolExecutor(acc);
    const contextDesc = this.buildContextDescription(context);

    const result = await runToolLoop(this.provider, executor, {
      systemPrompt: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Task: ${task.intent}\n\nSpreadsheet context:\n${contextDesc}\n\nUse the available tools to complete this task. Call set_cell_value or set_formula for each cell you need to modify.`,
        },
      ],
      tools: this.tools,
      temperature: 0.2,
      maxTokens: 4000,
      maxIterations: this.maxToolIterations,
      onEvent: this.eventCallback,
    });

    return {
      commands: acc.commands,
      rationale: result.text || `[${this.id}] Completed: ${task.intent}`,
      confidence: acc.commands.length > 0 ? 0.9 : 0.5,
    };
  }

  private buildContextDescription(context: LayeredContext): string {
    const parts: string[] = [];
    parts.push(`Sheet: "${context.activeSheet.name}" (${context.activeSheet.rowCount}×${context.activeSheet.colCount})`);

    if (context.selectedCells.length > 0) {
      parts.push(`Selected: ${context.selectedCells.map(c => `${c.start}:${c.end}`).join(', ')}`);
    }

    if (context.semanticSummary) {
      parts.push(`Summary: ${context.semanticSummary}`);
    }

    return parts.join('\n');
  }
}

/* ── Pre-configured Agent Factories ───────────────────────── */

export function createLLMAssistantAgent(provider: LLMProvider): LLMAgent {
  return new LLMAgent(provider, {
    id: 'ai-assistant-agent',
    capabilities: ['assistant'],
    systemPrompt: `You are a spreadsheet AI assistant. You help users create, modify, and analyze spreadsheet data.

When asked to create tables, populate data, or modify cells:
1. Use set_cell_value for headers and data
2. Use set_formula for calculations
3. Be thorough — create complete, useful content
4. Use proper column layout (A for first column, B for second, etc.)
5. Start from row 1 for headers, row 2+ for data

Always use the tools to make changes. Do not just describe what to do.`,
    tools: SPREADSHEET_TOOLS,
    maxToolIterations: 20,
  });
}

export function createLLMFormulaAgent(provider: LLMProvider): LLMAgent {
  return new LLMAgent(provider, {
    id: 'formula-agent',
    capabilities: ['formula'],
    systemPrompt: `You are a spreadsheet formula expert. You create and modify Excel-style formulas.

Supported formulas: SUM, AVERAGE, COUNT, COUNTA, IF, VLOOKUP, HLOOKUP, INDEX, MATCH, MIN, MAX, CONCATENATE, LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, DATE, TODAY, NOW, ROUND, ABS, etc.

When asked to add formulas:
1. Use set_formula to set formulas in cells
2. Reference the correct cell ranges
3. Handle edge cases (empty cells, errors)
4. Place results in appropriate cells

Always use the tools. Do not just describe formulas.`,
    tools: SPREADSHEET_TOOLS,
    maxToolIterations: 10,
  });
}

export function createLLMFormattingAgent(provider: LLMProvider): LLMAgent {
  return new LLMAgent(provider, {
    id: 'formatting-agent',
    capabilities: ['formatting'],
    systemPrompt: `You are a spreadsheet formatting expert. You change cell appearance: background colors, font colors, bold, italic, underline, and font sizes.

When asked to change formatting (e.g. "make row 1 green", "highlight headers", "bold the title", "color column B red"):
1. Use set_range_style to apply the requested style
2. Use an A1 range — "A1:C1" for a whole row, "A1:C1" for columns, or a single cell like "A1"
3. Use clear CSS color names (green, red, blue, yellow) or hex values (#00FF00, #FF0000)
4. Interpret "header" as row 1 unless told otherwise

Always use the tools. Do not just describe the formatting.`,
    tools: SPREADSHEET_TOOLS,
    maxToolIterations: 10,
  });
}
