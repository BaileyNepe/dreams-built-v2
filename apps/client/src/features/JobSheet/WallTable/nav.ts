/**
 * Spreadsheet-style keyboard navigation over the wall table.
 *
 * Focusable controls carry data-nav="r{row}c{col}" (col 0 = measurement,
 * 1 = start corner, 2 = end corner). Tab / Shift+Tab move down/up the
 * measurement column, arrows move between neighbouring cells.
 */
export const navId = (row: number, col: number): string => `r${row}c${col}`;

export const focusNav = (row: number, col: number): boolean => {
  const el = document.querySelector<HTMLElement>(`[data-nav="${navId(row, col)}"]`);
  if (el) {
    el.focus();
    if (el instanceof HTMLInputElement) el.select();
  }
  return el !== null;
};
