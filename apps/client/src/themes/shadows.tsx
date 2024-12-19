import { alpha, type Theme } from '@mui/material/styles';

const createCustomShadow = (theme: Theme, color: string) => {
  const transparent = alpha(color, 0.24);
  return {
    z1: `0 1px 2px 0 ${transparent}`,
    z8: `0 8px 16px 0 ${transparent}`,
    z12: `0 12px 24px 0 ${transparent} 0 10px 20px 0 ${transparent}`,
    z16: `0 0 3px 0 ${transparent} 0 14px 28px -5px ${transparent}`,
    z20: `0 0 3px 0 ${transparent} 0 18px 36px -5px ${transparent}`,
    z24: `0 0 6px 0 ${transparent} 0 21px 44px 0 ${transparent}`,

    outline:
      'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;',

    thickOutline: 'rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px;',

    insetEnd: '0 -10px 20px -10px rgba(0, 0, 0, 0.1);',
    insetStart: '0 10px 20px -10px rgba(0, 0, 0, 0.1);',

    light: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;',
    medium: 'rgba(0, 0, 0, 0.24) 0px 3px 8px;',
    heavy: 'rgba(0, 0, 0, 0.35) 0px 5px 15px;',

    primary: `0px 12px 14px 0px ${alpha(theme.palette.primary.main, 0.3)}`,
    secondary: `0px 12px 14px 0px ${alpha(theme.palette.secondary.main, 0.3)}`,
    success: `0px 12px 14px 0px ${alpha(theme.palette.success.main, 0.3)}`,
    warning: `0px 12px 14px 0px ${alpha(theme.palette.warning.main, 0.3)}`,
    error: `0px 12px 14px 0px ${alpha(theme.palette.error.main, 0.3)}`
  };
};

export default function customShadows(navType: string, theme: Theme) {
  return createCustomShadow(theme, theme.palette.grey[600]);
}
