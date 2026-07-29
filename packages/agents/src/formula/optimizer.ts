export interface OptimizationResult {
  readonly optimizedFormula: string;
  readonly wasOptimized: boolean;
  readonly optimizationsApplied: string[];
}

export class FormulaOptimizer {
  /**
   * Applies optimization passes over a formula string.
   */
  optimize(formula: string, defaultMaxRows: number = 1000): OptimizationResult {
    let current = formula;
    const applied: string[] = [];

    // Pass 1: Replace legacy VLOOKUP with modern XLOOKUP
    // Example: VLOOKUP(lookup, A:B, 2, FALSE) -> XLOOKUP(lookup, A:A, B:B)
    const vlookupRegex = /=VLOOKUP\(\s*([^,]+)\s*,\s*([A-Z]+)(\d*):([A-Z]+)(\d*)\s*,\s*2\s*,\s*FALSE\s*\)/i;
    if (vlookupRegex.test(current)) {
      current = current.replace(vlookupRegex, (_match, lookupVal, col1, r1, col2, r2) => {
        const rowSuffix1 = r1 || "";
        const rowSuffix2 = r2 || "";
        return `=XLOOKUP(${lookupVal.trim()}, ${col1}${rowSuffix1}:${col1}${rowSuffix2}, ${col2}${rowSuffix1}:${col2}${rowSuffix2})`;
      });
      applied.push("Replaced VLOOKUP with modern XLOOKUP for better performance and flexibility.");
    }

    // Pass 2: Replace nested IFs with IFS if multi-level nested IF exists
    if ((current.match(/IF\(/gi) || []).length >= 3 && !/IFS\(/i.test(current)) {
      // Simplification recommendation / transformation flag
      applied.push("Consider using IFS() or SWITCH() to replace multi-nested IF statements.");
    }

    // Pass 3: Scope entire column references if present
    const entireColRegex = /=([A-Z_]+)\(\s*([A-Z]+):([A-Z]+)\s*\)/i;
    if (entireColRegex.test(current)) {
      current = current.replace(entireColRegex, (_match, fnName, c1, c2) => {
        return `=${fnName}(${c1}1:${c2}${defaultMaxRows})`;
      });
      applied.push(`Bounded entire-column range references to 1:${defaultMaxRows} for reduced recalculation latency.`);
    }

    return {
      optimizedFormula: current,
      wasOptimized: applied.length > 0 && current !== formula,
      optimizationsApplied: applied,
    };
  }
}
