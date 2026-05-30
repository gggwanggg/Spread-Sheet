import { SpreadsheetConfig } from './config.js';

const {
  CSV_FILENAME,
  UTF8_BOM,
  CSV_MIME_TYPE,
  CSV_ROW_DELIMITER,
  CSV_FIELD_DELIMITER,
  CSV_QUOTE_ESCAPE_PATTERN,
} = SpreadsheetConfig;

export const SpreadsheetCsv = {
  escapeCSVValue(value) {
    const text = String(value ?? '');

    if (CSV_QUOTE_ESCAPE_PATTERN.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  },

  convertToCSV(sheetState) {
    return sheetState
      .map((row) => row.map((cell) => this.escapeCSVValue(cell)).join(CSV_FIELD_DELIMITER))
      .join(CSV_ROW_DELIMITER);
  },

  downloadCSV(sheetState, onBeforeExport) {
    onBeforeExport();

    const csvContent = this.convertToCSV(sheetState);
    const blob = new Blob([UTF8_BOM + csvContent], { type: CSV_MIME_TYPE });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = CSV_FILENAME;
    link.rel = 'noopener';
    link.hidden = true;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);
  },
};
