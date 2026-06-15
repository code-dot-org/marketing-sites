// Brand color manifest used by Contentful definitions and components that
// expose a color selector. Adding a color: append a row here, and add the
// matching CSS variable to
// packages/component-library-styles/primitiveColors.scss.

export const BRAND_COLORS = [
  {
    value: 'primary',
    displayName: 'Primary',
    cssVar: 'var(--text-neutral-primary)',
  },
  {value: 'white', displayName: 'White', cssVar: 'white'},
  {value: 'purple', displayName: 'Purple', cssVar: 'var(--codeai-purple)'},
  {
    value: 'darkPurple1',
    displayName: 'Dark Purple 1',
    cssVar: 'var(--codeai-purple-dark-1)',
  },
  {
    value: 'darkPurple2',
    displayName: 'Dark Purple 2',
    cssVar: 'var(--codeai-purple-dark-2)',
  },
  {
    value: 'lightGreen3',
    displayName: 'Light Green 3',
    cssVar: 'var(--codeai-green-light-3)',
  },
] as const;

export type BrandColor = (typeof BRAND_COLORS)[number]['value'];

// Drop-in for Contentful `validations.in`.
export const BRAND_COLOR_OPTIONS = BRAND_COLORS.map(({value, displayName}) => ({
  value,
  displayName,
}));

export const cssVarForBrandColor = (value: BrandColor): string =>
  BRAND_COLORS.find(c => c.value === value)?.cssVar ?? 'inherit';

// Legacy SimpleList icon colors. Kept so older Contentful entries keep
// validating; renders via the component library's legacy `type` SCSS classes.
export const LEGACY_ICON_COLORS = ['secondary', 'brand'] as const;
export type LegacyIconColor = (typeof LEGACY_ICON_COLORS)[number];

export const LEGACY_ICON_COLOR_OPTIONS = [
  {value: 'secondary', displayName: 'Secondary (legacy)'},
  {value: 'brand', displayName: 'Brand (legacy)'},
];
