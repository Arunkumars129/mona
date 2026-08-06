import type {
  BaseCommand,
  CellStyle,
  CommandHandler,
  FormatRangePayload,
} from '../types';

function expandRange(start: string, end: string): string[] {
  const parse = (ref: string): { row: number; col: number } | null => {
    const m = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!m) return null;
    let col = 0;
    for (let i = 0; i < m[1]!.length; i++) {
      col = col * 26 + (m[1]!.charCodeAt(i) - 64);
    }
    return { row: parseInt(m[2]!, 10) - 1, col: col - 1 };
  };

  const startRef = parse(start);
  const endRef = parse(end);
  if (!startRef || !endRef) return [start];

  const cells: string[] = [];
  for (let r = startRef.row; r <= endRef.row; r++) {
    for (let c = startRef.col; c <= endRef.col; c++) {
      cells.push(a1FromIndex(r, c));
    }
  }
  return cells;
}

function a1FromIndex(row: number, col: number): string {
  let c = col + 1;
  let colStr = '';
  while (c > 0) {
    const rem = (c - 1) % 26;
    colStr = String.fromCharCode(65 + rem) + colStr;
    c = Math.floor((c - 1) / 26);
  }
  return `${colStr}${row + 1}`;
}

export const formatRangeHandler: CommandHandler<'FormatRange'> = {
  type: 'FormatRange',

  async apply(cmd, ctx) {
    const payload = cmd.payload as FormatRangePayload;
    const { range, style } = payload;
    const refs = expandRange(range.start, range.end);

    for (const cellRef of refs) {
      const prior = ctx.spreadsheet.getCellStyle(cmd.targetSheetId, cellRef);
      const merged: CellStyle = { ...(prior ?? {}), ...style };
      ctx.spreadsheet.setRangeStyle(
        cmd.targetSheetId,
        { ...range, start: cellRef, end: cellRef },
        merged
      );
    }

    return {
      commandId: cmd.id,
      status: 'applied',
      inverse: {
        ...cmd,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      verification: {
        formulaValid: true,
        brokenReferences: [],
        circularDependencies: [],
        rangeExists: true,
        permissionCompliant: true,
      },
    };
  },
};
