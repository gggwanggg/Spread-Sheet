import { SpreadsheetState } from './state.js';
import { SpreadsheetDisplay } from './display.js';
import { SpreadsheetIME } from './ime.js';

export const SpreadsheetFormulaBar = {
  isFocused(ctx) {
    return document.activeElement === ctx.dom.formulaInput;
  },

  applyToCell(ctx, value) {
    const { activeRow, activeCol, activeCell } = ctx.selectionState;

    if (activeRow === null || activeCol === null || !activeCell) {
      return;
    }

    if (ctx.inputState.isComposing) {
      return;
    }

    SpreadsheetState.setCellValue(ctx.sheetState, activeRow, activeCol, value, ctx);
    SpreadsheetState.writeCellToDOM(activeCell, value);
    SpreadsheetDisplay.syncOverflowState(ctx);
  },

  commit(ctx) {
    const input = ctx.dom.formulaInput;

    if (!input) {
      return;
    }

    SpreadsheetFormulaBar.applyToCell(ctx, input.value);
  },

  syncFromCell(ctx, rowIndex, colIndex, { force = false } = {}) {
    const input = ctx.dom.formulaInput;

    if (!input || ctx.suppressFormulaSync) {
      return;
    }

    if (!force && SpreadsheetFormulaBar.isFocused(ctx)) {
      return;
    }

    if (ctx.inputState.isComposing) {
      return;
    }

    const { isEditing, activeCell } = ctx.selectionState;

    if (isEditing && activeCell) {
      input.value = SpreadsheetState.readCellFromDOM(activeCell);
      return;
    }

    input.value = ctx.sheetState[rowIndex]?.[colIndex] ?? '';
  },

  syncOnFocus(ctx) {
    const { activeRow, activeCol } = ctx.selectionState;
    const input = ctx.dom.formulaInput;

    if (!input || activeRow === null || activeCol === null) {
      return;
    }

    const currentValue = ctx.sheetState[activeRow][activeCol] ?? '';

    ctx.formulaBarSnapshot = currentValue;
    input.value = currentValue;
  },

  bindEvents(ctx, { onFocus } = {}) {
    const input = ctx.dom.formulaInput;

    if (!input) {
      return;
    }

    input.addEventListener('focus', () => {
      ctx.isFormulaBarFocused = true;
      onFocus?.(ctx);
      SpreadsheetFormulaBar.syncOnFocus(ctx);
    });

    input.addEventListener('blur', () => {
      ctx.isFormulaBarFocused = false;

      if (!ctx.inputState.isComposing) {
        SpreadsheetFormulaBar.commit(ctx);
      }

      ctx.formulaBarSnapshot = null;
    });

    input.addEventListener('input', () => {
      SpreadsheetIME.handleFormulaInput(ctx);
    });

    input.addEventListener('compositionstart', () => {
      SpreadsheetIME.handleFormulaCompositionStart(ctx);
    });

    input.addEventListener('compositionupdate', () => {
      SpreadsheetIME.handleFormulaCompositionUpdate(ctx);
    });

    input.addEventListener('compositionend', () => {
      SpreadsheetIME.handleFormulaCompositionEnd(ctx);
    });

    input.addEventListener('keydown', (event) => {
      if (SpreadsheetIME.isActive(ctx, event)) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        SpreadsheetFormulaBar.commit(ctx);
        ctx.formulaBarSnapshot = null;
        ctx.dom.cellInput?.focus({ preventScroll: true });
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        const { activeRow, activeCol } = ctx.selectionState;

        if (activeRow !== null && activeCol !== null) {
          const restoredValue = ctx.formulaBarSnapshot ?? ctx.sheetState[activeRow][activeCol] ?? '';

          input.value = restoredValue;
          SpreadsheetFormulaBar.applyToCell(ctx, restoredValue);
        }

        ctx.formulaBarSnapshot = null;
        input.blur();
        ctx.dom.cellInput?.focus({ preventScroll: true });
      }
    });
  },
};
