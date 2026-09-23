import type {BrandTypographyTokens} from '@/themes/common/typography/types';

import {
  HOUR_OF_AI_DISPLAY_FONT_STACK,
  HOUR_OF_AI_TEXT_FONT_STACK,
} from './fontStack';
import {
  DISPLAY_APPEARANCE_ROLES,
  PARAGRAPH_APPEARANCE_ROLES,
  ROLE_TOKENS,
  SCALE_DISPLAY,
  SCALE_TEXT,
  WEIGHTS,
} from './tokens';

export const HOUR_OF_AI_TYPOGRAPHY_TOKENS: BrandTypographyTokens = {
  fontStacks: {
    text: HOUR_OF_AI_TEXT_FONT_STACK,
    display: HOUR_OF_AI_DISPLAY_FONT_STACK,
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
