// Typography role tokens for the code.org tenant.
// Values come from the Figma file Aw6YXqpx6QFlNMXqCKk60e (Space Grotesk node 36:874,
// Geist node 36:975), read from the visible sample labels embedded in each cell
// (the variable names in that file are mislabeled).
// See specs/009-typography-system/contracts/{role-tokens,scale-tokens}.md.

export type TypographicTrack = 'display' | 'text';

export type SizeToken =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

export type WeightToken = 'regular' | 'medium' | 'semibold' | 'bold';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ScaleCell {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface RoleToken {
  track: TypographicTrack;
  size: SizeToken;
  weight: WeightToken;
  steps?: Partial<Record<Breakpoint, SizeToken>>;
}

export const WEIGHTS: Record<WeightToken, number> = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Display line-heights are font-size + 0.25rem (tightened July 2026 from the
// original Figma values, anchored on lg 3.25rem and md 2.5rem).
export const SCALE_DISPLAY: Record<SizeToken, ScaleCell> = {
  xs: {fontSize: '1.5rem', lineHeight: '1.75rem'},
  sm: {fontSize: '1.875rem', lineHeight: '2.125rem'},
  md: {fontSize: '2.25rem', lineHeight: '2.5rem', letterSpacing: '-0.02em'},
  lg: {fontSize: '3rem', lineHeight: '3.25rem', letterSpacing: '-0.02em'},
  xl: {fontSize: '3.75rem', lineHeight: '4rem', letterSpacing: '-0.02em'},
  '2xl': {
    fontSize: '4.5rem',
    lineHeight: '4.75rem',
    letterSpacing: '-0.02em',
  },
  '3xl': {
    fontSize: '5.625rem',
    lineHeight: '5.875rem',
    letterSpacing: '-0.02em',
  },
  '4xl': {
    fontSize: '7.5rem',
    lineHeight: '7.75rem',
    letterSpacing: '-0.02em',
  },
};

export const SCALE_TEXT: Record<SizeToken, ScaleCell> = {
  xs: {fontSize: '0.75rem', lineHeight: '1.125rem'},
  sm: {fontSize: '0.875rem', lineHeight: '1.25rem'},
  md: {fontSize: '1rem', lineHeight: '1.5rem'}, // LOCKED body default
  lg: {fontSize: '1.125rem', lineHeight: '1.75rem'},
  xl: {fontSize: '1.25rem', lineHeight: '1.875rem'},
  '2xl': {fontSize: '1.5rem', lineHeight: '2rem'},
  '3xl': {fontSize: '1.875rem', lineHeight: '2.375rem'},
  '4xl': {
    fontSize: '2.25rem',
    lineHeight: '2.75rem',
    letterSpacing: '-0.02em',
  },
};

// Canonical per-semantic-role bindings. Editing one entry here changes the
// rendered default across every default Heading / Paragraph entry on code.org.
export const ROLE_TOKENS = {
  h1: {
    track: 'display',
    size: 'xl',
    weight: 'semibold',
    steps: {md: 'xl', sm: 'lg', xs: 'md'},
  },
  h2: {
    track: 'display',
    size: 'lg',
    weight: 'medium',
    steps: {md: 'lg', sm: 'md', xs: 'sm'},
  },
  h3: {
    track: 'display',
    size: 'md',
    weight: 'medium',
    steps: {md: 'md', sm: 'sm', xs: 'xs'},
  },
  h4: {
    track: 'display',
    size: 'sm',
    weight: 'medium',
    steps: {md: 'sm', sm: 'xs', xs: 'xs'},
  },
  h5: {track: 'display', size: 'xs', weight: 'medium'},
  h6: {track: 'display', size: 'xs', weight: 'medium'},

  body1: {track: 'text', size: 'lg', weight: 'regular'},
  body2: {track: 'text', size: 'md', weight: 'regular'}, // LOCKED default — Regular
  body3: {track: 'text', size: 'sm', weight: 'regular'},
  body4: {track: 'text', size: 'xs', weight: 'regular'},

  overline: {track: 'text', size: 'xs', weight: 'semibold'},
  caption: {track: 'text', size: 'sm', weight: 'semibold'},
} as const satisfies Record<string, RoleToken>;

// Display cell-as-role tokens used by the new Heading `appearance` field
// (Visual Appearance override). Per amendment-4, Visual Appearance is a
// SIZE-only override — the weight + font-family come from the chosen
// Heading Level. These role tokens therefore carry only size + lineHeight
// + letterSpacing + responsive step table; the `weight` field is unused
// by the resolver and kept here for completeness.
export type DisplayAppearanceValue =
  | 'display-xs'
  | 'display-sm'
  | 'display-md'
  | 'display-lg'
  | 'display-xl'
  | 'display-2xl'
  | 'display-3xl'
  | 'display-4xl';

export const DISPLAY_APPEARANCE_ROLES: Record<
  DisplayAppearanceValue,
  RoleToken
> = {
  'display-4xl': {
    track: 'display',
    size: '4xl',
    weight: 'semibold',
    steps: {md: '4xl', sm: '3xl', xs: '2xl'},
  },
  'display-3xl': {
    track: 'display',
    size: '3xl',
    weight: 'semibold',
    steps: {md: '3xl', sm: '2xl', xs: 'xl'},
  },
  'display-2xl': {
    track: 'display',
    size: '2xl',
    weight: 'semibold',
    steps: {md: '2xl', sm: 'xl', xs: 'lg'},
  },
  'display-xl': ROLE_TOKENS.h1, // canonical match for H1 (xl Semibold)
  'display-lg': ROLE_TOKENS.h2, // canonical match for H2 (lg Medium)
  'display-md': ROLE_TOKENS.h3, // canonical match for H3 (md Medium)
  'display-sm': ROLE_TOKENS.h4, // canonical match for H4 (sm Medium)
  'display-xs': ROLE_TOKENS.h5, // canonical match for H5 & H6 (xs Medium)
};

// Text cell-as-role tokens used by the widened Paragraph `visualAppearance`
// enum (new `text-*` values). Four cells equal the canonical body1–body4
// role tokens exactly; the four larger cells extend the Text scale upward.
export type TextAppearanceValue =
  | 'text-xs'
  | 'text-sm'
  | 'text-md'
  | 'text-lg'
  | 'text-xl'
  | 'text-2xl'
  | 'text-3xl'
  | 'text-4xl';

export const PARAGRAPH_APPEARANCE_ROLES: Record<
  TextAppearanceValue,
  RoleToken
> = {
  'text-4xl': {track: 'text', size: '4xl', weight: 'regular'},
  'text-3xl': {track: 'text', size: '3xl', weight: 'regular'},
  'text-2xl': {track: 'text', size: '2xl', weight: 'regular'},
  'text-xl': {track: 'text', size: 'xl', weight: 'regular'},
  'text-lg': ROLE_TOKENS.body1,
  'text-md': ROLE_TOKENS.body2,
  'text-sm': ROLE_TOKENS.body3,
  'text-xs': ROLE_TOKENS.body4,
};

export type RoleTokenName = keyof typeof ROLE_TOKENS;
