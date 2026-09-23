import type {BrandTypographyTokens} from '@/themes/common/typography/types';

import {
  CODE_ORG_DISPLAY_FONT_STACK,
  CODE_ORG_TEXT_FONT_STACK,
} from './fontStack';
import {
  DISPLAY_APPEARANCE_ROLES,
  PARAGRAPH_APPEARANCE_ROLES,
  ROLE_TOKENS,
  SCALE_DISPLAY,
  SCALE_TEXT,
  WEIGHTS,
} from './tokens';

// Also the fallback for themes without their own `typographyTokens`.
export const CODE_ORG_TYPOGRAPHY_TOKENS: BrandTypographyTokens = {
  fontStacks: {
    text: CODE_ORG_TEXT_FONT_STACK,
    display: CODE_ORG_DISPLAY_FONT_STACK,
  },
  weights: WEIGHTS,
  scales: {
    text: SCALE_TEXT,
    display: SCALE_DISPLAY,
  },
  roles: ROLE_TOKENS,
  displayAppearanceRoles: DISPLAY_APPEARANCE_ROLES,
  paragraphAppearanceRoles: PARAGRAPH_APPEARANCE_ROLES,
};
