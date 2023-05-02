const greys = {
  100: '#f7fafc',
  200: '#edf2f7',
  300: '#e2e8f0',
  400: '#cbd5e0',
  500: '#a0aec0',
  600: '#718096',
  700: '#4a5568',
  800: '#2d3748',
  900: '#1a202c',
  1000: '#111827',
};

const colors = {
  primary: '#0070f3',
  white: '#ffffff',
  greys,
  accent: {
    foreground: '#8c99e3',
    background: '#5562ae',
  },
};

const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '4rem',
};

export const theme = {
  colors,
  fontSizes,
};
