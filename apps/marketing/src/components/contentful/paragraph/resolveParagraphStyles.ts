// Paragraph style resolution chain (spec 009 US3).
//
// Two-step precedence:
//   1. Visual Appearance (existing `visualAppearance` field, enum widened
//      from 4 legacy `body-*` values to 12 — 4 legacy + 8 new `text-*`).
//      Each value maps to a Text-track role token via the variant-binding
//      table below.
//   2. Individual override fields (`isStrong`, `isItalic`) — applied on top.
//      `colorOverride`, `textTransform`, and user `sx` are layered later in
//      Paragraph.tsx (this resolver doesn't own them).
//
// Variant binding rule:
//   - Legacy `body-*` values + the 4 new `text-*` cells that equal a body{N}
//     canonical role (text-lg ↔ body1, text-md ↔ body2, text-sm ↔ body3,
//     text-xs ↔ body4) → use the matching body{N} MUI variant, no inline sx.
//   - The 4 larger new cells (`text-xl`, `text-2xl`, `text-3xl`, `text-4xl`)
//     have no canonical body variant. Use the `body1` variant for the Text
//     font-family and emit the cell's size + line-height + letter-spacing
//     inline.

import {
  ROLE_TOKENS,
  SCALE_TEXT,
  WEIGHTS,
  type SizeToken,
  type TextAppearanceValue,
} from '@/themes/code.org/typography/tokens';

export type LegacyParagraphAppearance =
  | 'body-one'
  | 'body-two'
  | 'body-three'
  | 'body-four';

export type ParagraphVisualAppearanceValue =
  | LegacyParagraphAppearance
  | TextAppearanceValue;

export type ParagraphVariantTag = 'body1' | 'body2' | 'body3' | 'body4';

interface ResolveParagraphArgs {
  visualAppearance: ParagraphVisualAppearanceValue;
  isStrong?: boolean;
  isItalic?: boolean;
}

interface ResolveParagraphResult {
  variantTag: ParagraphVariantTag;
  sx: Record<string, unknown>;
}

const LEGACY_TO_VARIANT: Record<
  LegacyParagraphAppearance,
  ParagraphVariantTag
> = {
  'body-one': 'body1',
  'body-two': 'body2',
  'body-three': 'body3',
  'body-four': 'body4',
};

const TEXT_APPEARANCE_TO_VARIANT: Record<
  TextAppearanceValue,
  ParagraphVariantTag
> = {
  'text-lg': 'body1', // canonical match — body1 = Text lg Medium
  'text-md': 'body2', // canonical match — body2 = Text md Medium (locked default)
  'text-sm': 'body3', // canonical match — body3 = Text sm Regular
  'text-xs': 'body4', // canonical match — body4 = Text xs Regular
  // No canonical match — use body1 for the Text font-family + inline sx.
  'text-4xl': 'body1',
  'text-3xl': 'body1',
  'text-2xl': 'body1',
  'text-xl': 'body1',
};

const TEXT_APPEARANCE_TO_CELL: Record<TextAppearanceValue, SizeToken> = {
  'text-xs': 'xs',
  'text-sm': 'sm',
  'text-md': 'md',
  'text-lg': 'lg',
  'text-xl': 'xl',
  'text-2xl': '2xl',
  'text-3xl': '3xl',
  'text-4xl': '4xl',
};

const isLegacy = (
  v: ParagraphVisualAppearanceValue,
): v is LegacyParagraphAppearance => v.startsWith('body-');

// True when the text-* appearance value resolves to the same size as its
// mapped variant's canonical role token. When true, no inline sx is needed.
const textAppearanceMatchesVariant = (
  appearance: TextAppearanceValue,
): boolean => {
  const variant = TEXT_APPEARANCE_TO_VARIANT[appearance];
  return ROLE_TOKENS[variant].size === TEXT_APPEARANCE_TO_CELL[appearance];
};

export const resolveParagraphStyles = (
  args: ResolveParagraphArgs,
): ResolveParagraphResult => {
  const {visualAppearance, isStrong = false, isItalic = false} = args;
  const sx: Record<string, unknown> = {};

  let variantTag: ParagraphVariantTag;

  if (isLegacy(visualAppearance)) {
    variantTag = LEGACY_TO_VARIANT[visualAppearance];
  } else {
    variantTag = TEXT_APPEARANCE_TO_VARIANT[visualAppearance];
    if (!textAppearanceMatchesVariant(visualAppearance)) {
      // The cell doesn't equal the variant's canonical defaults — emit the
      // cell's size / line-height / letter-spacing inline so it overrides
      // the variant. (Reached by text-xl, text-2xl, text-3xl, text-4xl.)
      const cell = SCALE_TEXT[TEXT_APPEARANCE_TO_CELL[visualAppearance]];
      sx.fontSize = cell.fontSize;
      sx.lineHeight = cell.lineHeight;
      if (cell.letterSpacing) {
        sx.letterSpacing = cell.letterSpacing;
      }
      // The new larger cells default to Medium (per
      // PARAGRAPH_APPEARANCE_ROLES). body1 variant also = Medium (500), so
      // no inline weight override is needed.
    }
  }

  if (isStrong) {
    sx.fontWeight = WEIGHTS.semibold;
  }
  if (isItalic) {
    sx.fontStyle = 'italic';
  }

  return {variantTag, sx};
};
