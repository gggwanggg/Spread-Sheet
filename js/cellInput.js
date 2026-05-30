import { SpreadsheetConfig } from './config.js';
import { SpreadsheetState } from './state.js';
import { SpreadsheetDisplay } from './display.js';
import { SpreadsheetFormulaBar } from './formulaBar.js';
import { SpreadsheetNavigation } from './navigation.js';
import { SpreadsheetIME } from './ime.js';

const { CLASSES } = SpreadsheetConfig;

export const SpreadsheetCellInput = {
  isFocused(ctx) {
    return document.activeElement === ctx.dom.cellInput;
  },

  focus(ctx) {
    ctx.dom.cellInput?.focus({ preventScroll: true });
  },

  blur(ctx) {
    ctx.dom.cellInput?.blur();
  },

  clear(ctx) {
    if (ctx.dom.cellInput) {
      ctx.dom.cellInput.value = '';
    }
  },

  syncToCell(ctx) {
    const input = ctx.dom.cellInput;
    const { activeCell, activeRow, activeCol } = ctx.selectionState;

    if (!input || !activeCell || activeRow === null || activeCol === null) {
      return;
    }

    const value = input.value;

    SpreadsheetDisplay.updateCellDisplay(activeCell, value);
    SpreadsheetState.setCellValue(ctx.sheetState, activeRow, activeCol, value, ctx);
    SpreadsheetDisplay.syncOverflowState(ctx);
    SpreadsheetFormulaBar.syncFromCell(ctx, activeRow, activeCol);
  },

  beginProxyEdit(ctx) {
    const { activeCell, activeRow, activeCol, isEditing } = ctx.selectionState;

    if (isEditing || !activeCell || activeRow === null || activeCol === null) {
      return;
    }

    ctx.editSnapshot = ctx.sheetState[activeRow][activeCol];
    ctx.inputState.isDirectEdit = false;
    ctx.selectionState.isEditing = true;

    activeCell.classList.add(CLASSES.CELL_EDITING);
    SpreadsheetDisplay.syncOverflowState(ctx);
  },

  bindEvents(ctx) {
    const input = ctx.dom.cellInput;

    if (!input) {
      return;
    }

    input.addEventListener('compositionstart', () => {
      SpreadsheetIME.syncIMEState(ctx, true);

      if (!ctx.selectionState.isEditing) {
        SpreadsheetCellInput.beginProxyEdit(ctx);
      }
    });

    input.addEventListener('compositionupdate', () => {
      if (!ctx.inputState.isComposing) {
        return;
      }
    });

    input.addEventListener('compositionend', () => {
      SpreadsheetIME.syncIMEState(ctx, false);
      SpreadsheetCellInput.syncToCell(ctx);
    });

    input.addEventListener('input', () => {
      if (ctx.inputState.isComposing) {
        SpreadsheetCellInput.syncToCell(ctx);
        return;
      }

      if (!ctx.selectionState.isEditing) {
        SpreadsheetCellInput.beginProxyEdit(ctx);
      }

      SpreadsheetCellInput.syncToCell(ctx);
    });

    input.addEventListener('keydown', (event) => {
      if (SpreadsheetIME.isActive(ctx, event)) {
        return;
      }

      SpreadsheetNavigation.handleCellInputKeydown(ctx, event);
    });
  },
};
