import type { BaseCommand, CommandHandler, SetFormulaPayload } from '../types.js';

export const setFormulaHandler: CommandHandler<'SetFormula'> = {
  type: 'SetFormula',

  async apply(cmd, ctx) {
    const payload = cmd.payload as SetFormulaPayload;
    const prior = ctx.spreadsheet.getCellFormula(cmd.targetSheetId, payload.cellRef);

    ctx.spreadsheet.setFormula(cmd.targetSheetId, payload.cellRef, payload.formula);
    const verification = ctx.spreadsheet.verifyFormula(cmd.targetSheetId, payload.cellRef);

    return {
      commandId: cmd.id,
      status: verification.formulaValid ? 'applied' : 'failed',
      inverse: prior
        ? {
            ...cmd,
            id: crypto.randomUUID(),
            type: 'SetFormula',
            payload: { cellRef: payload.cellRef, formula: prior },
            createdAt: new Date().toISOString(),
          }
        : undefined,
      verification,
    };
  },
};
