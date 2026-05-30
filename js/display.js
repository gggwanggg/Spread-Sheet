import { SpreadsheetConfig } from './config.js';

const { CLASSES } = SpreadsheetConfig;

export const SpreadsheetDisplay = {
  getDisplayElement(cell) {
    return cell.querySelector(`.${CLASSES.CELL_DISPLAY}`);
  },

  getEditTarget(cell) {
    return this.getDisplayElement(cell) ?? cell;
  },

  updateCellDisplay(cell, value) {
    const display = this.getDisplayElement(cell);

    if (display) {
      display.textContent = value;
      return;
    }

    if (!cell.isContentEditable) {
      cell.textContent = value;
    }
  },

  collapseCell(cell) {
    if (!cell) {
      return;
    }

    const display = this.getDisplayElement(cell);

    cell.classList.remove(CLASSES.CELL_EXPANDED);
    display?.classList.remove(CLASSES.CELL_DISPLAY_EXPANDED);

    if (display) {
      display.setAttribute('contenteditable', 'false');
    }
  },

  expandCell(cell, { editing = false } = {}) {
    if (!cell) {
      return;
    }

    const display = this.getDisplayElement(cell);

    cell.classList.add(CLASSES.CELL_EXPANDED);
    display?.classList.add(CLASSES.CELL_DISPLAY_EXPANDED);

    if (editing && display) {
      display.setAttribute('contenteditable', 'true');
    }
  },

  syncOverflowState(ctx) {
    const { activeCell, isEditing } = ctx.selectionState;

    if (ctx.lastOverflowCell && ctx.lastOverflowCell !== activeCell) {
      this.collapseCell(ctx.lastOverflowCell);
    }

    ctx.lastOverflowCell = activeCell ?? null;

    if (!activeCell) {
      return;
    }

    this.expandCell(activeCell, { editing: isEditing });
  },
};
