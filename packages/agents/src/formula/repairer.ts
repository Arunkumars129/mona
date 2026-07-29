export interface RepairResult {
  readonly repairedFormula: string;
  readonly wasRepaired: boolean;
  readonly repairDetails: string[];
}

export class FormulaRepairer {
  private readonly functionDictionary: Record<string, string> = {
    SUMM: "SUM",
    AVERGAE: "AVERAGE",
    AVERG: "AVERAGE",
    VLOOKUPP: "VLOOKUP",
    XLOOKUPP: "XLOOKUP",
    COUNTT: "COUNT",
    COUNTIFF: "COUNTIF",
    IFSERROR: "IFERROR",
  };

  /**
   * Automatically repairs broken formula syntax, misspelling, and error conditions.
   */
  repair(formula: string, errorToken?: string): RepairResult {
    let current = formula.trim();
    const details: string[] = [];

    // 1. Ensure starts with "="
    if (!current.startsWith("=")) {
      current = "=" + current;
      details.push("Added missing '=' prefix.");
    }

    // 2. Fix misspelled function names (#NAME? repair)
    for (const [wrong, right] of Object.entries(this.functionDictionary)) {
      const reg = new RegExp(`\\b${wrong}\\(`, "gi");
      if (reg.test(current)) {
        current = current.replace(reg, `${right}(`);
        details.push(`Repaired misspelled function name '${wrong}' to '${right}'.`);
      }
    }

    // 3. Handle #REF! error token
    if (current.includes("#REF!")) {
      current = current.replace(/#REF!/g, "A1");
      details.push("Replaced broken reference '#REF!' with default cell reference 'A1'.");
    }

    // 4. Handle #DIV/0! error condition
    if (errorToken === "#DIV/0!" || current.includes("#DIV/0!")) {
      current = current.replace(/#DIV\/0!/g, "0");
      if (!current.toUpperCase().includes("IFERROR")) {
        current = `=IFERROR(${current.replace(/^=/, "")}, 0)`;
        details.push("Wrapped division expression in IFERROR(..., 0) to guard against #DIV/0! errors.");
      }
    }

    // 5. Handle #N/A error condition
    if (errorToken === "#N/A" || current.includes("#N/A")) {
      if (!current.toUpperCase().includes("IFNA") && !current.toUpperCase().includes("IFERROR")) {
        current = `=IFNA(${current.replace(/^=/, "")}, "")`;
        details.push("Wrapped lookup formula in IFNA(..., \"\") to handle missing matches gracefully.");
      }
    }

    // 6. Fix unbalanced parentheses
    let openCount = 0;
    let closeCount = 0;
    for (const char of current) {
      if (char === "(") openCount++;
      if (char === ")") closeCount++;
    }
    if (openCount > closeCount) {
      const missing = openCount - closeCount;
      current += ")".repeat(missing);
      details.push(`Appended ${missing} missing closing parentheses.`);
    }

    return {
      repairedFormula: current,
      wasRepaired: details.length > 0 && current !== formula,
      repairDetails: details,
    };
  }
}
