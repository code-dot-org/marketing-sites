// Universal color palette shared across Contentful component definitions.
// Adding a color: append to UNIVERSAL_COLORS, then add a row to each token
// map + COLOR_DISPLAY_NAMES. Components consuming UNIVERSAL_COLOR_OPTIONS
// and the token maps pick up the new value with no per-component changes.

export const UNIVERSAL_COLORS = [
  'primary',
  'black',
  'white',
  'brand1',
  'brand2',
  'brand3',
] as const;
export type UniversalColor = (typeof UNIVERSAL_COLORS)[number];

export const COLOR_DISPLAY_NAMES: Record<UniversalColor, string> = {
  primary: 'Primary',
  black: 'Black',
  white: 'White',
  brand1: 'Brand 1',
  brand2: 'Brand 2',
  brand3: 'Brand 3',
};

export const TEXT_COLOR_TOKENS: Record<UniversalColor, string> = {
  primary: 'var(--text-neutral-primary)',
  black: 'black',
  white: 'white',
  brand1: 'var(--text-brand-purple-primary)',
  brand2: 'var(--text-brand-aqua-primary)',
  brand3: 'var(--text-brand-teal-primary)',
};

export const BACKGROUND_COLOR_TOKENS: Record<UniversalColor, string> = {
  primary: 'var(--background-neutral-primary)',
  black: 'black',
  white: 'white',
  brand1: 'var(--background-brand-purple-primary)',
  brand2: 'var(--background-brand-aqua-primary)',
  brand3: 'var(--background-brand-teal-primary)',
};

// Contentful validation list — drop straight into `validations.in`.
export const UNIVERSAL_COLOR_OPTIONS = UNIVERSAL_COLORS.map(value => ({
  value,
  displayName: COLOR_DISPLAY_NAMES[value],
}));

// Legacy color values retained for backward compat with existing Contentful
// entries (e.g. SimpleList's icon color). New components should not adopt these.
export const LEGACY_ICON_COLORS = ['secondary', 'brand'] as const;
export type LegacyIconColor = (typeof LEGACY_ICON_COLORS)[number];

export const LEGACY_ICON_COLOR_OPTIONS = [
  {value: 'secondary', displayName: 'Secondary (legacy)'},
  {value: 'brand', displayName: 'Brand (legacy)'},
];
