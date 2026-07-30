import type { CommandType } from '@repo/commands';
import type { A1Range, Capability } from '@repo/shared';

export interface ToolDefinition {
  name: string;
  description: string;
  commandType: CommandType;
  capabilities: Capability[];
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  /** Agent write scope — ranges passed to tool must be subset of task.inputRanges */
  boundedRange: boolean;
}

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  forCapabilities(caps: Capability[]): ToolDefinition[] {
    return [...this.tools.values()].filter((t) =>
      t.capabilities.some((c) => caps.includes(c))
    );
  }

  toOpenAITools(caps: Capability[]): object[] {
    return this.forCapabilities(caps).map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: t.parameters,
          required: Object.entries(t.parameters)
            .filter(([, v]) => v.required)
            .map(([k]) => k),
        },
      },
    }));
  }
}

export const defaultTools: ToolDefinition[] = [
  {
    name: 'set_cell_value',
    description: 'Set a cell value within the assigned range',
    commandType: 'SetCellValue',
    capabilities: ['formula', 'cleaning', 'assistant'],
    boundedRange: true,
    parameters: {
      cellRef: { type: 'string', description: 'A1 cell reference', required: true },
      value: { type: 'string', description: 'Cell value', required: true },
      sheetId: { type: 'string', description: 'Target sheet ID', required: true },
    },
  },
  {
    name: 'set_formula',
    description: 'Set a formula in a cell within the assigned range',
    commandType: 'SetFormula',
    capabilities: ['formula'],
    boundedRange: true,
    parameters: {
      cellRef: { type: 'string', description: 'A1 cell reference', required: true },
      formula: { type: 'string', description: 'Excel-style formula', required: true },
      sheetId: { type: 'string', description: 'Target sheet ID', required: true },
    },
  },
];

export function validateToolRange(
  toolRange: A1Range | undefined,
  allowedRanges: A1Range[]
): boolean {
  if (!toolRange) return false;
  return allowedRanges.some((a) => a.sheetId === toolRange.sheetId);
}
