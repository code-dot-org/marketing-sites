// Shared Curriculum Card option values. Kept out of UnitCard.tsx ('use
// client') so server modules — e.g. the carousel's Contentful definition —
// import real arrays rather than RSC client-reference proxies.

export const UNIT_CARD_TYPES = ['unit', 'course'] as const;
export type UnitCardType = (typeof UNIT_CARD_TYPES)[number];

export const UNIT_CARD_TYPE_OPTIONS = [
  {value: 'unit', displayName: 'Unit'},
  {value: 'course', displayName: 'Course'},
];

// Course cards are wider. Also sizes the carousel's slides.
export const CARD_WIDTH_PX: Record<UnitCardType, number> = {
  unit: 264,
  course: 318,
};

// Semantic tag only — the visual size stays the card's. H1 is excluded
// (one per page).
export const HEADING_LEVELS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export const HEADING_LEVEL_OPTIONS = HEADING_LEVELS.map(level => ({
  value: level,
  displayName: level.toUpperCase(),
}));
