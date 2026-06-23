# Contract: Role Tokens

**Feature**: [spec.md](../spec.md) · **Data model**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

The canonical binding from each semantic role to a (track, size, weight) cell plus a per-breakpoint step table. This is what `theme.typography.h1`…`theme.typography.caption` resolve to after this feature lands.

## Export shape

`apps/marketing/src/themes/code.org/typography/tokens.ts` exports:

```ts
import type {Theme} from '@mui/material/styles';

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
  fontSize: string; // rem
  lineHeight: string; // rem
  letterSpacing?: string;
}

export interface RoleToken {
  track: TypographicTrack;
  size: SizeToken;
  weight: WeightToken;
  steps?: Partial<Record<Breakpoint, SizeToken>>;
}

export const SCALE_DISPLAY: Record<SizeToken, ScaleCell>;
export const SCALE_TEXT: Record<SizeToken, ScaleCell>;
export const WEIGHTS: Record<WeightToken, number>;
export const ROLE_TOKENS: Readonly<{
  h1: RoleToken;
  h2: RoleToken;
  h3: RoleToken;
  h4: RoleToken;
  h5: RoleToken;
  h6: RoleToken;
  body1: RoleToken;
  body2: RoleToken;
  body3: RoleToken;
  body4: RoleToken;
  overline: RoleToken;
  caption: RoleToken;
}>;
```

## Cell-as-role tokens for Heading Visual Appearance override (added 2026-06-23)

The new Heading `appearance` field can pick any of the 8 Display cells. Each cell carries a canonical role token (track=display, the cell size, Semibold weight, the cell's line-height and letter-spacing, and the cell's per-breakpoint step table where applicable). These are exported from the same `tokens.ts` as `DISPLAY_APPEARANCE_ROLES`:

```ts
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
  }, // = ROLE_TOKENS.h1
  'display-xl': {
    track: 'display',
    size: 'xl',
    weight: 'semibold',
    steps: {md: 'xl', sm: 'lg', xs: 'md'},
  }, // = ROLE_TOKENS.h2
  'display-lg': {
    track: 'display',
    size: 'lg',
    weight: 'semibold',
    steps: {md: 'lg', sm: 'md', xs: 'sm'},
  }, // = ROLE_TOKENS.h3
  'display-md': {
    track: 'display',
    size: 'md',
    weight: 'semibold',
    steps: {md: 'md', sm: 'sm', xs: 'xs'},
  }, // = ROLE_TOKENS.h4
  'display-sm': {
    track: 'display',
    size: 'sm',
    weight: 'semibold',
    steps: {md: 'sm', sm: 'xs', xs: 'xs'},
  }, // = ROLE_TOKENS.h5
  'display-xs': {track: 'display', size: 'xs', weight: 'semibold'}, // = ROLE_TOKENS.h6
} as const;
```

The 6 cells that match canonical H1–H6 are **exactly equal** to the corresponding `ROLE_TOKENS.h{N}`. The 2 extra cells (`display-4xl`, `display-3xl`) extend the responsive step table outward (4xl steps down through 3xl + 2xl at narrower viewports).

`PARAGRAPH_APPEARANCE_ROLES` exports the same shape for the 8 new Text-cell `visualAppearance` values on Paragraph:

```ts
export const PARAGRAPH_APPEARANCE_ROLES: Record<
  TextAppearanceValue,
  RoleToken
> = {
  'text-4xl': {track: 'text', size: '4xl', weight: 'medium'},
  'text-3xl': {track: 'text', size: '3xl', weight: 'medium'},
  'text-2xl': {track: 'text', size: '2xl', weight: 'medium'},
  'text-xl': {track: 'text', size: 'xl', weight: 'medium'},
  'text-lg': {track: 'text', size: 'lg', weight: 'medium'}, // = ROLE_TOKENS.body1
  'text-md': {track: 'text', size: 'md', weight: 'medium'}, // = ROLE_TOKENS.body2 (LOCKED default)
  'text-sm': {track: 'text', size: 'sm', weight: 'regular'}, // = ROLE_TOKENS.body3
  'text-xs': {track: 'text', size: 'xs', weight: 'regular'}, // = ROLE_TOKENS.body4
} as const;
```

The 4 cells that match canonical body1–body4 are **exactly equal** to the corresponding `ROLE_TOKENS.body{N}`. The 4 larger cells (`text-4xl` / `text-3xl` / `text-2xl` / `text-xl`) extend the Text scale upward at Medium weight (consistent with body1's Medium default).

## Locked values

### `WEIGHTS`

```ts
export const WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
```

### `SCALE_DISPLAY` (Space Grotesk)

```ts
export const SCALE_DISPLAY: Record<SizeToken, ScaleCell> = {
  xs: {fontSize: '1.5rem', lineHeight: '2rem'},
  sm: {fontSize: '1.875rem', lineHeight: '2.375rem'},
  md: {fontSize: '2.25rem', lineHeight: '2.75rem', letterSpacing: '-0.02em'},
  lg: {fontSize: '3rem', lineHeight: '3.75rem', letterSpacing: '-0.02em'},
  xl: {fontSize: '3.75rem', lineHeight: '4.5rem', letterSpacing: '-0.02em'},
  '2xl': {fontSize: '4.5rem', lineHeight: '5.625rem', letterSpacing: '-0.02em'},
  '3xl': {
    fontSize: '5.625rem',
    lineHeight: '6.875rem',
    letterSpacing: '-0.02em',
  },
  '4xl': {fontSize: '7.5rem', lineHeight: '8.125rem', letterSpacing: '-0.02em'},
} as const;
```

### `SCALE_TEXT` (Geist)

```ts
export const SCALE_TEXT: Record<SizeToken, ScaleCell> = {
  xs: {fontSize: '0.75rem', lineHeight: '1.125rem'},
  sm: {fontSize: '0.875rem', lineHeight: '1.25rem'},
  md: {fontSize: '1rem', lineHeight: '1.5rem'}, // LOCKED body default
  lg: {fontSize: '1.125rem', lineHeight: '1.75rem'},
  xl: {fontSize: '1.25rem', lineHeight: '1.875rem'},
  '2xl': {fontSize: '1.5rem', lineHeight: '2rem'},
  '3xl': {fontSize: '1.875rem', lineHeight: '2.375rem'},
  '4xl': {fontSize: '2.25rem', lineHeight: '2.75rem', letterSpacing: '-0.02em'},
} as const;
```

### `ROLE_TOKENS`

```ts
export const ROLE_TOKENS = {
  h1: {
    track: 'display',
    size: '2xl',
    weight: 'semibold',
    steps: {md: '2xl', sm: 'xl', xs: 'lg'},
  },
  h2: {
    track: 'display',
    size: 'xl',
    weight: 'semibold',
    steps: {md: 'xl', sm: 'lg', xs: 'md'},
  },
  h3: {
    track: 'display',
    size: 'lg',
    weight: 'semibold',
    steps: {md: 'lg', sm: 'md', xs: 'sm'},
  },
  h4: {
    track: 'display',
    size: 'md',
    weight: 'semibold',
    steps: {md: 'md', sm: 'sm', xs: 'xs'},
  },
  h5: {
    track: 'display',
    size: 'sm',
    weight: 'semibold',
    steps: {md: 'sm', sm: 'xs', xs: 'xs'},
  },
  h6: {track: 'display', size: 'xs', weight: 'semibold'},

  body1: {track: 'text', size: 'lg', weight: 'medium'},
  body2: {track: 'text', size: 'md', weight: 'medium'}, // LOCKED default
  body3: {track: 'text', size: 'sm', weight: 'regular'},
  body4: {track: 'text', size: 'xs', weight: 'regular'},

  overline: {track: 'text', size: 'xs', weight: 'semibold'},
  caption: {track: 'text', size: 'sm', weight: 'semibold'},
} as const satisfies Record<string, RoleToken>;
```

## Computed MUI variant output

`buildTypography(theme)` reads `ROLE_TOKENS` + the scale + the font stack and emits an MUI typography options object whose `h1` example resolves to:

```ts
h1: {
  fontFamily: 'Space Grotesk, Noto Sans, Noto Sans Math, ..., Noto Sans Thaana, sans-serif',
  fontWeight: 600,
  fontSize: '4.5rem',
  lineHeight: '5.625rem',
  letterSpacing: '-0.02em',
  // Only present when steps differ from the default cell:
  [theme.breakpoints.down('md')]: {
    fontSize: '3.75rem',
    lineHeight: '4.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '3rem',
    lineHeight: '3.75rem',
  },
}
```

## Invariants enforced at build/dev time

`buildTypography` runs three validation passes on every theme construction; if any pass fails, the function throws and the dev server / CI build halts.

1. **Floor invariant** — for every heading role (`h1`–`h6`) and every breakpoint key in its `steps`, the resolved `fontSize` (when parsed back from the rem literal) MUST be `≥ 1rem`. Failure example: `h6.steps.xs` accidentally set to a hypothetical Display token below 1rem.
2. **Hierarchy invariant** — for every breakpoint ∈ {`xs`, `sm`, `md`, `lg`, `xl`}, the resolved `fontSize` sequence for `[h1, h2, h3, h4, h5, h6]` MUST be non-increasing. Failure example: H2 steps to `lg` at `sm` while H3 stays at `lg` at `sm`.
3. **Scale completeness invariant** — every cell in `SCALE_DISPLAY` and `SCALE_TEXT` MUST be defined for all 8 size tokens. Failure example: a typo removes the `3xl` cell.

The invariants are tested by Jest snapshot tests on `buildTypography(createTheme())` output and by a separate `buildTypography.invariants.test.ts` that exercises each failure case.

## How to change H1's default across the site

```diff
 export const ROLE_TOKENS = {
-  h1: {track: 'display', size: '2xl', weight: 'semibold', steps: {md: '2xl', sm: 'xl',  xs: 'lg'}},
+  h1: {track: 'display', size: '3xl', weight: 'semibold', steps: {md: '3xl', sm: '2xl', xs: 'xl'}},
   ...
 }
```

Save. Next build picks up the new H1 default for every default Heading, Hero Banner title (after US2 migration), and Storybook story.

## Acceptance criteria

- All values in this file match `apps/marketing/src/themes/code.org/typography/tokens.ts` after implementation.
- `buildTypography(createTheme()).h1.fontSize === '4.5rem'` at desktop (locked H1 default).
- `buildTypography(createTheme()).body2.fontSize === '1rem'` and `.lineHeight === '1.5rem'` (locked body default).
- All three invariants pass on the locked ROLE_TOKENS.

## Out of contract

- `body3`/`body4`/`overline`/`caption` weights and any future role tokens (e.g. `subtitle`, `button`) — not specified here; add to ROLE_TOKENS via a new spec when they appear.
- Letter-spacing for non-Display tokens — not specified here; only the Display 4xl cell carries letter-spacing in the Text track.
