import {createFontStackWithFallbacks} from '@/themes/common/typography/fontStack';

import {GEIST_FONT, SPACE_GROTESK_FONT} from '../constants/fonts';

export const FALLBACK_FONTS = [
  'Noto Sans',
  'Noto Sans Math',
  'Noto Sans Arabic',
  'Noto Sans Armenian',
  'Noto Sans Bengali',
  'Noto Sans SC',
  'Noto Sans TC',
  'Noto Sans Devanagari',
  'Noto Sans Georgian',
  'Noto Sans Hebrew',
  'Noto Sans JP',
  'Noto Sans Kannada',
  'Noto Sans Khmer',
  'Noto Sans KR',
  'Noto Sans Myanmar',
  'Noto Sans Sinhala',
  'Noto Sans Tamil',
  'Noto Sans Telugu',
  'Noto Sans Thai',
  'Noto Sans Thaana',
] as const;

export const HOUR_OF_AI_TEXT_FONT_STACK = createFontStackWithFallbacks(
  GEIST_FONT,
  FALLBACK_FONTS,
);
export const HOUR_OF_AI_DISPLAY_FONT_STACK = createFontStackWithFallbacks(
  SPACE_GROTESK_FONT,
  FALLBACK_FONTS,
);
