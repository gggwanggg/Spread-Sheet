import { SpreadsheetConfig } from './config.js';
import { SpreadsheetUtils } from './utils.js';
import { SpreadsheetSelection } from './selection.js';
import { SpreadsheetIME } from './ime.js';

const { GRID_SIZE } = SpreadsheetConfig;

const NAVIGATION_KEYS = new Set([
  'Tab',
  'Enter',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

const ARROW_KEY_DIRECTION = Object.freeze({
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
});

export const SpreadsheetNavigation = {
  moveSelection(ctx, rowIndex, colIndex) {
    const { rowIndex: nextRow, colIndex: nextCol } = SpreadsheetUtils.clampCoordinates(rowIndex, colIndex);

    SpreadsheetSelection.selectCell(ctx, nextRow, nextCol);
  },

  moveTo(ctx, rowIndex, colIndex) {
    this.moveSelection(ctx, rowIndex, colIndex);
  },

  tabForward(ctx) {
    const { activeRow, activeCol } = ctx.selectionState;

    if (activeRow === null || activeCol === null) {
      return;
    }

    if (activeCol < GRID_SIZE - 1) {
      this.moveSelection(ctx, activeRow, activeCol + 1);
      return;
    }

    if (activeRow < GRID_SIZE - 1) {
      this.moveSelection(ctx, activeRow + 1, 0);
    }
  },

  tabBackward(ctx) {
    const { activeRow, activeCol } = ctx.selectionState;

    if (activeRow === null || activeCol === null) {
      return;
    }

    if (activeCol > 0) {
      this.moveSelection(ctx, activeRow, activeCol - 1);
      return;
    }

    if (activeRow > 0) {
      this.moveSelection(ctx, activeRow - 1, GRID_SIZE - 1);
    }
  },

  enterDown(ctx) {
    const { activeRow, activeCol } = ctx.selectionState;

    if (activeRow === null || activeCol === null) {
      return;
    }

    this.moveSelection(ctx, activeRow + 1, activeCol);
  },

  arrow(ctx, direction) {
    const { activeRow, activeCol } = ctx.selectionState;

    if (activeRow === null || activeCol === null) {
      return;
    }

    const delta = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1],
    }[direction];

    this.moveSelection(ctx, activeRow + delta[0], activeCol + delta[1]);
  },

  handleArrowNavigation(ctx, event) {
    const direction = ARROW_KEY_DIRECTION[event.key];

    if (!direction) {
      return;
    }

    event.preventDefault();

    const { activeRow, activeCol } = ctx.selectionState;

    if (activeRow === null || activeCol === null) {
      return;
    }

    if (ctx.selectionState.isEditing) {
      ctx.suppressEditBlur = true;
      SpreadsheetSelection.exitEditMode(ctx, { save: true });
      ctx.suppressEditBlur = false;
    }

    this.arrow(ctx, direction);
  },

  handleSelectionKeydown(ctx, event) {
    if (SpreadsheetIME.isActive(ctx, event)) {
      return;
    }

    if (ARROW_KEY_DIRECTION[event.key]) {
      this.handleArrowNavigation(ctx, event);
      return;
    }

    const keyActions = {
      Tab: () => {
        event.preventDefault();
        if (event.shiftKey) {
          this.tabBackward(ctx);
        } else {
          this.tabForward(ctx);
        }
      },
      Enter: () => {
        event.preventDefault();
        this.enterDown(ctx);
      },
    };

    keyActions[event.key]?.();
  },

  handleEditKeydown(ctx, event) {
    if (SpreadsheetIME.isActive(ctx, event) && event.key !== 'Escape') {
      return;
    }

    if (ARROW_KEY_DIRECTION[event.key]) {
      this.handleArrowNavigation(ctx, event);
      return;
    }

    const keyActions = {
      Tab: () => {
        event.preventDefault();
        ctx.suppressEditBlur = true;
        SpreadsheetSelection.exitEditMode(ctx, { save: true });
        ctx.suppressEditBlur = false;
        if (event.shiftKey) {
          this.tabBackward(ctx);
        } else {
          this.tabForward(ctx);
        }
      },
      Enter: () => {
        event.preventDefault();
        ctx.suppressEditBlur = true;
        SpreadsheetSelection.exitEditMode(ctx, { save: true });
        ctx.suppressEditBlur = false;
        this.enterDown(ctx);
      },
      Escape: () => {
        event.preventDefault();
        ctx.suppressEditBlur = true;
        SpreadsheetSelection.exitEditMode(ctx, { save: false });
        ctx.suppressEditBlur = false;
        ctx.dom.cellInput?.focus({ preventScroll: true });
      },
    };

    if (keyActions[event.key]) {
      keyActions[event.key]();
    }
  },

  handleCellKeydown(ctx, event) {
    if (SpreadsheetIME.isActive(ctx, event)) {
      return;
    }

    if (ctx.inputState.isDirectEdit) {
      if (ctx.selectionState.isEditing) {
        if (NAVIGATION_KEYS.has(event.key) || event.key === 'Escape') {
          this.handleEditKeydown(ctx, event);
        }
      }
      return;
    }

    if (ctx.selectionState.isEditing) {
      if (NAVIGATION_KEYS.has(event.key) || event.key === 'Escape') {
        this.handleEditKeydown(ctx, event);
      }
      return;
    }

    if (NAVIGATION_KEYS.has(event.key)) {
      this.handleSelectionKeydown(ctx, event);
      return;
    }

    SpreadsheetSelection.handleCellKeydown(ctx, event);
  },

  handleCellInputKeydown(ctx, event) {
    if (SpreadsheetIME.isActive(ctx, event)) {
      return;
    }

    if (event.key === 'F2') {
      event.preventDefault();
      SpreadsheetSelection.enterEditMode(ctx, { preserveContent: true });
      return;
    }

    if (NAVIGATION_KEYS.has(event.key) || event.key === 'Escape') {
      if (ctx.selectionState.isEditing) {
        this.handleEditKeydown(ctx, event);
      } else {
        this.handleSelectionKeydown(ctx, event);
      }
    }
  },
};
