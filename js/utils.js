import { SpreadsheetConfig } from './config.js';

const { GRID_SIZE, COLUMN_LABEL_BASE_CODE, CLASSES } = SpreadsheetConfig;

export const SpreadsheetUtils = {
  getColumnLabel(colIndex) {
    return String.fromCharCode(COLUMN_LABEL_BASE_CODE + colIndex);
  },

  formatCellAddress(rowIndex, colIndex) {
    return `${this.getColumnLabel(colIndex)}${rowIndex + 1}`;
  },

  getCellId(rowIndex, colIndex) {
    return `cell-r${rowIndex}-c${colIndex}`;
  },

  clampCoordinates(rowIndex, colIndex) {
    const lastIndex = GRID_SIZE - 1;

    return {
      rowIndex: Math.max(0, Math.min(lastIndex, rowIndex)),
      colIndex: Math.max(0, Math.min(lastIndex, colIndex)),
    };
  },

  parseCellCoordinates(cell) {
    return {
      rowIndex: Number(cell.dataset.row),
      colIndex: Number(cell.dataset.col),
    };
  },

  createElement(tag, className, attributes = {}) {
    const element = document.createElement(tag);
    element.className = className;

    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }

    return element;
  },

  getDataCellFromTarget(target) {
    if (!(target instanceof Element)) {
      return null;
    }

    const cell = target.closest(`.${CLASSES.CELL}`);

    return cell instanceof HTMLTableCellElement ? cell : null;
  },

  isImeKeydown(event) {
    return event.isComposing || event.keyCode === 229 || event.key === 'Process';
  },
};
