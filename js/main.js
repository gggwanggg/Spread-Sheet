import { SpreadsheetConfig } from './config.js';
import { SpreadsheetState } from './state.js';
import { SpreadsheetGrid } from './grid.js';
import { SpreadsheetSelection } from './selection.js';
import { SpreadsheetEvents } from './events.js';
import { SpreadsheetStorage } from './storage.js';
import { SpreadsheetCellInput } from './cellInput.js';

const { SELECTORS, ARIA } = SpreadsheetConfig;

function createAppContext() {
  return {
    sheetState: null,
    editSnapshot: null,
    dom: {
      grid: null,
      tbody: null,
      nameBox: null,
      formulaInput: null,
      exportButton: null,
      cellInput: null,
    },
    headers: {
      columns: [],
      rows: [],
    },
    selectionState: {
      activeCell: null,
      activeRow: null,
      activeCol: null,
      isEditing: false,
    },
    inputState: {
      isComposing: false,
      isDirectEdit: false,
    },
    formulaBarSnapshot: null,
    isFormulaBarFocused: false,
    suppressFormulaSync: false,
    suppressEditBlur: false,
    lastOverflowCell: null,
  };
}

function cacheDomReferences(ctx) {
  ctx.dom.grid = document.querySelector(SELECTORS.GRID);
  ctx.dom.nameBox = document.querySelector(SELECTORS.NAME_BOX);
  ctx.dom.formulaInput = document.querySelector(SELECTORS.FORMULA_INPUT);
  ctx.dom.exportButton = document.querySelector(SELECTORS.EXPORT_BUTTON);
  ctx.dom.cellInput = document.querySelector(SELECTORS.CELL_INPUT);
}

function configureGrid(ctx) {
  const { grid } = ctx.dom;

  grid.setAttribute('role', 'grid');
  grid.setAttribute('aria-label', ARIA.GRID_LABEL);
  grid.tabIndex = 0;
}

function bootstrap() {
  const ctx = createAppContext();

  cacheDomReferences(ctx);

  if (!ctx.dom.grid || !ctx.dom.nameBox || !ctx.dom.formulaInput || !ctx.dom.cellInput) {
    return;
  }

  configureGrid(ctx);

  ctx.sheetState = SpreadsheetStorage.loadFromLocalStorage() ?? SpreadsheetState.createEmptyGrid();
  SpreadsheetGrid.render(ctx);
  SpreadsheetEvents.bindGridEvents(ctx);
  SpreadsheetEvents.bindFormulaBarEvents(ctx);
  SpreadsheetEvents.bindExportEvent(ctx);
  SpreadsheetCellInput.bindEvents(ctx);
  SpreadsheetSelection.selectCell(ctx, 0, 0);

  window.addEventListener('beforeunload', () => {
    SpreadsheetStorage.flushSave(ctx);
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
