import type { CellValue, RangeRef, SheetInfo, WorkbookSnapshot } from "@mona/schema";

export interface FormulaContext {
  readonly workbookId: string;
  readonly activeSheetId: string;
  readonly sheetName: string;
  readonly targetCell: string;
  readonly targetRangeRef: RangeRef;
  readonly sheets: SheetInfo[];
  readonly selectedValues?: CellValue[][];
  readonly headers?: string[];
  readonly snapshot?: WorkbookSnapshot;
}

export interface FormulaExplanation {
  readonly purpose: string;
  readonly stepByStepLogic: string[];
  readonly inputs: string[];
  readonly outputType: string;
  readonly edgeCases?: string[];
}

export interface FormulaResult {
  readonly success: boolean;
  readonly formula: string;
  readonly originalFormula?: string;
  readonly targetRange: string;
  readonly sheetId: string;
  readonly explanation?: FormulaExplanation;
  readonly warnings: string[];
  readonly validationErrors: string[];
  readonly executionTimeMs: number;
  readonly repaired: boolean;
  readonly optimized: boolean;
  readonly verified: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface FormulaTaskInput {
  readonly request: string;
  readonly sheetId: string;
  readonly targetCell?: string;
  readonly existingFormula?: string;
  readonly action?: "generate" | "repair" | "optimize" | "explain" | "execute";
}

export class FormulaAgentError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "FormulaAgentError";
    this.code = code;
    this.details = details;
  }
}
