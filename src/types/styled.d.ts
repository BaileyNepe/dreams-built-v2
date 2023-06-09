// styled.d.ts
import 'styled-components';
import { theme } from '../components/theme';

type Theme = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
