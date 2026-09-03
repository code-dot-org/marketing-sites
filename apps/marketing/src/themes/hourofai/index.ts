'use client';
import {createTheme} from '@mui/material';

import {createFontStack} from '../common/constants';

import {COLORS} from './constants/colors';
import {GEIST_FONT} from './constants/fonts';

/**
 * Hour of AI theme — scaffolding.
 *
 * Deliberately minimal: palette and typography only, no component
 * styleOverrides yet. Brand-specific token values belong in a
 * `:root[data-brand='HourOfAI']` block in the styles package rather than here,
 * so the shared component library re-skins with them.
 */
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.brandPrimary,
    },
    secondary: {
      main: COLORS.brandSecondary,
    },
    tertiary: {
      main: COLORS.brandTertiary,
    },
    text: {
      primary: COLORS.black,
    },
    divider: COLORS.black,
    common: {
      black: COLORS.black,
      white: COLORS.white,
    },
    background: {
      default: COLORS.backgroundPrimary,
    },
    grey: {
      200: COLORS.grey200,
    },
  },
  typography: {
    fontFamily: createFontStack(GEIST_FONT),
  },
});

export default theme;
