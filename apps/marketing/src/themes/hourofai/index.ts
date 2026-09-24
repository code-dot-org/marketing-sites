'use client';
import {createTheme} from '@mui/material';

import {buildTypography} from '../common/typography/buildTypography';

import {HOUR_OF_AI_BRAND_COLORS} from './colors/brandColors';
import {COLORS} from './constants/colors';
import {STYLE_OVERRIDES} from './styleOverrides';
import {HOUR_OF_AI_TYPOGRAPHY_TOKENS} from './typography/typographyTokens';

/**
 * Hour of AI theme — scaffolding.
 *
 * Deliberately minimal: palette, typography, and radius/color component
 * overrides. Brand-specific token values belong in a
 * `:root[data-brand='HourOfAI']` block in the styles package rather than here,
 * so the shared component library re-skins with them.
 */
const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.brandPrimary,
      contrastText: COLORS.white,
    },
    secondary: {
      main: COLORS.brandSecondary,
      contrastText: COLORS.white,
    },
    tertiary: {
      main: COLORS.brandTertiary,
      contrastText: COLORS.black,
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
  typography: buildTypography(HOUR_OF_AI_TYPOGRAPHY_TOKENS),
  typographyTokens: HOUR_OF_AI_TYPOGRAPHY_TOKENS,
  mixins: {brandColors: HOUR_OF_AI_BRAND_COLORS},
});

export default theme;
