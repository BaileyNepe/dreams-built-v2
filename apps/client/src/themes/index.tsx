import { useMemo, type ReactNode } from 'react';

// material-ui
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import {
  ThemeProvider,
  createTheme,
  type Theme,
  type ThemeOptions
} from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// project import

import Palette from './palette';
import Typography from './typography';

import componentStyleOverrides from './compStyleOverride';
import customShadows from './shadows';

// types
import { type TypographyOptions } from '@mui/material/styles/createTypography';

export default function ThemeCustomization({ children }: { children: ReactNode }) {
  const { borderRadius, fontFamily, navType, outlinedFilled, presetColor, buttonRadius } =
    {
      borderRadius: 8,
      fontFamily: 'Inter, sans-serif',
      outlinedFilled: false,
      presetColor: 'theme1',
      navType: 'light' as const,
      buttonRadius: 8
    };

  const theme: Theme = useMemo<Theme>(
    () => Palette(navType, presetColor),
    [navType, presetColor]
  );

  const themeTypography: TypographyOptions = useMemo<TypographyOptions>(
    () => Typography(theme, borderRadius, fontFamily),
    [theme, borderRadius, fontFamily]
  );
  const themeCustomShadows = useMemo(
    () => customShadows(navType, theme),
    [navType, theme]
  );

  const themeOptions: ThemeOptions = useMemo(
    () => ({
      palette: theme.palette,
      mixins: {
        toolbar: {
          minHeight: '48px',
          padding: '16px',
          '@media (min-width: 600px)': {
            minHeight: '48px'
          }
        }
      },
      shape: {
        ...theme.shape,
        borderRadius,
        buttonRadius
      },
      typography: themeTypography,
      customShadows: themeCustomShadows
    }),
    [
      borderRadius,
      buttonRadius,
      theme.palette,
      theme.shape,
      themeCustomShadows,
      themeTypography
    ]
  );

  const themes: Theme = createTheme(themeOptions);
  themes.components = useMemo(
    () =>
      componentStyleOverrides({
        theme: themes,
        borderRadius,
        outlinedFilled,
        buttonRadius
      }),
    [themes, borderRadius, outlinedFilled, buttonRadius]
  );

  return (
    <StyledEngineProvider>
      <ThemeProvider theme={themes}>
        <StyledThemeProvider theme={themes}>
          <CssBaseline />
          {<>{children}</>}
        </StyledThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
