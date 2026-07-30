export type CellChangeType = 'value' | 'formula' | 'format' | 'structural';

export interface CellDiff {
  cellRef: string;
  sheetId: string;
  before: unknown;
  after: unknown;
  changeType: CellChangeType;
}

/** Formula-primary diff; computed values shown on hover in UI */
export function diffStates(
  before: Record<string, { value: unknown; formula: string | null }>,
  after: Record<string, { value: unknown; formula: string | null }>
): CellDiff[] {
  const diffs: CellDiff[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const b = before[key];
    const a = after[key];
    if (!b && a) {
      diffs.push({ cellRef: key, sheetId: '', before: null, after: a, changeType: 'value' });
    } else if (b && !a) {
      diffs.push({ cellRef: key, sheetId: '', before: b, after: null, changeType: 'structural' });
    } else if (b && a) {
      if (b.formula !== a.formula) {
        diffs.push({ cellRef: key, sheetId: '', before: b.formula, after: a.formula, changeType: 'formula' });
      } else if (b.value !== a.value) {
        diffs.push({ cellRef: key, sheetId: '', before: b.value, after: a.value, changeType: 'value' });
      }
    }
  }
  return diffs;
}
