// Kept out of ActivityCard.tsx ('use client') so the Contentful definitions
// import real values.
export const ACTIVITY_CARD_DEFAULT_WIDTH = '325px';

const WIDTH_PATTERN = /^\d+(\.\d+)?(px|%)$/;

/** An authored width in px or %; anything else (including empty) is auto. */
export const cardWidthCss = (width?: string): string => {
  const value = width?.trim() ?? '';
  return WIDTH_PATTERN.test(value) ? value : 'auto';
};
