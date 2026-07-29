import type { RangeRef, CommandSource, ToolContext } from "@mona/schema";

export function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1;
}

export function parseRange(rangeStr: string, sheetId: string): RangeRef {
  const match = rangeStr.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i);
  if (!match) {
    // Try single cell: "A1"
    const cellMatch = rangeStr.match(/^([A-Z]+)(\d+)$/i);
    if (cellMatch) {
      const col = columnLetterToIndex(cellMatch[1]!);
      const row = parseInt(cellMatch[2]!, 10) - 1;
      return { sheetId, startRow: row, startCol: col, endRow: row, endCol: col };
    }
    throw new Error(`Invalid range format: ${rangeStr}. Use "A1:D10" or "A1".`);
  }

  return {
    sheetId,
    startRow: parseInt(match[2]!, 10) - 1,
    startCol: columnLetterToIndex(match[1]!),
    endRow: parseInt(match[4]!, 10) - 1,
    endCol: columnLetterToIndex(match[3]!),
  };
}

export function makeSource(ctx: ToolContext): CommandSource {
  return {
    origin: "ai",
    sessionId: ctx.sessionId,
    userId: ctx.userId,
  };
}
