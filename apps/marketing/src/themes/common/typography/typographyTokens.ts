import {useTheme, type Theme} from '@mui/material/styles';

import {CODE_ORG_TYPOGRAPHY_TOKENS} from '@/themes/code.org/typography/typographyTokens';

import type {BrandTypographyTokens} from './types';

/** The active theme's typography tokens, falling back to Code.org's. */
export const getTypographyTokens = (theme: Theme): BrandTypographyTokens =>
  theme.typographyTokens ?? CODE_ORG_TYPOGRAPHY_TOKENS;

export const useTypographyTokens = (): BrandTypographyTokens =>
  getTypographyTokens(useTheme());
