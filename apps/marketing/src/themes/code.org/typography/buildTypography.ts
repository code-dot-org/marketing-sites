import {
  buildTypography as buildBrandTypography,
  type BuildTypographyOptions,
} from '@/themes/common/typography/buildTypography';

import {CODE_ORG_TYPOGRAPHY_TOKENS} from './typographyTokens';

export type {BuildTypographyOptions};

export const buildTypography = (opts: BuildTypographyOptions = {}) =>
  buildBrandTypography(CODE_ORG_TYPOGRAPHY_TOKENS, opts);
