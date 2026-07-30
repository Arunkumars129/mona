/* eslint-disable */
let univerAPI: any = null;

export function setUniverAPI(api: any): void {
    univerAPI = api;
}

export function getUniverAPI(): any {
    return univerAPI;
}

export function getWorkbookSnapshot(): {
    workbookId: string;
    activeSheetId: string;
    sheets: { id: string; name: string; rowCount: number; colCount: number; index: number }[];
} | null {
    const api = getUniverAPI();
    if (!api) return null;
    try {
        const workbook = api.getActiveWorkbook?.();
        if (!workbook) return null;
        const snapshot = workbook.getSnapshot?.();
        if (!snapshot?.sheets) return null;
        const sheets = Object.entries(snapshot.sheets).map(
            ([id, sheet]: [string, any], index: number) => ({
                id,
                name: sheet.name ?? `Sheet${index + 1}`,
                rowCount: sheet.rowCount ?? 1000,
                colCount: sheet.columnCount ?? 26,
                index,
            })
        );
        const activeSheetId = workbook.getActiveSheet?.()?.getSheetId?.() ?? sheets[0]?.id ?? "sheet-01";
        return { workbookId: workbook.getId?.() ?? "default", activeSheetId, sheets };
    } catch {
        return null;
    }
}

const STORAGE_KEY = "mona-workbook-save";

export function saveWorkbook(): boolean {
    const api = getUniverAPI();
    if (!api) return false;
    try {
        const workbook = api.getActiveWorkbook();
        if (!workbook) return false;
        const data = workbook.save();
        if (!data) return false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch {
        return false;
    }
}

export function loadSavedWorkbook(): Record<string, unknown> | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;
        return JSON.parse(saved) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export function downloadWorkbook(): boolean {
    const api = getUniverAPI();
    if (!api) return false;
    try {
        const workbook = api.getActiveWorkbook();
        if (!workbook) return false;
        const data = workbook.save();
        if (!data) return false;
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const name = workbook.getName?.() ?? "workbook";
        a.download = `${name.replace(/\s+/g, "_")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch {
        return false;
    }
}

function ensureSheet(
    workbook: any,
    sheetId: string,
    name?: string
): any | null {
    let sheet = workbook.getSheetBySheetId?.(sheetId);
    if (sheet) return sheet;
    // Try by name fallback
    if (name) {
        sheet = workbook.getSheetByName?.(name);
        if (sheet) return sheet;
    }
    // Create the sheet
    try {
        sheet = workbook.insertSheet?.(name ?? sheetId);
        return sheet ?? null;
    } catch {
        // insertSheet may not accept id; try via snapshot
        try {
            const allSheets = workbook.getSheets?.() ?? [];
            const index = allSheets.length;
            sheet = workbook.insertSheet?.(name ?? `Sheet${index + 1}`, index);
            return sheet ?? null;
        } catch {
            return null;
        }
    }
}

export function applySnapshot(
    sheets: { id: string; name: string }[],
    cells: Record<string, { row: number; col: number; value: unknown }[]>
): void {
    const api = getUniverAPI();
    if (!api) return;
    try {
        const workbook = api.getActiveWorkbook();
        if (!workbook) return;

        // Track created sheet IDs to avoid re-creating
        const createdSheets = new Set<string>();

        for (const sheetInfo of sheets) {
            if (createdSheets.has(sheetInfo.id)) continue;
            const sheet = ensureSheet(workbook, sheetInfo.id, sheetInfo.name);
            if (!sheet) continue;
            createdSheets.add(sheetInfo.id);

            // Rename if name differs
            try {
                if (sheetInfo.name && sheet.getSheetName?.() !== sheetInfo.name) {
                    sheet.setName?.(sheetInfo.name);
                }
            } catch {
                // ignore rename errors
            }

            // Apply cell values
            const sheetCells = cells[sheetInfo.id];
            if (!sheetCells) continue;
            for (const cell of sheetCells) {
                try {
                    const value = cell.value;
                    const range = sheet.getRange?.(cell.row, cell.col, 1, 1);
                    if (!range) continue;
                    // Detect formulas
                    if (typeof value === "string" && value.startsWith("=")) {
                        if (range.setFormula) {
                            range.setFormula(value);
                        } else if (range.setValue) {
                            range.setValue(value);
                        }
                    } else {
                        // Parse numeric strings
                        const num = typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)
                            ? parseFloat(value)
                            : value;
                        if (range.setValue) {
                            range.setValue(num);
                        }
                    }
                } catch {
                    // skip individual cell errors
                }
            }
        }
    } catch {
        // ignore snapshot errors
    }
}
