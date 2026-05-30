import { SpreadsheetDisplay } from './display.js';

export const SpreadsheetCaret = {
  setRangeInCell(cell, collapseToStart) {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(cell);
    range.collapse(collapseToStart);
    selection?.removeAllRanges();
    selection?.addRange(range);
  },

  placeAtEnd(cell) {
    this.setRangeInCell(cell, false);
  },

  placeAtStart(cell) {
    this.setRangeInCell(cell, true);
  },

  placeFromPoint(clientX, clientY, cell) {
    const range = this.getRangeFromPoint(clientX, clientY, cell);
    const selection = window.getSelection();

    if (range) {
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }

    this.placeAtEnd(cell);
  },

  getRangeFromPoint(clientX, clientY, cell) {
    let range = null;

    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(clientX, clientY);
    } else if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(clientX, clientY);

      if (position) {
        range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
      }
    }

    if (range && cell.contains(range.startContainer)) {
      return range;
    }

    return null;
  },

  hitTestInCell(clientX, clientY, cell) {
    const display = SpreadsheetDisplay.getDisplayElement(cell);

    if (!display?.textContent) {
      return false;
    }

    return this.getRangeFromPoint(clientX, clientY, cell) !== null;
  },

  insertText(element, text) {
    element.focus();

    if (typeof document.execCommand === 'function') {
      document.execCommand('insertText', false, text);
      return;
    }

    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
  },
};
