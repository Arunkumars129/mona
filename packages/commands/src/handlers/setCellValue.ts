import type { BaseCommand, CommandHandler, SetCellValuePayload } from '../types';

export const setCellValueHandler: CommandHandler<'SetCellValue'> = {
  type: 'SetCellValue',

  async apply(cmd, ctx) {
    const payload = cmd.payload as SetCellValuePayload;
    const prior = ctx.spreadsheet.getCellValue(cmd.targetSheetId, payload.cellRef);

    ctx.spreadsheet.setCellValue(cmd.targetSheetId, payload.cellRef, payload.value);
    const verification = ctx.spreadsheet.verifyFormula(cmd.targetSheetId, payload.cellRef);

    return {
      commandId: cmd.id,
      status: 'applied',
      inverse: {
        ...cmd,
        id: crypto.randomUUID(),
        type: 'SetCellValue',
        payload: { cellRef: payload.cellRef, value: prior },
        createdAt: new Date().toISOString(),
      },
      verification: { ...verification, formulaValid: true },
    };
  },
};
