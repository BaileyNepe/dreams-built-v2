// material-ui
import { type PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// assets
import { primary } from 'themes/variants/primary';

// ==============================|| DEFAULT THEME - PALETTE  ||============================== //

const Palette = (navType: PaletteMode, presetColor: string) => {
  let colors;
  switch (presetColor) {
    case 'theme1':
      colors = primary;
      break;
    case 'default':
    default:
      colors = primary;
  }

  return createTheme({
    palette: {
      mode: navType,
      common: colors.common,
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.tertiary,
      forth: colors.forth,
      error: colors.error,
      warning: colors.warning,
      success: colors.success,
      grey: colors.grey,
      dark: colors.dark,
      text: {
        primary: colors.grey[700],
        secondary: colors.grey[500],
        dark: colors.grey[900],
        hint: colors.grey[100]
      },
      divider: colors.grey[300],
      background: colors.background
    }
  });
};

export default Palette;
