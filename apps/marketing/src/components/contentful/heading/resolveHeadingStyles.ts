// Heading style resolution chain (spec 009 US3 + amendment-4).
//
// Three-step precedence:
//   1. Heading Level (existing `visualAppearance` field) — drives the
//      semantic tag AND the variant tag, so MUI's theme.typography.h{N}
//      carries the level's canonical font-family + weight + per-breakpoint
//      step table.
//   2. Visual Appearance (`appearance` field) — SIZE-ONLY override when
//      non-`default`. Emits the chosen Display cell's size + line-height
//      + letter-spacing inline, AND emits matching values at the cell's
//      step breakpoints (so the variant's responsive ladder doesn't
//      reclaim smaller widths). Weight + font-family stay from step 1.
//   3. Individual override fields (fontSize / fontWeight / lineHeight /
//      fontKerning / textTransform) — top precedence; each set field
//      overrides only its own dimension.

import {createTheme} from '@mui/material/styles';

import {
  DISPLAY_APPEARANCE_ROLES,
  SCALE_DISPLAY,
  type Breakpoint,
  type DisplayAppearanceValue,
} from '@/themes/code.org/typography/tokens';

export type HeadingLevelValue =
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs';

export type HeadingAppearanceValue = 'default' | DisplayAppearanceValue;

export type HeadingSemanticTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface ResolveHeadingArgs {
  visualAppearance: HeadingLevelValue;
  appearance?: HeadingAppearanceValue;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: 'default' | '400' | '500' | '600' | '700';
  fontKerning?: 'auto' | 'normal' | 'none';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

interface ResolveHeadingResult {
  semanticTag: HeadingSemanticTag;
  variantTag: HeadingSemanticTag;
  sx: Record<string, unknown>;
}

const LEVEL_TO_TAG: Record<HeadingLevelValue, HeadingSemanticTag> = {
  'heading-xxl': 'h1',
  'heading-xl': 'h2',
  'heading-lg': 'h3',
  'heading-md': 'h4',
  'heading-sm': 'h5',
  'heading-xs': 'h6',
};

// MUI's default breakpoints are read off a transient theme instance (no
// breakpoint override is configured anywhere in this repo). The shared
// instance lets us emit deterministic media-query keys for the
// appearance-cell responsive locks below.
const SHARED_BREAKPOINTS = createTheme().breakpoints;

// Same viewport-name-to-query-bp mapping as buildTypography uses for
// emitting the variant's step table. Keys are the step's viewport name;
// values are the breakpoint to call breakpoints.down() with.
const VIEWPORT_QUERY_BP: Partial<Record<Breakpoint, Breakpoint>> = {
  sm: 'md',
  xs: 'sm',
};

const cellEntries = (cell: {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
}) => ({
  fontSize: cell.fontSize,
  lineHeight: cell.lineHeight,
  ...(cell.letterSpacing ? {letterSpacing: cell.letterSpacing} : {}),
});

export const resolveHeadingStyles = (
  args: ResolveHeadingArgs,
): ResolveHeadingResult => {
  const {
    visualAppearance,
    appearance = 'default',
    fontSize,
    lineHeight,
    fontWeight,
    fontKerning,
    textTransform,
  } = args;

  const semanticTag = LEVEL_TO_TAG[visualAppearance];
  const sx: Record<string, unknown> = {};

  // Step 1 — variantTag always equals the semantic tag. This preserves the
  // Heading Level's canonical font-family + weight + per-breakpoint table
  // when no appearance override is set.
  const variantTag: HeadingSemanticTag = semanticTag;

  // Step 2 — Visual Appearance is a SIZE-ONLY override (amendment-4). When
  // a Display cell is chosen we emit the cell's size + line-height +
  // letter-spacing inline AND lock the same values at the cell's step
  // breakpoints so the variant's responsive ladder can't reclaim smaller
  // sizes at narrower widths. Weight + family stay from the level's
  // variant — no `sx.fontWeight` is emitted by this step.
  if (appearance !== 'default') {
    const cellRole = DISPLAY_APPEARANCE_ROLES[appearance];
    const defaultCell = SCALE_DISPLAY[cellRole.size];
    Object.assign(sx, cellEntries(defaultCell));

    // Lock the cell's responsive step values at the same media-query keys
    // the variant would have used, so the larger cell doesn't downshift to
    // the variant's step at narrower viewports.
    if (cellRole.steps) {
      for (const viewport of ['sm', 'xs'] as const) {
        const stepSize = cellRole.steps[viewport];
        if (!stepSize) continue;
        const queryBp = VIEWPORT_QUERY_BP[viewport];
        if (!queryBp) continue;
        const stepCell = SCALE_DISPLAY[stepSize];
        const mq = SHARED_BREAKPOINTS.down(queryBp);
        sx[mq] = cellEntries(stepCell);
      }
    } else {
      // The cell has no step table (display-xs) — still need to override
      // the variant's step queries so they don't downshift below the
      // cell's fixed size.
      for (const viewport of ['sm', 'xs'] as const) {
        const queryBp = VIEWPORT_QUERY_BP[viewport];
        if (!queryBp) continue;
        const mq = SHARED_BREAKPOINTS.down(queryBp);
        sx[mq] = cellEntries(defaultCell);
      }
    }
  }

  // Step 3 — individual override fields. Each set field overrides ONLY
  // its own dimension on top of the cell from step 2 (or the variant's
  // defaults if step 2 was 'default').
  if (fontSize !== undefined) {
    sx.fontSize = `${fontSize}rem`;
  }
  if (lineHeight !== undefined) {
    sx.lineHeight = lineHeight;
  }
  // `'default'` sentinel means "inherit the level's canonical weight" —
  // skip emitting any inline weight so the variant flows through.
  if (fontWeight && fontWeight !== 'default') {
    sx.fontWeight = Number(fontWeight);
  }
  if (fontKerning) {
    sx.fontKerning = fontKerning;
  }
  if (textTransform && textTransform !== 'none') {
    sx.textTransform = textTransform;
  }

  return {semanticTag, variantTag, sx};
};
