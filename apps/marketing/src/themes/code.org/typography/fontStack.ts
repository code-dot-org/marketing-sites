// Code.org font-family cascade. Mirrors `$noto-sans-fonts` in
// packages/component-library-styles/font.scss:12-17 to TS, so the MUI
// font-family string contains the same i18n Noto Sans coverage that the
// SCSS layer exposes. The chain was historically present in
// themes/code.org/index.ts at commit 984a9f05 (2025-06-27) and was
// removed during the CSforAll refactor + Geist swap.
//
// This helper is NOT used by csforall — csforall continues to consume the
// bare `createFontStack` from `themes/common/constants.tsx`.

import {GEIST_FONT, SPACE_GROTESK_FONT} from '../constants/fonts';

export const NOTO_SANS_CHAIN = [
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

export const createCodeOrgFontStack = (primary: string): string =>
  [primary, ...NOTO_SANS_CHAIN, 'sans-serif'].join(', ');

export const CODE_ORG_TEXT_FONT_STACK = createCodeOrgFontStack(GEIST_FONT);
export const CODE_ORG_DISPLAY_FONT_STACK =
  createCodeOrgFontStack(SPACE_GROTESK_FONT);
