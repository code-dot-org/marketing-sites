import {useTheme, type Theme} from '@mui/material/styles';

import type {EnclosingBackground} from '@/components/common/colors';
import {CODE_ORG_BRAND_COLORS} from '@/themes/code.org/colors/brandColors';

import type {BrandColorTokens} from './types';

/** The active theme's color tokens, falling back to Code.org's. */
export const getBrandColors = (theme: Theme): BrandColorTokens =>
  theme.mixins.brandColors ?? CODE_ORG_BRAND_COLORS;

export const useBrandColors = (): BrandColorTokens =>
  getBrandColors(useTheme());

/** CSS color for text of `value`, after the brand's contrast switch. */
export const resolvedTextCssVar = (
  colors: BrandColorTokens,
  value: string,
  background?: EnclosingBackground,
) => colors.cssVar(colors.resolveText(value, background));
