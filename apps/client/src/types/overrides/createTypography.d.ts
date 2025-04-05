// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as createTypography from '@mui/material/styles/createTypography';

declare module '@mui/material/styles/createTypography' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface FontStyle
    extends Required<{
      textTransform: TextTransform;
      fontSize: string | number; // added string
    }> {}
  export interface FontStyleOptions extends Partial<FontStyle> {
    fontSize?: string | number; // added string
  }
  export type Variant =
    | 'customInput'
    | 'mainContent'
    | 'menuCaption'
    | 'subMenuCaption'
    | 'commonAvatar'
    | 'smallAvatar'
    | 'mediumAvatar'
    | 'largeAvatar'
    | 'tableHeader';

  export interface TypographyOptions extends Partial<Record<Variant, TypographyStyleOptions> & FontStyleOptions> {
    customInput?: TypographyStyleOptions;
    mainContent?: TypographyStyleOptions;
    menuCaption?: TypographyStyleOptions;
    subMenuCaption?: TypographyStyleOptions;
    commonAvatar?: TypographyStyleOptions;
    smallAvatar?: TypographyStyleOptions;
    mediumAvatar?: TypographyStyleOptions;
    largeAvatar?: TypographyStyleOptions;
    tableHeader?: TypographyStyleOptions;
  }

  export interface Typography extends Record<Variant, TypographyStyle>, FontStyle, TypographyUtils {
    customInput: TypographyStyle;
    mainContent: TypographyStyle;
    menuCaption: TypographyStyleOptions;
    subMenuCaption: TypographyStyleOptions;
    commonAvatar: TypographyStyle;
    smallAvatar: TypographyStyle;
    mediumAvatar: TypographyStyle;
    largeAvatar: TypographyStyle;
    tableHeader: TypographyStyle;
  }
}
