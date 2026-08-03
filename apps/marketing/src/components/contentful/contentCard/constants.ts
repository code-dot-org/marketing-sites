// Shared Content Card option values. Kept out of ContentCard.tsx ('use
// client') so server modules — e.g. the Card Carousel's Contentful
// definition — import real arrays rather than RSC client-reference proxies.

import {BrandColor, cssVarForBrandColor} from '@/components/common/colors';

export const CONTENT_CARD_STYLES = ['outline', 'flat', 'overlay'] as const;
export type ContentCardStyle = (typeof CONTENT_CARD_STYLES)[number];

// Legacy card color values — family names stored before the pickers moved to
// the full brand-color list (July 2026). Kept out of the pickers; stored
// values keep rendering via the family's primary token below. 'black' is
// also a current BrandColor value: it renders true black and contrast-flips
// to white over dark card surfaces.
export const CONTENT_CARD_COLORS = [
  'black',
  'purple',
  'blue',
  'green',
  'orange',
  'pink',
] as const;
export type LegacyContentCardColor = (typeof CONTENT_CARD_COLORS)[number];

// Card color fields accept the full brand-color list plus the legacy family
// values. Shared by Content Card, Unit Card, and their carousel/catalog
// wrappers.
export type ContentCardColor = LegacyContentCardColor | BrandColor;

const LEGACY_FAMILY_TO_BRAND: Partial<Record<string, BrandColor>> = {
  purple: 'purplePrimary',
  blue: 'bluePrimary',
  green: 'greenPrimary',
  orange: 'orangePrimary',
  pink: 'pinkPrimary',
};

export const cardColorToBrand = (color: ContentCardColor): BrandColor =>
  LEGACY_FAMILY_TO_BRAND[color] ?? (color as BrandColor);

export const cardColorCss = (color: ContentCardColor): string =>
  cssVarForBrandColor(cardColorToBrand(color));

export const CONTENT_CARD_TITLE_CASES = ['none', 'uppercase'] as const;
export type ContentCardTitleCase = (typeof CONTENT_CARD_TITLE_CASES)[number];

// Mirrors the Heading component's Visual Appearance values.
export const CONTENT_CARD_TITLE_APPEARANCES = [
  'default',
  'display-4xl',
  'display-3xl',
  'display-2xl',
  'display-xl',
  'display-lg',
  'display-md',
  'display-sm',
  'display-xs',
] as const;
export type ContentCardTitleAppearance =
  (typeof CONTENT_CARD_TITLE_APPEARANCES)[number];
