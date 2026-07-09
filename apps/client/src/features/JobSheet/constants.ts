/** Section colours lifted from the paper job sheet (magenta 300s, green rebate). */
export const SECTION_COLORS = {
  shutters: {
    header: '#ee2cf0',
    highlight: '#fbd5fc'
  },
  rebate: {
    header: '#6ede54',
    highlight: '#dcf7d4'
  }
} as const;

export type SheetSection = keyof typeof SECTION_COLORS;
