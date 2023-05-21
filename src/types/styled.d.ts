// styled.d.ts
import 'styled-components';
import { type theme } from '../components/theme';

type Theme = typeof theme;

declare module 'styled-components' {
  export type DefaultTheme = Theme;
}
