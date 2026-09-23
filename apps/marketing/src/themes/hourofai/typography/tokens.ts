// All literals (no aliases) so any single value can change on its own.

import type {
  DisplayAppearanceValue,
  RoleToken,
  RoleTokenName,
  ScaleCell,
  SizeToken,
  TextAppearanceValue,
  WeightToken,
} from '@/themes/common/typography/types';

export const WEIGHTS: Record<WeightToken, number> = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Display track (Space Grotesk).
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

// Text track (Geist).
export const SCALE_TEXT: Record<SizeToken, ScaleCell> = {
  xs: {fontSize: '0.75rem', lineHeight: '1.125rem'},
  sm: {fontSize: '0.875rem', lineHeight: '1.25rem'},
  md: {fontSize: '1rem', lineHeight: '1.5rem'},
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

// `steps` keys are viewports: sm = tablet, xs = mobile.
export const ROLE_TOKENS: Record<RoleTokenName, RoleToken> = {
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
    track: 'text',
    size: '4xl',
    weight: 'medium',
    steps: {md: '4xl', sm: '3xl', xs: '2xl'},
  },
  h4: {
    track: 'text',
    size: '3xl',
    weight: 'medium',
    steps: {md: '3xl', sm: '2xl', xs: '2xl'},
  },
  h5: {track: 'text', size: '2xl', weight: 'medium'},
  h6: {track: 'text', size: '2xl', weight: 'medium'},

  body1: {track: 'text', size: 'lg', weight: 'regular'},
  body2: {track: 'text', size: 'md', weight: 'regular'},
  body3: {track: 'text', size: 'sm', weight: 'regular'},
  body4: {track: 'text', size: 'xs', weight: 'regular'},

  overline: {track: 'text', size: 'xs', weight: 'semibold'},
  caption: {track: 'text', size: 'sm', weight: 'semibold'},
};

// Heading "Visual Appearance" cells (size-only override).
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
  'display-xl': {
    track: 'display',
    size: 'xl',
    weight: 'semibold',
    steps: {md: 'xl', sm: 'lg', xs: 'md'},
  },
  'display-lg': {
    track: 'display',
    size: 'lg',
    weight: 'medium',
    steps: {md: 'lg', sm: 'md', xs: 'sm'},
  },
  'display-md': {
    track: 'display',
    size: 'md',
    weight: 'medium',
    steps: {md: 'md', sm: 'sm', xs: 'xs'},
  },
  'display-sm': {
    track: 'display',
    size: 'sm',
    weight: 'medium',
    steps: {md: 'sm', sm: 'xs', xs: 'xs'},
  },
  'display-xs': {track: 'display', size: 'xs', weight: 'medium'},
};

// Paragraph "Visual Appearance" cells.
export const PARAGRAPH_APPEARANCE_ROLES: Record<
  TextAppearanceValue,
  RoleToken
> = {
  'text-4xl': {track: 'text', size: '4xl', weight: 'regular'},
  'text-3xl': {track: 'text', size: '3xl', weight: 'regular'},
  'text-2xl': {track: 'text', size: '2xl', weight: 'regular'},
  'text-xl': {track: 'text', size: 'xl', weight: 'regular'},
  'text-lg': {track: 'text', size: 'lg', weight: 'regular'},
  'text-md': {track: 'text', size: 'md', weight: 'regular'},
  'text-sm': {track: 'text', size: 'sm', weight: 'regular'},
  'text-xs': {track: 'text', size: 'xs', weight: 'regular'},
};
