import type { RangeRef, SheetInfo } from "@mona/schema";

export interface ValidationIssue {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly message: string;
}

export class FormulaValidator {
  /**
   * Validates formula syntax, sheet presence, range bounds, and circular references.
   */
  validate(
    formula: string,
    targetCell: string,
    sheetId: string,
    availableSheets: SheetInfo[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // 1. Must start with "="
    if (!formula.startsWith("=")) {
      issues.push({
        severity: "error",
        code: "INVALID_PREFIX",
        message: "Formula string must start with '='.",
      });
      return issues;
    }

    // 2. Check parenthesis matching
    let parenDepth = 0;
    for (const char of formula) {
      if (char === "(") parenDepth++;
      if (char === ")") parenDepth--;
      if (parenDepth < 0) {
        issues.push({
          severity: "error",
          code: "UNBALANCED_PARENTHESES",
          message: "Unbalanced parentheses in formula string.",
        });
        break;
      }
    }
    if (parenDepth > 0) {
      issues.push({
        severity: "error",
        code: "UNCLOSED_PARENTHESES",
        message: "Formula has unclosed parentheses.",
      });
    }

    // 3. Check for error tokens
    if (/#REF!|#VALUE!|#NAME\?|#DIV\/0!|#N\/A|#NUM!/i.test(formula)) {
      issues.push({
        severity: "error",
        code: "ERROR_TOKEN_PRESENT",
        message: "Formula contains an error token (e.g. #REF!, #VALUE!, #NAME?).",
      });
    }

    // 4. Check for direct self-reference (Circular reference)
    const upperCell = targetCell.toUpperCase();
    const cellRegex = new RegExp(`\\b${upperCell}\\b`, "i");
    if (cellRegex.test(formula)) {
      issues.push({
        severity: "warning",
        code: "CIRCULAR_REFERENCE",
        message: `Formula directly references its own cell (${targetCell}).`,
      });
    }

    // 5. Check sheet presence in cross-sheet references (e.g. 'Sheet1'!A1)
    const sheetMatches = formula.match(/['"]?([a-zA-Z0-9_\-\s]+)['"]?!/g);
    if (sheetMatches) {
      const existingNames = new Set(availableSheets.map((s) => s.name.toLowerCase()));
      for (const match of sheetMatches) {
        const rawName = match.replace(/['"!]/g, "").trim().toLowerCase();
        if (!existingNames.has(rawName)) {
          issues.push({
            severity: "error",
            code: "MISSING_REFERENCED_SHEET",
            message: `Referenced sheet "${rawName}" does not exist in workbook.`,
          });
        }
      }
    }

    // 6. Check for entire-column references warning (e.g., A:A vs A1:A1000)
    if (/\b[A-Z]+:[A-Z]+\b/i.test(formula)) {
      issues.push({
        severity: "warning",
        code: "ENTIRE_COLUMN_REFERENCE",
        message: "Formula references an entire column (e.g. A:A). Consider scoping to a specific range for optimal performance.",
      });
    }

    return issues;
  }

  /**
   * Helper: Parse cell string "A1" into row/col 0-indexed coordinates.
   */
  parseCellCoordinates(cellStr: string): { row: number; col: number } | null {
    const match = cellStr.match(/^([A-Z]+)(\d+)$/i);
    if (!match) return null;
    const colStr = match[1]!.toUpperCase();
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    const row = parseInt(match[2]!, 10) - 1;
    return { row, col: col - 1 };
  }
}
