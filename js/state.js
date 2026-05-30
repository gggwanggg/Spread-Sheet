import { SpreadsheetConfig } from './config.js';
import { SpreadsheetUtils } from './utils.js';
import { SpreadsheetDisplay } from './display.js';
import { SpreadsheetStorage } from './storage.js';

const { GRID_SIZE } = SpreadsheetConfig;

export const SpreadsheetState = {
  createEmptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  },

  setCellValue(sheetState, rowIndex, colIndex, value, ctx) {
    sheetState[rowIndex][colIndex] = value;

    if (ctx) {
      SpreadsheetStorage.scheduleSave(ctx);
    }
  },

  readCellFromDOM(cell) {
    const editTarget = SpreadsheetDisplay.getEditTarget(cell);

    return editTarget.textContent ?? '';
  },

  writeCellToDOM(cell, value) {
    SpreadsheetDisplay.updateCellDisplay(cell, value);
  },

  commitCellValue(ctx) {
    const { activeCell } = ctx.selectionState;

    if (!activeCell) {
      return;
    }

    const { rowIndex, colIndex } = SpreadsheetUtils.parseCellCoordinates(activeCell);
    const value = this.readCellFromDOM(activeCell);

    this.setCellValue(ctx.sheetState, rowIndex, colIndex, value, ctx);

    if (!ctx.selectionState.isEditing) {
      this.writeCellToDOM(activeCell, value);
    }
  },

  saveCellValue(ctx) {
    this.commitCellValue(ctx);
  },

  commitActiveCell(ctx) {
    if (!ctx.selectionState.isEditing) {
      return;
    }

    this.commitCellValue(ctx);
  },
};
