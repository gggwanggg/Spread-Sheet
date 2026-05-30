import { SpreadsheetConfig } from './config.js';
import { SpreadsheetUtils } from './utils.js';
import { SpreadsheetState } from './state.js';
import { SpreadsheetGrid } from './grid.js';
import { SpreadsheetCaret } from './caret.js';
import { SpreadsheetDisplay } from './display.js';
import { SpreadsheetFormulaBar } from './formulaBar.js';
import { SpreadsheetIME } from './ime.js';

const { CLASSES, ARIA, TAB_INDEX } = SpreadsheetConfig;

function focusCellInput(ctx) {
  ctx.dom.cellInput?.focus({ preventScroll: true });
}

function clearCellInput(ctx) {
  if (ctx.dom.cellInput) {
    ctx.dom.cellInput.value = '';
  }
}

function blurCellInput(ctx) {
  ctx.dom.cellInput?.blur();
}

export const SpreadsheetSelection = {
  clearSelectionVisual(ctx) {
    const { activeCell, activeRow, activeCol } = ctx.selectionState;

    if (activeCell) {
      SpreadsheetDisplay.collapseCell(activeCell);
      activeCell.classList.remove(CLASSES.CELL_ACTIVE, CLASSES.CELL_EDITING);
      activeCell.setAttribute('aria-selected', ARIA.SELECTED_FALSE);
      activeCell.setAttribute('contenteditable', 'false');
      activeCell.tabIndex = Number(TAB_INDEX.INACTIVE);
    }

    if (activeRow !== null && activeCol !== null) {
      ctx.headers.columns[activeCol]?.classList.remove(CLASSES.COLUMN_HEADER_ACTIVE);
      ctx.headers.rows[activeRow]?.classList.remove(CLASSES.ROW_HEADER_ACTIVE);
    }

    ctx.dom.grid.removeAttribute('aria-activedescendant');
    ctx.lastOverflowCell = null;
  },

  applySelectionVisual(ctx, rowIndex, colIndex, cell) {
    const columnHeader = ctx.headers.columns[colIndex];
    const rowHeader = ctx.headers.rows[rowIndex];

    cell.classList.add(CLASSES.CELL_ACTIVE);
    cell.setAttribute('aria-selected', ARIA.SELECTED_TRUE);
    cell.setAttribute('contenteditable', 'false');
    cell.tabIndex = Number(TAB_INDEX.ACTIVE);

    columnHeader?.classList.add(CLASSES.COLUMN_HEADER_ACTIVE);
    rowHeader?.classList.add(CLASSES.ROW_HEADER_ACTIVE);

    ctx.dom.grid.setAttribute('aria-activedescendant', SpreadsheetUtils.getCellId(rowIndex, colIndex));
    ctx.dom.nameBox.textContent = SpreadsheetUtils.formatCellAddress(rowIndex, colIndex);
    SpreadsheetFormulaBar.syncFromCell(ctx, rowIndex, colIndex);
  },

  selectCell(ctx, rowIndex, colIndex, options = {}) {
    if (ctx.inputState.isComposing) {
      return ctx.selectionState.activeCell;
    }

    const { rowIndex: nextRow, colIndex: nextCol } = SpreadsheetUtils.clampCoordinates(rowIndex, colIndex);

    if (SpreadsheetFormulaBar.isFocused(ctx)) {
      SpreadsheetFormulaBar.commit(ctx);
    }

    if (ctx.selectionState.isEditing) {
      this.exitEditMode(ctx, { save: true });
    }

    const cell = SpreadsheetGrid.getDataCellElement(ctx, nextRow, nextCol);

    if (!(cell instanceof HTMLTableCellElement)) {
      return null;
    }

    if (
      ctx.selectionState.activeCell === cell &&
      !ctx.selectionState.isEditing &&
      !options.force
    ) {
      SpreadsheetDisplay.syncOverflowState(ctx);
      if (options.focus !== false && !ctx.inputState.isDirectEdit) {
        focusCellInput(ctx);
      }
      return cell;
    }

    this.clearSelectionVisual(ctx);

    ctx.selectionState.activeRow = nextRow;
    ctx.selectionState.activeCol = nextCol;
    ctx.selectionState.activeCell = cell;
    ctx.selectionState.isEditing = false;

    SpreadsheetState.writeCellToDOM(cell, ctx.sheetState[nextRow][nextCol]);
    this.applySelectionVisual(ctx, nextRow, nextCol, cell);
    SpreadsheetDisplay.syncOverflowState(ctx);

    if (options.focus !== false) {
      focusCellInput(ctx);
    }

    return cell;
  },

  enterEditMode(ctx, options = {}) {
    const { activeCell, activeRow, activeCol, isEditing } = ctx.selectionState;

    if (!activeCell) {
      return;
    }

    if (isEditing) {
      return;
    }

    ctx.inputState.isDirectEdit = true;
    clearCellInput(ctx);
    blurCellInput(ctx);

    const storedValue = ctx.sheetState[activeRow][activeCol];
    const replaceContent = options.replaceContent === true;
    const initialValue = replaceContent
      ? (options.seedText ?? '')
      : storedValue;

    ctx.editSnapshot = storedValue;
    ctx.selectionState.isEditing = true;

    SpreadsheetDisplay.updateCellDisplay(activeCell, initialValue);

    if (replaceContent) {
      SpreadsheetState.setCellValue(ctx.sheetState, activeRow, activeCol, initialValue, ctx);
    }

    activeCell.classList.add(CLASSES.CELL_EDITING);
    SpreadsheetDisplay.syncOverflowState(ctx);

    const editTarget = SpreadsheetDisplay.getEditTarget(activeCell);
    ctx.suppressEditBlur = true;
    editTarget.focus();
    ctx.suppressEditBlur = false;

    SpreadsheetFormulaBar.syncFromCell(ctx, activeRow, activeCol);

    if (options.caretPoint) {
      SpreadsheetCaret.placeFromPoint(options.caretPoint.x, options.caretPoint.y, editTarget);
      return;
    }

    if (replaceContent && !options.seedText) {
      SpreadsheetCaret.placeAtStart(editTarget);
      return;
    }

    SpreadsheetCaret.placeAtEnd(editTarget);
  },

  exitEditMode(ctx, { save = true } = {}) {
    const { activeCell, activeRow, activeCol, isEditing } = ctx.selectionState;

    if (!isEditing || !activeCell) {
      return;
    }

    const restoredValue = save
      ? SpreadsheetState.readCellFromDOM(activeCell)
      : (ctx.editSnapshot ?? ctx.sheetState[activeRow][activeCol]);

    if (save) {
      SpreadsheetState.setCellValue(ctx.sheetState, activeRow, activeCol, restoredValue, ctx);
    }

    SpreadsheetDisplay.updateCellDisplay(activeCell, restoredValue);

    const display = SpreadsheetDisplay.getDisplayElement(activeCell);
    display?.setAttribute('contenteditable', 'false');

    activeCell.classList.remove(CLASSES.CELL_EDITING);
    activeCell.setAttribute('contenteditable', 'false');
    ctx.selectionState.isEditing = false;
    ctx.editSnapshot = null;
    ctx.inputState.isDirectEdit = false;
    SpreadsheetIME.syncIMEState(ctx, false);

    SpreadsheetDisplay.syncOverflowState(ctx);
    SpreadsheetFormulaBar.syncFromCell(ctx, activeRow, activeCol);

    clearCellInput(ctx);
    focusCellInput(ctx);
  },

  commitCellValue(ctx) {
    const { activeRow, activeCol } = ctx.selectionState;

    SpreadsheetState.commitCellValue(ctx);
    SpreadsheetDisplay.syncOverflowState(ctx);

    if (activeRow !== null && activeCol !== null) {
      SpreadsheetFormulaBar.syncFromCell(ctx, activeRow, activeCol);
    }
  },

  handleCellKeydown(ctx, event) {
    if (SpreadsheetIME.isActive(ctx, event)) {
      return;
    }

    if (ctx.selectionState.isEditing) {
      return;
    }

    if (event.key === 'F2') {
      event.preventDefault();
      this.enterEditMode(ctx, { preserveContent: true });
    }
  },
};
