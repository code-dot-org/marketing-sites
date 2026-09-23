import {
  ComponentsOverrides,
  ComponentsVariants,
  Theme as MuiTheme,
} from '@mui/material/styles';

import {ImageProps} from '@/components/contentful/image';
import type {BrandColorTokens} from '@/themes/common/colors/types';
import type {BrandTypographyTokens} from '@/themes/common/typography/types';

type Theme = Omit<MuiTheme, 'components'>;

declare module '@mui/material/styles' {
  // Key must start with "typography" or cssVariables mode emits a var per token.
  interface Theme {
    typographyTokens?: BrandTypographyTokens;
  }

  interface ThemeOptions {
    typographyTokens?: BrandTypographyTokens;
  }

  // Under mixins because cssVariables mode skips it (a top-level key would
  // emit a CSS var per token).
  interface Mixins {
    brandColors?: BrandColorTokens;
  }

  // Custom Palette definitions
  interface Palette {
    tertiary: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }

  // Custom Typography definitions
  interface TypographyVariants {
    body3: React.CSSProperties;
    body4: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    body4?: React.CSSProperties;
  }

  // Custom components definitions
  interface ComponentNameToClassKey {
    MuiImage: 'root' | 'imageElement';
    MuiFooter: 'root' | 'grid' | 'links' | 'link' | 'imageLink' | 'copyright';
    MuiVideo:
      | 'root'
      | 'wrapper'
      | 'facade'
      | 'posterImage'
      | 'errorPlaceholder'
      | 'footer';
  }

  interface ComponentsPropsList {
    MuiImage: Partial<ImageProps>;
    MuiFooter: Partial<FooterProps>;
  }

  interface Components {
    MuiImage?: {
      defaultProps?: ComponentsPropsList['MuiImage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiImage'];
      variants?: ComponentsVariants['MuiImage'];
    };
    MuiFooter?: {
      defaultProps?: ComponentsPropsList['MuiFooter'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFooter'];
      variants?: ComponentsVariants['MuiFooter'];
    };
    MuiVideo?: {
      defaultProps?: ComponentsPropsList['MuiVideo'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiVideo'];
      variants?: ComponentsVariants['MuiVideo'];
    };
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
    body4: true;
  }
}

export {};
