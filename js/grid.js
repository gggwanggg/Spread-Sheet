import { SpreadsheetConfig } from './config.js';
import { SpreadsheetUtils } from './utils.js';
import { SpreadsheetDisplay } from './display.js';

const { GRID_SIZE, ROW_HEADER_CELL_OFFSET, CLASSES, ARIA, TAB_INDEX } = SpreadsheetConfig;

export const SpreadsheetGrid = {
  getDataCellElement(ctx, rowIndex, colIndex) {
    const tableRow = ctx.dom.tbody?.rows[rowIndex];

    return tableRow?.cells[colIndex + ROW_HEADER_CELL_OFFSET] ?? null;
  },

  getDisplayElement(cell) {
    return SpreadsheetDisplay.getDisplayElement(cell);
  },

  createCornerHeader() {
    return SpreadsheetUtils.createElement('th', CLASSES.CORNER, {
      scope: 'col',
      'aria-hidden': 'true',
    });
  },

  createColumnHeader(colIndex) {
    const header = SpreadsheetUtils.createElement('th', CLASSES.COLUMN_HEADER, {
      scope: 'col',
      'data-col': String(colIndex),
    });

    header.textContent = SpreadsheetUtils.getColumnLabel(colIndex);
    return header;
  },

  createRowHeader(rowIndex) {
    const header = SpreadsheetUtils.createElement('th', CLASSES.ROW_HEADER, {
      scope: 'row',
      'data-row': String(rowIndex),
    });

    header.textContent = String(rowIndex + 1);
    return header;
  },

  createDataCell(ctx, rowIndex, colIndex) {
    const address = SpreadsheetUtils.formatCellAddress(rowIndex, colIndex);
    const cell = SpreadsheetUtils.createElement('td', CLASSES.CELL, {
      id: SpreadsheetUtils.getCellId(rowIndex, colIndex),
      'data-row': String(rowIndex),
      'data-col': String(colIndex),
      contenteditable: 'false',
      role: 'gridcell',
      tabindex: TAB_INDEX.INACTIVE,
      'aria-selected': ARIA.SELECTED_FALSE,
    });

    const display = SpreadsheetUtils.createElement('span', CLASSES.CELL_DISPLAY, {
      contenteditable: 'false',
    });

    display.textContent = ctx.sheetState[rowIndex][colIndex];
    cell.setAttribute('aria-label', address);
    cell.appendChild(display);
    return cell;
  },

  buildColumnHeaderRow(ctx) {
    const row = document.createElement('tr');
    row.appendChild(this.createCornerHeader());

    for (let colIndex = 0; colIndex < GRID_SIZE; colIndex += 1) {
      const columnHeader = this.createColumnHeader(colIndex);
      ctx.headers.columns[colIndex] = columnHeader;
      row.appendChild(columnHeader);
    }

    return row;
  },

  buildDataRow(ctx, rowIndex) {
    const row = document.createElement('tr');
    const rowHeader = this.createRowHeader(rowIndex);

    ctx.headers.rows[rowIndex] = rowHeader;
    row.appendChild(rowHeader);

    for (let colIndex = 0; colIndex < GRID_SIZE; colIndex += 1) {
      row.appendChild(this.createDataCell(ctx, rowIndex, colIndex));
    }

    return row;
  },

  resetSelectionRefs(ctx) {
    ctx.selectionState.activeCell = null;
    ctx.selectionState.activeRow = null;
    ctx.selectionState.activeCol = null;
    ctx.selectionState.isEditing = false;
    ctx.editSnapshot = null;
    ctx.lastOverflowCell = null;
    ctx.dom.grid.removeAttribute('aria-activedescendant');
  },

  render(ctx) {
    const { grid } = ctx.dom;
    const thead = grid.tHead;
    const tbody = grid.tBodies[0];

    if (!thead || !tbody) {
      return;
    }

    ctx.headers.columns = [];
    ctx.headers.rows = [];
    this.resetSelectionRefs(ctx);

    thead.replaceChildren(this.buildColumnHeaderRow(ctx));

    const fragment = document.createDocumentFragment();

    for (let rowIndex = 0; rowIndex < GRID_SIZE; rowIndex += 1) {
      fragment.appendChild(this.buildDataRow(ctx, rowIndex));
    }

    tbody.replaceChildren(fragment);
    ctx.dom.tbody = tbody;
  },
};
