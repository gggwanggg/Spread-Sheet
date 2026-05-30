import { SpreadsheetUtils } from './utils.js';
import { SpreadsheetSelection } from './selection.js';
import { SpreadsheetNavigation } from './navigation.js';
import { SpreadsheetCsv } from './csv.js';
import { SpreadsheetFormulaBar } from './formulaBar.js';
import { SpreadsheetCaret } from './caret.js';
import { SpreadsheetIME } from './ime.js';

export const SpreadsheetEvents = {
  bindGridEvents(ctx) {
    const { tbody } = ctx.dom;

    if (!tbody) {
      return;
    }

    tbody.addEventListener('click', (event) => {
      if (ctx.inputState.isComposing) {
        return;
      }

      const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

      if (!cell) {
        return;
      }

      const { rowIndex, colIndex } = SpreadsheetUtils.parseCellCoordinates(cell);
      const isActiveCell = ctx.selectionState.activeCell === cell;
      const cellValue = ctx.sheetState[rowIndex]?.[colIndex] ?? '';

      if (
        isActiveCell &&
        !ctx.selectionState.isEditing &&
        cellValue &&
        SpreadsheetCaret.hitTestInCell(event.clientX, event.clientY, cell)
      ) {
        SpreadsheetSelection.enterEditMode(ctx, {
          preserveContent: true,
          caretPoint: { x: event.clientX, y: event.clientY },
        });
        return;
      }

      SpreadsheetSelection.selectCell(ctx, rowIndex, colIndex);
    });

    tbody.addEventListener('dblclick', (event) => {
      if (ctx.inputState.isComposing) {
        return;
      }

      const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

      if (!cell) {
        return;
      }

      event.preventDefault();

      const { rowIndex, colIndex } = SpreadsheetUtils.parseCellCoordinates(cell);

      SpreadsheetSelection.selectCell(ctx, rowIndex, colIndex, { focus: false });
      SpreadsheetSelection.enterEditMode(ctx, {
        preserveContent: true,
        caretPoint: { x: event.clientX, y: event.clientY },
      });
    });

    tbody.addEventListener('beforeinput', (event) => {
      const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

      if (!cell || ctx.selectionState.activeCell !== cell) {
        return;
      }

      if (event.inputType === 'insertCompositionText' || event.isComposing) {
        SpreadsheetIME.syncIMEState(ctx, true);

        if (!ctx.selectionState.isEditing) {
          SpreadsheetSelection.enterEditMode(ctx, { replaceContent: true, seedText: '' });
        }
      }
    });

    tbody.addEventListener('compositionstart', (event) => {
      SpreadsheetIME.handleCompositionStart(ctx, event);
    });

    tbody.addEventListener('compositionupdate', (event) => {
      SpreadsheetIME.handleCompositionUpdate(ctx, event);
    });

    tbody.addEventListener('compositionend', (event) => {
      SpreadsheetIME.handleCompositionEnd(ctx, event);
    });

    tbody.addEventListener('input', (event) => {
      SpreadsheetIME.handleCellInput(ctx, event);
    });

    tbody.addEventListener(
      'blur',
      (event) => {
        const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

        if (!cell || !ctx.selectionState.isEditing || ctx.selectionState.activeCell !== cell) {
          return;
        }

        if (ctx.inputState.isComposing || ctx.suppressEditBlur) {
          return;
        }

        const nextTarget = event.relatedTarget;

        if (nextTarget instanceof Node && cell.contains(nextTarget)) {
          return;
        }

        SpreadsheetSelection.exitEditMode(ctx, { save: true });
      },
      true
    );

    tbody.addEventListener('keydown', (event) => {
      if (SpreadsheetIME.isActive(ctx, event)) {
        return;
      }

      if (!ctx.inputState.isDirectEdit) {
        return;
      }

      const { activeCell } = ctx.selectionState;

      if (!activeCell) {
        return;
      }

      const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

      if (cell !== activeCell && event.target !== ctx.dom.grid) {
        return;
      }

      SpreadsheetNavigation.handleCellKeydown(ctx, event);
    });

    const { grid } = ctx.dom;

    grid?.addEventListener('focusin', (event) => {
      if (
        ctx.inputState.isDirectEdit ||
        ctx.inputState.isComposing ||
        ctx.isFormulaBarFocused
      ) {
        return;
      }

      if (
        event.target === grid ||
        event.target === ctx.selectionState.activeCell
      ) {
        ctx.dom.cellInput?.focus({ preventScroll: true });
      }
    });
  },

  bindFormulaBarEvents(ctx) {
    SpreadsheetFormulaBar.bindEvents(ctx, {
      onFocus(focusCtx) {
        if (focusCtx.selectionState.isEditing) {
          SpreadsheetSelection.exitEditMode(focusCtx, { save: true });
        }
      },
    });
  },

  bindExportEvent(ctx) {
    const { exportButton } = ctx.dom;

    if (!exportButton) {
      return;
    }

    exportButton.addEventListener('click', () => {
      SpreadsheetCsv.downloadCSV(ctx.sheetState, () => {
        if (SpreadsheetFormulaBar.isFocused(ctx)) {
          SpreadsheetFormulaBar.commit(ctx);
        }

        if (ctx.selectionState.isEditing) {
          SpreadsheetSelection.exitEditMode(ctx, { save: true });
        }
      });
    });
  },
};
