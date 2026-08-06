/**
 * LLM-backed Planner — replaces the stub keyword-matching planner.
 *
 * Uses LLMProvider.generateJSON() to decompose user intent into
 * a structured ExecutionPlan with tasks, confidence, and summary.
 *
 * The planner doesn't know which LLM it's using — it only calls generate().
 */

import type { LLMProvider } from '@repo/ai';
import type { LayeredContext } from '@repo/context';
import type { ExecutionPlan, PlannedTask, PlannerLLM } from './planner';

const PLANNER_SYSTEM_PROMPT = `You are a spreadsheet AI planner. Your job is to decompose user requests into executable tasks.

Available agents and their capabilities:
- "formula-agent": Set formulas, calculations, SUM, AVERAGE, IF, VLOOKUP, etc.
- "chart-agent": Create charts and visualizations
- "formatting-agent": Format cells, colors, fonts, borders, number formats
- "data-cleaning-agent": Clean data, remove duplicates, trim whitespace, fix types
- "pivot-agent": Create pivot tables and summaries
- "import-agent": Import data from CSV, JSON, external sources
- "export-agent": Export workbook to CSV, PDF, etc.
- "ai-assistant-agent": General purpose — answer questions, create tables, populate data

Rules:
1. Choose the most specific agent for each sub-task.
2. If a request involves multiple steps (e.g., "create a student table with formulas"), split into multiple tasks.
3. For data creation/population, use "ai-assistant-agent".
4. For calculations/formulas, use "formula-agent".
5. Tasks that depend on each other should reference dependencies via dependsOn.
6. Set confidence between 0.0 and 1.0 based on how well you understand the request.

Respond with a JSON object matching this schema:
{
  "intent": "short description of overall intent",
  "summary": "human-readable summary of what will be done",
  "confidence": 0.95,
  "requiresApproval": false,
  "tasks": [
    {
      "id": "unique-id",
      "agent": "agent-id",
      "intent": "what this specific task does",
      "inputRanges": [],
      "dependsOn": []
    }
  ]
}`;

interface PlannerOutput {
  intent: string;
  summary: string;
  confidence: number;
  requiresApproval: boolean;
  tasks: Array<{
    id: string;
    agent: string;
    intent: string;
    inputRanges?: Array<{ sheetId: string; start: string; end: string }>;
    dependsOn?: string[];
  }>;
}

export class LLMPlannerImpl implements PlannerLLM {
  constructor(private provider: LLMProvider) {}

  async decompose(message: string, context: LayeredContext): Promise<PlannedTask[]> {
    const contextSummary = this.buildContextSummary(context);

    try {
      const result = await this.provider.generateJSON<PlannerOutput>({
        systemPrompt: PLANNER_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `User request: "${message}"\n\nCurrent context:\n${contextSummary}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      if (!result.tasks || !Array.isArray(result.tasks) || result.tasks.length === 0) {
        return this.fallbackPlan(message, context);
      }

      return result.tasks.map((t: PlannerOutput['tasks'][number]) => ({
        id: t.id || crypto.randomUUID(),
        agent: t.agent || 'ai-assistant-agent',
        intent: t.intent || message,
        inputRanges: t.inputRanges ?? (context.selectedCells.length > 0 ? context.selectedCells : []),
        dependsOn: t.dependsOn ?? [],
      }));
    } catch (err) {
      console.warn('[LLMPlanner] Failed to get structured plan from LLM, using fallback:', err);
      return this.fallbackPlan(message, context);
    }
  }

  private buildContextSummary(context: LayeredContext): string {
    const parts: string[] = [];
    parts.push(`Active sheet: "${context.activeSheet.name}" (id: ${context.activeSheet.id})`);
    parts.push(`Sheet size: ${context.activeSheet.rowCount} rows × ${context.activeSheet.colCount} columns`);

    if (context.selectedCells.length > 0) {
      const sel = context.selectedCells.map(c => `${c.start}:${c.end}`).join(', ');
      parts.push(`Selected cells: ${sel}`);
    }

    if (context.semanticSummary) {
      parts.push(`Workbook summary: ${context.semanticSummary}`);
    }

    if (context.conversation.length > 0) {
      const recent = context.conversation.slice(-3);
      parts.push(`Recent conversation:\n${recent.map(c => `  ${c.role}: ${c.content}`).join('\n')}`);
    }

    return parts.join('\n');
  }

  /** Keyword-based fallback if the LLM fails to return valid JSON */
  private fallbackPlan(message: string, context: LayeredContext): PlannedTask[] {
    const lower = message.toLowerCase();
    let agent = 'ai-assistant-agent';

    if (lower.includes('formula') || lower.includes('sum') || lower.includes('calculate') || lower.includes('average')) {
      agent = 'formula-agent';
    } else if (lower.includes('chart') || lower.includes('graph') || lower.includes('visualiz')) {
      agent = 'chart-agent';
    } else if (lower.includes('format') || lower.includes('color') || lower.includes('bold')) {
      agent = 'formatting-agent';
    } else if (lower.includes('clean') || lower.includes('duplicate') || lower.includes('trim')) {
      agent = 'data-cleaning-agent';
    } else if (lower.includes('pivot')) {
      agent = 'pivot-agent';
    } else if (lower.includes('import') || lower.includes('csv') || lower.includes('upload')) {
      agent = 'import-agent';
    } else if (lower.includes('export') || lower.includes('download') || lower.includes('pdf')) {
      agent = 'export-agent';
    }

    return [
      {
        id: crypto.randomUUID(),
        agent,
        intent: message,
        inputRanges: context.selectedCells.length > 0
          ? context.selectedCells
          : [{ sheetId: context.activeSheet.id, start: 'A1', end: 'A1' }],
        dependsOn: [],
      },
    ];
  }
}
