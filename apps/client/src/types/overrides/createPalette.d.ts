/* eslint-disable @typescript-eslint/no-unused-vars */
import * as createPalette from '@mui/material/styles/createPalette';

declare module '@mui/material/styles/createPalette' {
  interface PaletteColor {
    lightest: string;
    darkest: string;
  }

  export interface TypeText {
    dark: string;
    hint: string;
  }

  interface PaletteOptions {
    tertiary: PaletteColorOptions;
    forth: PaletteColorOptions;
    dark: PaletteColorOptions;
  }
  interface Palette {
    icon: IconPaletteColor;
    tertiary: PaletteColor;
    forth: PaletteColor;
    dark: PaletteColor;
  }
}
