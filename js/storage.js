import { SpreadsheetConfig } from './config.js';

const { GRID_SIZE, STORAGE_KEY, STORAGE_DEBOUNCE_MS } = SpreadsheetConfig;

function isValidSheetState(data) {
  if (!Array.isArray(data) || data.length !== GRID_SIZE) {
    return false;
  }

  return data.every(
    (row) =>
      Array.isArray(row) &&
      row.length === GRID_SIZE &&
      row.every((cell) => typeof cell === 'string')
  );
}

export const SpreadsheetStorage = {
  saveTimer: null,

  saveToLocalStorage(sheetState) {
    if (!isValidSheetState(sheetState)) {
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheetState));
      return true;
    } catch (error) {
      console.warn('[SpreadsheetStorage] saveToLocalStorage failed:', error);
      return false;
    }
  },

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      if (!isValidSheetState(parsed)) {
        console.warn('[SpreadsheetStorage] invalid stored sheetState, ignoring');
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('[SpreadsheetStorage] loadFromLocalStorage failed:', error);
      return null;
    }
  },

  scheduleSave(ctx) {
    if (!ctx?.sheetState) {
      return;
    }

    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveToLocalStorage(ctx.sheetState);
    }, STORAGE_DEBOUNCE_MS);
  },

  flushSave(ctx) {
    clearTimeout(this.saveTimer);
    this.saveTimer = null;

    if (ctx?.sheetState) {
      this.saveToLocalStorage(ctx.sheetState);
    }
  },
};
