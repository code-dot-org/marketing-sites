// Brand color manifest used by Contentful definitions and components that
// expose a color selector. Adding a color: append a row here, and add the
// matching CSS variable to
// packages/component-library-styles/primitiveColors.scss.

export const BRAND_COLOR_FAMILIES = [
  'purple',
  'blue',
  'green',
  'orange',
  'pink',
  'black',
  'white',
] as const;
export type BrandColorFamily = (typeof BRAND_COLOR_FAMILIES)[number];

// Shade ladder for family tokens. Black and White carry shade 'n-a'.
export const BRAND_COLOR_SHADES = [
  'dark',
  'primary',
  'mid',
  'light',
  'n-a',
] as const;
export type BrandColorShade = (typeof BRAND_COLOR_SHADES)[number];

export const BRAND_COLORS = [
  // CodeAI brand palette — neutrals first (Black, White), then 5 families ×
  // 4 shades. Legacy `primary` is preserved at the end of the list so existing
  // Contentful entries keep validating; it surfaces as "Primary (legacy)" and
  // will be retired once consuming pages are rebuilt.
  {
    value: 'black',
    displayName: 'Black',
    cssVar: '#000000',
    family: 'black',
    shade: 'n-a',
  },
  {
    value: 'white',
    displayName: 'White',
    cssVar: 'white',
    family: 'white',
    shade: 'n-a',
  },
  {
    value: 'purpleDark',
    displayName: 'Purple Dark',
    cssVar: 'var(--codeai-purple-dark)',
    family: 'purple',
    shade: 'dark',
  },
  {
    value: 'purplePrimary',
    displayName: 'Purple Primary',
    cssVar: 'var(--codeai-purple-primary)',
    family: 'purple',
    shade: 'primary',
  },
  {
    value: 'purpleMid',
    displayName: 'Purple Mid',
    cssVar: 'var(--codeai-purple-mid)',
    family: 'purple',
    shade: 'mid',
  },
  {
    value: 'purpleLight',
    displayName: 'Purple Light',
    cssVar: 'var(--codeai-purple-light)',
    family: 'purple',
    shade: 'light',
  },
  {
    value: 'blueDark',
    displayName: 'Blue Dark',
    cssVar: 'var(--codeai-blue-dark)',
    family: 'blue',
    shade: 'dark',
  },
  {
    value: 'bluePrimary',
    displayName: 'Blue Primary',
    cssVar: 'var(--codeai-blue-primary)',
    family: 'blue',
    shade: 'primary',
  },
  {
    value: 'blueMid',
    displayName: 'Blue Mid',
    cssVar: 'var(--codeai-blue-mid)',
    family: 'blue',
    shade: 'mid',
  },
  {
    value: 'blueLight',
    displayName: 'Blue Light',
    cssVar: 'var(--codeai-blue-light)',
    family: 'blue',
    shade: 'light',
  },
  {
    value: 'greenDark',
    displayName: 'Green Dark',
    cssVar: 'var(--codeai-green-dark)',
    family: 'green',
    shade: 'dark',
  },
  {
    value: 'greenPrimary',
    displayName: 'Green Primary',
    cssVar: 'var(--codeai-green-primary)',
    family: 'green',
    shade: 'primary',
  },
  {
    value: 'greenMid',
    displayName: 'Green Mid',
    cssVar: 'var(--codeai-green-mid)',
    family: 'green',
    shade: 'mid',
  },
  {
    value: 'greenLight',
    displayName: 'Green Light',
    cssVar: 'var(--codeai-green-light)',
    family: 'green',
    shade: 'light',
  },
  {
    value: 'orangeDark',
    displayName: 'Orange Dark',
    cssVar: 'var(--codeai-orange-dark)',
    family: 'orange',
    shade: 'dark',
  },
  {
    value: 'orangePrimary',
    displayName: 'Orange Primary',
    cssVar: 'var(--codeai-orange-primary)',
    family: 'orange',
    shade: 'primary',
  },
  {
    value: 'orangeMid',
    displayName: 'Orange Mid',
    cssVar: 'var(--codeai-orange-mid)',
    family: 'orange',
    shade: 'mid',
  },
  {
    value: 'orangeLight',
    displayName: 'Orange Light',
    cssVar: 'var(--codeai-orange-light)',
    family: 'orange',
    shade: 'light',
  },
  {
    value: 'pinkDark',
    displayName: 'Pink Dark',
    cssVar: 'var(--codeai-pink-dark)',
    family: 'pink',
    shade: 'dark',
  },
  {
    value: 'pinkPrimary',
    displayName: 'Pink Primary',
    cssVar: 'var(--codeai-pink-primary)',
    family: 'pink',
    shade: 'primary',
  },
  {
    value: 'pinkMid',
    displayName: 'Pink Mid',
    cssVar: 'var(--codeai-pink-mid)',
    family: 'pink',
    shade: 'mid',
  },
  {
    value: 'pinkLight',
    displayName: 'Pink Light',
    cssVar: 'var(--codeai-pink-light)',
    family: 'pink',
    shade: 'light',
  },
  // Legacy entry — `primary` predates the CodeAI brand palette. Renamed to
  // "Primary (legacy)" in the Studio dropdown and dropped to the bottom of the
  // list so it's visually grouped with other legacy options (e.g. Paragraph's
  // "Secondary (legacy)"). Kept here so existing Contentful entries continue
  // to validate. Uses the theme-aware `--text-neutral-primary` SCSS variable
  // so the data-theme='Dark' cascade (legacy `dark`/`patternDark`/
  // `patternPrimary` Sections) continues to flip it to white. On new CodeAI
  // brand dark Sections the contrast switch in `resolveTextColorForBackground`
  // flips this token to white before the cssVar lookup.
  {
    value: 'primary',
    displayName: 'Primary (legacy)',
    cssVar: 'var(--text-neutral-primary)',
    family: 'black',
    shade: 'n-a',
  },
] as const;

export type BrandColor = (typeof BRAND_COLORS)[number]['value'];

// Drop-in for Contentful `validations.in`.
export const BRAND_COLOR_OPTIONS = BRAND_COLORS.map(({value, displayName}) => ({
  value,
  displayName,
}));

// Per-component variant: same options, but the entry matching `defaultValue`
// is suffixed with " (default)" so the Studio dropdown clearly shows which
// option is the pre-populated default for that component. Default values are
// component-specific (e.g. Paragraph/Heading/SimpleList → 'black'; Link →
// 'purplePrimary'), so we don't bake the annotation into the universal
// `BRAND_COLOR_OPTIONS` array.
export const brandColorOptionsWithDefault = (defaultValue: BrandColor) =>
  BRAND_COLORS.map(({value, displayName}) => ({
    value,
    displayName:
      value === defaultValue ? `${displayName} (default)` : displayName,
  }));

// Text-color picker variant. Same set as `brandColorOptionsWithDefault` but:
//   - `black` is relabeled "Default" so editors gravitate to it (it carries
//     the contrast switch, flipping to white on dark sections automatically).
//   - `white` moves to the bottom of the brand block (above legacy entries),
//     since it's now a deliberate "always #FFFFFF" choice rather than the
//     pre-populated default.
//   - Ordering: Default (Black), brand families, White, then `primary` legacy.
export const brandTextColorOptions = (defaultValue: BrandColor) => {
  const blackEntry = BRAND_COLORS.find(c => c.value === 'black');
  const whiteEntry = BRAND_COLORS.find(c => c.value === 'white');
  const primaryEntry = BRAND_COLORS.find(c => c.value === 'primary');
  const familyEntries = BRAND_COLORS.filter(
    c => c.value !== 'black' && c.value !== 'white' && c.value !== 'primary',
  );
  const ordered = [
    ...(blackEntry ? [blackEntry] : []),
    ...familyEntries,
    ...(whiteEntry ? [whiteEntry] : []),
    ...(primaryEntry ? [primaryEntry] : []),
  ];
  return ordered.map(({value, displayName}) => {
    const label = value === 'black' ? 'Default' : displayName;
    return {
      value,
      displayName:
        value === defaultValue && label !== 'Default'
          ? `${label} (default)`
          : label,
    };
  });
};

export const cssVarForBrandColor = (value: BrandColor): string =>
  BRAND_COLORS.find(c => c.value === value)?.cssVar ?? 'inherit';

// --- Contrast switch -------------------------------------------------------

export type BackgroundTone = 'dark' | 'light' | 'mid';

export type ContrastSwitchBehavior =
  | 'passthrough'
  | 'dark-text-on-dark-bg-becomes-white'
  | 'low-contrast-text-on-light-bg-shifts-to-family-dark'
  | 'low-contrast-text-on-mid-or-white-bg-shifts-to-family-primary';

export interface ResolvedTextColor {
  value: BrandColor;
  behavior: ContrastSwitchBehavior;
}

const findToken = (value: BrandColor | null | undefined) =>
  value ? BRAND_COLORS.find(c => c.value === value) : undefined;

// Sentinel passed by Sections with `background='transparent'` to signal that
// descendants must not auto-contrast-switch. The author owns text color in a
// transparent section because the visible background lives on an ancestor
// (Contentful native parent, background image, etc.) and its luminance can't
// be inferred from this Section's props.
export type EnclosingBackground = BrandColor | 'transparent' | null;

// Derived from the background token. Black → dark, White → mid (FR-009),
// {*-dark, *-primary} → dark, *-light → light, *-mid → mid.
export const backgroundToneFor = (
  backgroundValue: BrandColor | null | undefined,
): BackgroundTone => {
  const token = findToken(backgroundValue);
  if (!token) return 'mid'; // page-root-default
  if (token.family === 'black') return 'dark';
  if (token.family === 'white') return 'mid';
  if (token.shade === 'dark' || token.shade === 'primary') return 'dark';
  if (token.shade === 'light') return 'light';
  if (token.shade === 'mid') return 'mid';
  // Legacy entries with shade 'n-a' but a non-black/white family fall through;
  // treat as dark (defensive — should not occur with the current manifest).
  return 'dark';
};

const isDarkText = (token: (typeof BRAND_COLORS)[number]) => {
  if (token.family === 'black') return true;
  if (token.family === 'white') return false;
  return token.shade === 'dark' || token.shade === 'primary';
};

const isLowContrastText = (token: (typeof BRAND_COLORS)[number]) => {
  if (token.family === 'black' || token.family === 'white') return false;
  return token.shade === 'mid' || token.shade === 'light';
};

// Pure function. Maps (authored text color, enclosing background) → rendered
// brand-color value, per the rule table in
// specs/006-brand-color-system-init/data-model.md and FR-007 through FR-013.
//
// Pass `null` or `undefined` for backgroundValue to model "no enclosing
// background" (page root) — treated as `mid` tone, equivalent to a white
// background. Pass `'transparent'` to bypass the switch entirely; the author's
// chosen color renders verbatim (used by Sections with background='transparent'
// where the visible background lives on an ancestor).
export const resolveTextColorForBackground = (
  textValue: BrandColor,
  backgroundValue?: EnclosingBackground,
): ResolvedTextColor => {
  // Transparent sections opt out of contrast switching — author owns the color.
  if (backgroundValue === 'transparent') {
    return {value: textValue, behavior: 'passthrough'};
  }

  const textToken = findToken(textValue);
  if (!textToken) return {value: textValue, behavior: 'passthrough'};

  // White is always literal #FFFFFF — matches the pre-CodeAI behavior so
  // pre-existing content that picked "White" keeps rendering white on every
  // background. Authors who want adaptive text default to "Default" (Black).
  if (textToken.family === 'white') {
    return {value: textValue, behavior: 'passthrough'};
  }

  const tone = backgroundToneFor(backgroundValue);

  if (tone === 'dark') {
    if (isDarkText(textToken)) {
      return {value: 'white', behavior: 'dark-text-on-dark-bg-becomes-white'};
    }
    return {value: textValue, behavior: 'passthrough'};
  }

  // tone is 'light' or 'mid' below.
  if (isDarkText(textToken)) {
    return {value: textValue, behavior: 'passthrough'};
  }
  if (isLowContrastText(textToken)) {
    if (tone === 'light') {
      const shifted = `${textToken.family}Dark` as BrandColor;
      return {
        value: shifted,
        behavior: 'low-contrast-text-on-light-bg-shifts-to-family-dark',
      };
    }
    // tone === 'mid' (covers both *-mid and white backgrounds).
    const shifted = `${textToken.family}Primary` as BrandColor;
    return {
      value: shifted,
      behavior: 'low-contrast-text-on-mid-or-white-bg-shifts-to-family-primary',
    };
  }

  return {value: textValue, behavior: 'passthrough'};
};

// Convenience: returns just the rendered CSS var for the resolved color.
// Components that already use `cssVarForBrandColor(color)` can swap to
// `resolvedCssVarForBrandColor(color, enclosingBg)` to opt into the switch.
export const resolvedCssVarForBrandColor = (
  textValue: BrandColor,
  backgroundValue?: EnclosingBackground,
): string =>
  cssVarForBrandColor(
    resolveTextColorForBackground(textValue, backgroundValue).value,
  );

// Legacy SimpleList icon colors. Kept so older Contentful entries keep
// validating; renders via the component library's legacy `type` SCSS classes.
export const LEGACY_ICON_COLORS = ['secondary', 'brand'] as const;
export type LegacyIconColor = (typeof LEGACY_ICON_COLORS)[number];

export const LEGACY_ICON_COLOR_OPTIONS = [
  {value: 'secondary', displayName: 'Secondary (legacy)'},
  {value: 'brand', displayName: 'Brand (legacy)'},
];

// Legacy Paragraph colors. Renders via the theme's `paragraph--color-*`
// className rules so older Contentful entries stay visually identical.
export const LEGACY_PARAGRAPH_COLORS = ['secondary'] as const;
export type LegacyParagraphColor = (typeof LEGACY_PARAGRAPH_COLORS)[number];

export const LEGACY_PARAGRAPH_COLOR_OPTIONS = [
  {value: 'secondary', displayName: 'Secondary (legacy)'},
];
