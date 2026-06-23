# Phase 1 Data Model: Sitewide Typography System

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Research**: [research.md](./research.md)

This document defines the entities and relationships the implementation will materialize. Every entity here is either a TypeScript module export, a CSS custom property, or an MUI theme variant. None are Contentful schema deltas — see plan §"Contentful Data Model" and research §R9.

## Entities

### 1. `TypographicTrack`

Type-level enumeration of the two font tracks.

```ts
type TypographicTrack = 'display' | 'text';
```

- **`display`** — Space Grotesk; canonical face for `H1`–`H6` and any heading-equivalent surface.
- **`text`** — Geist; canonical face for body / paragraph / list item / link label / overline / caption / form label.

### 2. `SizeToken`

Type-level enumeration of the 8-step scale per track.

```ts
type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
```

Shared vocabulary across both tracks. The same token name resolves to **different** rem values per track (e.g. `display.md` = 2.25rem, `text.md` = 1rem).

### 3. `WeightToken`

```ts
type WeightToken = 'regular' | 'medium' | 'semibold' | 'bold';
```

Maps 1:1 to numeric CSS `font-weight`:

| Token       | Numeric |
| ----------- | ------- |
| `regular`   | `400`   |
| `medium`    | `500`   |
| `semibold`  | `600`   |
| `bold`      | `700`   |

### 4. `ScaleCell`

A single cell in the (track × size) grid, locked from Figma per research §R1.

```ts
interface ScaleCell {
  fontSize: string;       // rem
  lineHeight: string;     // rem
  letterSpacing?: string; // CSS letter-spacing value (e.g. '-0.02em' for -2%); omit when none
}
```

#### Display scale (Space Grotesk)

| Token | `fontSize` | `lineHeight` | `letterSpacing` |
| ----- | ---------- | ------------ | --------------- |
| `xs`  | `1.5rem`   | `2rem`       | _none_          |
| `sm`  | `1.875rem` | `2.375rem`   | _none_          |
| `md`  | `2.25rem`  | `2.75rem`    | `-0.02em`       |
| `lg`  | `3rem`     | `3.75rem`    | `-0.02em`       |
| `xl`  | `3.75rem`  | `4.5rem`     | `-0.02em`       |
| `2xl` | `4.5rem`   | `5.625rem`   | `-0.02em`       |
| `3xl` | `5.625rem` | `6.875rem`   | `-0.02em`       |
| `4xl` | `7.5rem`   | `8.125rem`   | `-0.02em`       |

#### Text scale (Geist)

| Token | `fontSize` | `lineHeight` | `letterSpacing` |
| ----- | ---------- | ------------ | --------------- |
| `xs`  | `0.75rem`  | `1.125rem`   | _none_          |
| `sm`  | `0.875rem` | `1.25rem`    | _none_          |
| `md`  | `1rem`     | `1.5rem`     | _none_          |
| `lg`  | `1.125rem` | `1.75rem`    | _none_          |
| `xl`  | `1.25rem`  | `1.875rem`   | _none_          |
| `2xl` | `1.5rem`   | `2rem`       | _none_          |
| `3xl` | `1.875rem` | `2.375rem`   | _none_          |
| `4xl` | `2.25rem`  | `2.75rem`    | `-0.02em`       |

### 5. `Breakpoint`

```ts
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
```

Re-exports MUI's default breakpoint names (no values overridden). Used by `RoleToken.steps` to express per-viewport size deltas.

### 6. `RoleToken`

A canonical binding from a semantic role to a (track, size, weight, breakpoints) tuple. **This is the per-heading-default surface FR-023 specifies.**

```ts
interface RoleToken {
  track: TypographicTrack;
  size: SizeToken;              // desktop (md+) cell
  weight: WeightToken;
  steps?: Partial<Record<Breakpoint, SizeToken>>;
  // Optional per-breakpoint size deltas. The default cell applies at the largest
  // viewport; `steps` shifts which scale cell is used below that breakpoint.
  // Example: { md: '2xl', sm: 'xl', xs: 'lg' } — at sm width, use Display xl; at xs, use Display lg.
}
```

#### Role tokens (locked)

| Role        | Track   | Size (md+) | Weight   | Steps                                                                            | Notes                                              |
| ----------- | ------- | ---------- | -------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| `h1`        | display | `2xl`      | semibold | `{ md: '2xl', sm: 'xl', xs: 'lg' }`                                              | **Locked by user.** Spec §FR-002.                  |
| `h2`        | display | `xl`       | semibold | `{ md: 'xl', sm: 'lg', xs: 'md' }`                                               | Single-step descent.                               |
| `h3`        | display | `lg`       | semibold | `{ md: 'lg', sm: 'md', xs: 'sm' }`                                               | Single-step descent.                               |
| `h4`        | display | `md`       | semibold | `{ md: 'md', sm: 'sm', xs: 'xs' }`                                               | Single-step descent.                               |
| `h5`        | display | `sm`       | semibold | `{ md: 'sm', sm: 'xs', xs: 'xs' }`                                               | Floors at Display xs (1.5rem); never below 1rem.   |
| `h6`        | display | `xs`       | semibold | _(none — fixed at xs across all breakpoints)_                                    | Display xs = 1.5rem ≥ body floor 1rem.             |
| `body1`     | text    | `lg`       | medium   | _(none — fixed across breakpoints)_                                              | "Body L".                                          |
| `body2`     | text    | `md`       | medium   | _(none)_                                                                         | **Locked default** (`text-md` Medium, weight 500). Spec §FR-003. |
| `body3`     | text    | `sm`       | regular  | _(none)_                                                                         | "Body S" — Text sm Regular.                        |
| `body4`     | text    | `xs`       | regular  | _(none)_                                                                         | "Body XS" — Text xs Regular.                       |
| `overline`  | text    | `xs`       | semibold | _(none)_                                                                         | Existing overline-s / overline-m / overline-l size cells routed through Text xs/xs/sm per research §R5. |
| `caption`   | text    | `sm`       | semibold | _(none)_                                                                         | Per existing `theme.typography.caption` rules; weight stays at 600.        |

#### Validation rules

- For any `RoleToken` where `track === 'display'`, `steps` MUST be defined and MUST produce a `fontSize` ≥ `1rem` at every breakpoint when resolved against the Display scale. (FR-015 / SC-004.)
- For any pair `(role_i, role_{i+1})` in `[h1, h2, h3, h4, h5, h6]`, the resolved `fontSize` at every breakpoint MUST satisfy `role_i.fontSize ≥ role_{i+1}.fontSize`. (FR-016 / SC-005.)
- Both rules are enforced by a runtime invariant check in `buildTypography.ts` that throws at build time if either is violated. (Implementation detail; the throw stops the dev server / CI early rather than producing silently-broken styles.)

### 7. `FontStack`

Composed font-family cascade per track. Defined in `apps/marketing/src/themes/code.org/typography/fontStack.ts`.

```ts
const NOTO_SANS_CHAIN: readonly string[]; // 20 entries — see research §R7
const createCodeOrgFontStack: (primary: string) => string;
```

**Resolved stacks**:

- **Text track**: `Geist, Noto Sans, Noto Sans Math, Noto Sans Arabic, …, Noto Sans Thaana, sans-serif`
- **Display track**: `Space Grotesk, Noto Sans, Noto Sans Math, Noto Sans Arabic, …, Noto Sans Thaana, sans-serif`

#### Validation rules

- The first family MUST be one of `Geist` or `Space Grotesk` (the two primaries this feature uses).
- The chain MUST contain all 20 Noto Sans variants in the exact order listed in research §R7. Validation by snapshot test.
- The last entry MUST be `sans-serif`.
- The chain MUST NOT introduce any `@font-face` declaration beyond what `packages/fonts` already provides. Validation by static grep on `apps/marketing/src/themes/code.org/`.

### 8. `HeadingLevelMap`

The existing Heading `visualAppearance` field (Studio displayName "Heading Level") drives BOTH the rendered semantic tag AND the seed canonical role token. Mapping preserved 1:1 from today's behavior.

| `visualAppearance` value | Studio displayName | Semantic tag | Seed role token | Default size cell        |
| ------------------------ | ------------------ | ------------ | --------------- | ------------------------ |
| `heading-xxl`            | "Heading 1"        | `<h1>`       | `h1`            | Display 2xl Semibold     |
| `heading-xl` (default)   | "Heading 2"        | `<h2>`       | `h2`            | Display xl Semibold      |
| `heading-lg`             | "Heading 3"        | `<h3>`       | `h3`            | Display lg Semibold      |
| `heading-md`             | "Heading 4"        | `<h4>`       | `h4`            | Display md Semibold      |
| `heading-sm`             | "Heading 5"        | `<h5>`       | `h5`            | Display sm Semibold      |
| `heading-xs`             | "Heading 6"        | `<h6>`       | `h6`            | Display xs Semibold      |

The internal Contentful field name `visualAppearance` is preserved (no Contentful migration); the field is now logically "the Heading Level selector" and that misnomer is documented in the ComponentDefinition source.

### 8a. `HeadingAppearanceMap` (new field)

A new ComponentDefinition variable on Heading. Internal name `appearance`. Studio displayName "Visual Appearance". Default value `'default'` (the sentinel).

| `appearance` value | Studio displayName     | Effect                                                                                |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------- |
| `default`          | "Default (from level)" | No override — render the seed role token from Heading Level unchanged.                |
| `display-4xl`      | "Display 4xl"          | Override size cell to Display 4xl Semibold + Display 4xl's per-breakpoint steps.      |
| `display-3xl`      | "Display 3xl"          | Override to Display 3xl Semibold + steps.                                              |
| `display-2xl`      | "Display 2xl"          | Override to Display 2xl Semibold + steps. _(Same cell as canonical H1.)_              |
| `display-xl`       | "Display xl"           | Override to Display xl Semibold + steps. _(Same cell as canonical H2.)_               |
| `display-lg`       | "Display lg"           | Override to Display lg Semibold + steps. _(Same cell as canonical H3.)_               |
| `display-md`       | "Display md"           | Override to Display md Semibold + steps. _(Same cell as canonical H4.)_               |
| `display-sm`       | "Display sm"           | Override to Display sm Semibold + steps. _(Same cell as canonical H5.)_               |
| `display-xs`       | "Display xs"           | Override to Display xs Semibold (no per-breakpoint steps — Display xs is the floor). _(Same cell as canonical H6.)_ |

The override replaces: `size`, `weight`, `lineHeight`, `letterSpacing`, and `steps` (per-breakpoint table). The override preserves: `track` (always Display), `fontFamily` (Display stack), and the rendered semantic tag (set by Heading Level).

The 8 cells of the Display scale are intentionally all listed even though canonical H1 already uses Display 2xl (so Heading Level = h1 + Visual Appearance = Display 2xl is a no-op compared to Heading Level = h1 + Visual Appearance = default). The redundancy is harmless and makes the dropdown self-describing.

#### Validation rules (Heading appearance)

- When `appearance = 'default'`, the rendered styles match the Heading Level's canonical role token exactly. (Required for FR-011 back-compat.)
- When `appearance` is a `display-*` value, the rendered semantic tag MUST still match the Heading Level's mapping (FR-009 step 1).
- The 9 enum values MUST appear in the order: `default`, `display-4xl`, `display-3xl`, `display-2xl`, `display-xl`, `display-lg`, `display-md`, `display-sm`, `display-xs` (largest-first for the cell values, after the sentinel).

### 8b. `ParagraphVisualAppearanceMap` (widened enum)

The existing Paragraph `visualAppearance` enum is widened from 4 to 12 values. Legacy values keep their existing role-token bindings; new values map to fresh role tokens.

| `visualAppearance` value | Studio displayName | Maps to role | Maps to MUI variant | Default style                              | Legacy? |
| ------------------------ | ------------------ | ------------ | ------------------- | ------------------------------------------ | ------- |
| `body-one`               | "Body L"           | `body1`      | `body1`             | Text lg Medium (1.125rem / 1.75rem)        | Legacy  |
| `body-two` (default)     | "Body M" (default) | `body2`      | `body2`             | **Text md Medium (1rem / 1.5rem)** LOCKED  | Legacy  |
| `body-three`             | "Body S"           | `body3`      | `body3`             | Text sm Regular (0.875rem / 1.25rem)       | Legacy  |
| `body-four`              | "Body XS"          | `body4`      | `body4`             | Text xs Regular (0.75rem / 1.125rem)       | Legacy  |
| `text-4xl`               | "Text 4xl"         | `text-4xl`   | `body1`             | Text 4xl Medium (2.25rem / 2.75rem)        | New     |
| `text-3xl`               | "Text 3xl"         | `text-3xl`   | `body1`             | Text 3xl Medium (1.875rem / 2.375rem)      | New     |
| `text-2xl`               | "Text 2xl"         | `text-2xl`   | `body1`             | Text 2xl Medium (1.5rem / 2rem)            | New     |
| `text-xl`                | "Text xl"          | `text-xl`    | `body1`             | Text xl Medium (1.25rem / 1.875rem)        | New     |
| `text-lg`                | "Text lg"          | `text-lg`    | `body1`             | Text lg Medium (1.125rem / 1.75rem)        | New     |
| `text-md`                | "Text md"          | `text-md`    | `body2`             | Text md Medium (1rem / 1.5rem)             | New     |
| `text-sm`                | "Text sm"          | `text-sm`    | `body3`             | Text sm Regular (0.875rem / 1.25rem)       | New     |
| `text-xs`                | "Text xs"          | `text-xs`    | `body4`             | Text xs Regular (0.75rem / 1.125rem)       | New     |

**Notes**:

- New `text-*` cells `text-md`/`text-lg`/`text-sm`/`text-xs` resolve to the same role tokens as the legacy values they correspond to (`body-two`/`body-one`/`body-three`/`body-four` respectively). Authors using the new names get identical visuals; the new names are clearer for new authoring.
- New larger cells `text-2xl` / `text-3xl` / `text-4xl` are sizes that did not have a Paragraph variant before. They render via `body1`'s variant binding but with overrides for size + line-height (and letter-spacing for `text-4xl`).
- The 12 enum values appear in Studio in the order shown above (legacy first, then largest-to-smallest of the new Text cells).
- The MUI variant binding for new `text-*` values: large cells (`4xl`/`3xl`/`2xl`/`xl`/`lg`) use `body1`; `md` uses `body2`; `sm` uses `body3`; `xs` uses `body4`. The variant binding is a convenience for downstream consumers (Rich Text etc.) that read the variant — the actual rendered styles come from the role token, applied via inline `sx` overrides in the Paragraph render path.

### 8c. `StyleResolutionChain`

Pure-function resolution from (Heading Level, Visual Appearance, individual overrides) to a final styles object passed to MUI's `Typography.sx`. Lives in a helper `apps/marketing/src/components/contentful/heading/resolveHeadingStyles.ts`.

**Heading chain (3 steps)**:

```ts
interface ResolveHeadingArgs {
  visualAppearance: HeadingLevelValue; // legacy enum, drives tag + seed role
  appearance: HeadingAppearanceValue;  // new enum, default 'default'
  fontSize?: number;       // rem
  lineHeight?: number;     // unitless
  fontWeight?: '500' | '700';
  fontKerning?: 'auto' | 'normal' | 'none';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  // colorOverride / zIndex handled separately as inline color/position
}

function resolveHeadingStyles(args: ResolveHeadingArgs): {
  semanticTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  // The variant binding for MUI's <Typography>; ALWAYS matches the semantic tag.
  // The actual style values flow through the sx prop below.
  variantTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  // sx contains ONLY override entries — never a static fontFamily / fontSize
  // / fontWeight / lineHeight / letterSpacing that would shadow the variant.
  // The variant is set per the chain's step 2 result so MUI's per-variant
  // styleOverrides + breakpoint media queries flow correctly.
  sx: Record<string, unknown>;
};
```

Resolution procedure:

1. Compute `semanticTag` and `seedRole` from `HeadingLevelMap[args.visualAppearance]`. `semanticTag` is final; `seedRole` provides the canonical role token (track=display, size, weight, lineHeight, letterSpacing, steps).
2. If `args.appearance !== 'default'`, look up the Display cell role token for that appearance value. The cell's (size, weight, lineHeight, letterSpacing, steps) **replace** the seed. Family remains Display.
3. Apply individual overrides to whichever cell step 2 settled on:
   - `args.fontSize` → `sx.fontSize`
   - `args.fontWeight` → `sx.fontWeight = Number(args.fontWeight)`
   - `args.lineHeight` → `sx.lineHeight`
   - `args.fontKerning` → `sx.fontKerning`
   - `args.textTransform !== 'none'` → `sx.textTransform`
4. The `variantTag` for MUI is set by step 2's chosen cell: if step 2 settled on canonical H_N's cell (i.e. the cell matches `ROLE_TOKENS[h{N}]`), set `variantTag` to that level so MUI uses the `h{N}` variant's emitted CSS variables. If step 2 settled on a cell that doesn't match any canonical level (impossible by construction since the 8 Display cells map 1:1 to the 6 H_N levels via `display-2xl`/`xl`/`lg`/`md`/`sm`/`xs` plus 2 extras `display-4xl`/`display-3xl`), emit inline `sx.fontSize`/`lineHeight`/`letterSpacing` plus per-breakpoint styles. For the 2 extra cells (`display-4xl`, `display-3xl`), the implementation MUST emit the cell's full style payload inline because no MUI variant maps to those cells.

**Paragraph chain (2 steps)**:

```ts
interface ResolveParagraphArgs {
  visualAppearance: ParagraphVisualAppearanceValue; // widened enum, default 'body-two'
  isStrong?: boolean;
  isItalic?: boolean;
  // color / colorOverride / textTransform / sx handled at the call site
}

function resolveParagraphStyles(args: ResolveParagraphArgs): {
  variantTag: 'body1' | 'body2' | 'body3' | 'body4';
  sx: Record<string, unknown>;
};
```

Resolution procedure:

1. Look up the role token + MUI variant binding from `ParagraphVisualAppearanceMap[args.visualAppearance]`. The variant binding sets `variantTag`; the role token provides the size/line-height/weight defaults via the variant's styleOverrides.
2. For new `text-*` values that don't match the variant's canonical default (e.g. `text-3xl` uses `body1` variant but renders at Text 3xl size, not body1's Text lg size), emit inline `sx.fontSize`/`lineHeight`/`letterSpacing` to override the variant's defaults.
3. Apply individual overrides: `isStrong = true` → `sx.fontWeight = WEIGHTS.semibold`; `isItalic = true` → `sx.fontStyle = 'italic'`. Override behavior unchanged from spec 009 base.

#### Validation rules (Style Resolution Chain)

- Heading: `semanticTag` MUST equal `HeadingLevelMap[visualAppearance].semanticTag` regardless of `appearance` value (FR-009 step 1).
- Heading: when `appearance = 'default'` and no individual overrides are set, `resolveHeadingStyles` MUST emit an empty `sx` (zero overrides) so MUI's variant defaults flow through unchanged (FR-011 back-compat).
- Paragraph: when `visualAppearance` is a legacy `body-*` value and no overrides are set, `resolveParagraphStyles` MUST emit an empty `sx` (or only the standard `isStrong`/`isItalic` entries if set) so MUI's variant defaults flow through unchanged (FR-011 back-compat).

### 8d. (Removed)

_(Original §8 `LegacyVisualAppearanceMap` was split into the more precise §8 `HeadingLevelMap` + §8a `HeadingAppearanceMap` + §8b `ParagraphVisualAppearanceMap` + §8c `StyleResolutionChain` to match the orthogonal-field model introduced by the 2026-06-23 amendment.)_

#### Validation rules

- Existing entries MUST render under the new role token without re-editing or re-publishing. (SC-007.)
- The map is total over the legacy enum — every legacy value resolves to exactly one role.

### 9. `SharedScssScale`

CSS custom properties exposed in `packages/component-library-styles/typography.module.scss` for non-MUI consumers (deprecated component SCSS modules, etc.).

```scss
:root {
  // Text scale (existing + extended)
  --font-size-text-xs: 0.75rem;
  --font-size-text-sm: 0.875rem;
  --font-size-text-md: 1rem;
  --font-size-text-lg: 1.125rem;
  --font-size-text-xl: 1.25rem;
  --font-size-text-2xl: 1.5rem;
  --font-size-text-3xl: 1.875rem;
  --font-size-text-4xl: 2.25rem;

  // Display scale (new)
  --font-size-display-xs: 1.5rem;
  --font-size-display-sm: 1.875rem;
  --font-size-display-md: 2.25rem;
  --font-size-display-lg: 3rem;
  --font-size-display-xl: 3.75rem;
  --font-size-display-2xl: 4.5rem;
  --font-size-display-3xl: 5.625rem;
  --font-size-display-4xl: 7.5rem;

  // Existing back-compat variables — KEEP, resolve to same values
  --font-size-body-xs: 0.813rem;  // back-compat — keep
  --font-size-body-sm: var(--font-size-text-sm);
  --font-size-body-md: var(--font-size-text-md);
  --font-size-body-lg: var(--font-size-text-xl); // back-compat: was 1.25rem
}
```

#### Validation rules

- Each existing variable (`--font-size-body-{xs,sm,md,lg}`) MUST resolve to the value it currently has (`0.813rem` / `0.875rem` / `1rem` / `1.25rem` respectively). Validated by snapshot test or grep.
- New variables MUST follow the `--font-size-<track>-<size>` naming convention.
- Line-height variables are NOT added in this pass — consumers either use MUI variants (which include line-height) or use the existing SCSS mixins (`@mixin heading-xxl` etc.). New SCSS mixins for display-4xl/3xl can be added in a follow-up if needed.

### 10. `MuiTypographyOptions`

The output object passed to `createTheme({ typography: ... })`. Computed by `buildTypography(tokens)` in `apps/marketing/src/themes/code.org/typography/buildTypography.ts`.

```ts
import {createTheme} from '@mui/material';

interface MuiTypographyVariant {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  // MUI accepts breakpoint media queries as keys (string types via emotion).
  // Example: [theme.breakpoints.down('md')]: { fontSize: '...' }
  [breakpointMediaQuery: string]: unknown;
}

interface MuiTypographyOptions {
  fontFamily: string; // default text-track stack
  h1: MuiTypographyVariant; // bound to RoleToken['h1']
  h2: MuiTypographyVariant; // bound to RoleToken['h2']
  // ... h3 / h4 / h5 / h6
  body1: MuiTypographyVariant; // bound to RoleToken['body1']
  // ... body2 / body3 / body4
  overline: MuiTypographyVariant; // bound to RoleToken['overline']
  caption: MuiTypographyVariant; // bound to RoleToken['caption']
}
```

#### Validation rules

- Every MUI variant the existing theme currently uses (`h1`–`h6`, `body1`–`body4`, `overline`, `caption`) MUST be present in the output.
- The variant for `h1`–`h6` MUST emit `fontFamily` = Display stack; `body1`–`body4` / `overline` / `caption` MUST emit `fontFamily` = Text stack (or inherit from the top-level `typography.fontFamily`).
- Per-breakpoint `fontSize` overrides MUST be present for `h1`–`h5`; `h6` MAY omit them since it has no steps.

## Relationships

```text
ScaleCell        — owned by — TypographicTrack
RoleToken        — references — TypographicTrack, SizeToken, WeightToken
RoleToken        — produces — MuiTypographyVariant     (via buildTypography)
FontStack        — references — TypographicTrack       (one stack per track)
SharedScssScale  — mirrors — ScaleCell                 (rem values must match)
LegacyVisualAppearanceMap — references — RoleToken     (one role per legacy value)
```

## State transitions

None. All entities are static / build-time. No runtime state machine.

## File layout

```text
apps/marketing/src/themes/code.org/typography/
├── tokens.ts         # exports SCALE_DISPLAY, SCALE_TEXT, ROLE_TOKENS, BREAKPOINTS (re-export of MUI defaults)
├── fontStack.ts      # exports NOTO_SANS_CHAIN, createCodeOrgFontStack
└── buildTypography.ts # exports buildTypography(theme: Theme): MuiTypographyOptions
                       # Pure function. Throws at build/dev time if a validation rule is violated.

apps/marketing/src/themes/code.org/index.ts
├── imports buildTypography + tokens + createCodeOrgFontStack
└── passes the result to createTheme({ typography: ... })
```

## Out of model

- Brand color tokens — owned by spec 006.
- Button typography (Brand Buttons) — owned by spec 008; hardcodes Space Grotesk in `genericButton.module.scss` per the Figma Brand Button spec. Out of scope here.
- Brand Text Link typography — owned by spec 008; consumes Text-track sizes via the existing per-tenant `MuiLink` styleOverrides; this feature only verifies the consumption is correct after the new tokens land.
- CSforAll typography — owned by `themes/csforall/`. **Untouched.**
- Per-locale Noto Sans loading (`getFontByLocale`, `FontLoader`) — owned by `packages/fonts/`. **Untouched.**
- Critical-font @font-face declarations — owned by `@code-dot-org/fonts/brands/code.org/index.css`. **Untouched.**
