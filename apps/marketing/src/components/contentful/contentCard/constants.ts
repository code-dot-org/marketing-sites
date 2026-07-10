// Shared Content Card option values. Kept out of ContentCard.tsx ('use
// client') so server modules — e.g. the Card Carousel's Contentful
// definition — import real arrays rather than RSC client-reference proxies.

export const CONTENT_CARD_STYLES = ['outline', 'flat', 'overlay'] as const;
export type ContentCardStyle = (typeof CONTENT_CARD_STYLES)[number];

// 'black' is the automatic default (dark text, or white over dark surfaces);
// the rest map to the codeai primary color ramp.
export const CONTENT_CARD_COLORS = [
  'black',
  'purple',
  'blue',
  'green',
  'orange',
  'pink',
] as const;
export type ContentCardColor = (typeof CONTENT_CARD_COLORS)[number];

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
