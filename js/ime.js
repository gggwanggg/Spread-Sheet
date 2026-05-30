import { SpreadsheetUtils } from './utils.js';
import { SpreadsheetSelection } from './selection.js';
import { SpreadsheetDisplay } from './display.js';
import { SpreadsheetFormulaBar } from './formulaBar.js';

export const SpreadsheetIME = {
  syncIMEState(ctx, isComposing) {
    ctx.inputState.isComposing = isComposing;
  },

  isActive(ctx, event = null) {
    return ctx.inputState.isComposing || Boolean(event?.isComposing);
  },

  isCellEvent(ctx, event) {
    const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

    return cell !== null && ctx.selectionState.activeCell === cell;
  },

  handleCompositionStart(ctx, event) {
    const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

    if (!cell || ctx.selectionState.activeCell !== cell) {
      return;
    }

    this.syncIMEState(ctx, true);

    if (!ctx.selectionState.isEditing) {
      SpreadsheetSelection.enterEditMode(ctx, { replaceContent: true, seedText: '' });
    }
  },

  handleCompositionUpdate(ctx, event) {
    if (!this.isCellEvent(ctx, event) || !ctx.inputState.isComposing) {
      return;
    }
  },

  handleCompositionEnd(ctx, event) {
    if (!this.isCellEvent(ctx, event)) {
      return;
    }

    this.syncIMEState(ctx, false);

    if (ctx.selectionState.isEditing) {
      SpreadsheetSelection.commitCellValue(ctx);
      const { activeRow, activeCol } = ctx.selectionState;

      if (activeRow !== null && activeCol !== null) {
        SpreadsheetFormulaBar.syncFromCell(ctx, activeRow, activeCol, { force: true });
      }
    }
  },

  handleCellInput(ctx, event) {
    const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

    if (!cell || !ctx.selectionState.isEditing || ctx.selectionState.activeCell !== cell) {
      return;
    }

    if (ctx.inputState.isComposing) {
      return;
    }

    SpreadsheetSelection.commitCellValue(ctx);
    SpreadsheetDisplay.syncOverflowState(ctx);
  },

  handleFormulaCompositionStart(ctx) {
    this.syncIMEState(ctx, true);
  },

  handleFormulaCompositionUpdate(ctx) {
    if (!ctx.inputState.isComposing) {
      return;
    }
  },

  handleFormulaCompositionEnd(ctx) {
    this.syncIMEState(ctx, false);

    const input = ctx.dom.formulaInput;

    if (input) {
      SpreadsheetFormulaBar.applyToCell(ctx, input.value);
    }
  },

  handleFormulaInput(ctx) {
    if (ctx.inputState.isComposing) {
      return;
    }

    const input = ctx.dom.formulaInput;

    if (input) {
      SpreadsheetFormulaBar.applyToCell(ctx, input.value);
    }
  },
};
