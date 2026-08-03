// Shared badge option values. Kept out of Badge.tsx ('use client') so server
// modules — the card/carousel/catalog Contentful definitions — import real
// arrays rather than RSC client-reference proxies.

// Mirrors BadgeColor in Badge.tsx.
export const BADGE_COLOR_FAMILIES = [
  'black',
  'purple',
  'blue',
  'green',
  'orange',
  'pink',
] as const;
export type BadgeColorFamily = (typeof BADGE_COLOR_FAMILIES)[number];

// Card badge picker value space: the primary families plus their Light
// variants — Badge's light appearance (light background, dark text).
export type CardBadgeColor = BadgeColorFamily | `${BadgeColorFamily}Light`;

const familyDisplayName = (family: BadgeColorFamily) =>
  family.charAt(0).toUpperCase() + family.slice(1);

// Primaries first, Light variants appended after (Black, Purple, …,
// Light Black, Light Purple, …).
export const CARD_BADGE_COLOR_OPTIONS = [
  ...BADGE_COLOR_FAMILIES.map(family => ({
    value: family,
    displayName: familyDisplayName(family),
  })),
  ...BADGE_COLOR_FAMILIES.map(family => ({
    value: `${family}Light`,
    displayName: `Light ${familyDisplayName(family)}`,
  })),
];

// Splits a card badge value into the Badge color family and whether the
// author picked the Light variant (which forces Badge's light appearance).
export const parseCardBadgeColor = (
  value: CardBadgeColor,
): {color: BadgeColorFamily; isLight: boolean} => {
  const isLight = value.endsWith('Light');
  return {
    color: (isLight
      ? value.slice(0, -'Light'.length)
      : value) as BadgeColorFamily,
    isLight,
  };
};
