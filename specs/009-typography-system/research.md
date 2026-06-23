# Phase 0 Research: Sitewide Typography System

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Date**: 2026-06-23

This document resolves the open items the spec deferred to `/plan` against Figma and the existing code state. Every claim here is sourced — either to a file path (with line number where relevant), a git commit SHA, or a Figma node id under file `Aw6YXqpx6QFlNMXqCKk60e`.

## R1 — Figma scale values (visible-label methodology)

**Decision**: Lock both 8-step scales exactly as Figma's _visible sample labels_ specify (not the variable names — the variables are mislabeled per the user). Values are extracted from the design context payloads for nodes `36:874` (Space Grotesk / Display) and `36:975` (Geist / Text). Both tracks share the same size-token vocabulary; the rem values differ per track.

**Rationale**: The user flagged Figma variable mislabeling at spec time. Reading the visible label embedded in each sample text block ("Display 4xl", "Display 3xl", …, "Text md", "Text sm", "Text xs") gives the authoritative size cell per the user's intent.

### Display track (Space Grotesk) — confirmed from node `36:874`

| Size | Font-size           | Line-height         | Letter-spacing | Source                                       |
| ---- | ------------------- | ------------------- | -------------- | -------------------------------------------- |
| 4xl  | `7.5rem` (120px)    | `8.125rem` (130px)  | `-2%`          | sub-node `36:907` — sample text "Display 4xl" |
| 3xl  | `5.625rem` (90px)   | `6.875rem` (110px)  | `-2%`          | sub-node `36:916` — sample text "Display 3xl" |
| 2xl  | `4.5rem` (72px)     | `5.625rem` (90px)   | `-2%`          | sub-node `36:925` — sample text "Display 2xl" |
| xl   | `3.75rem` (60px)    | `4.5rem` (72px)     | `-2%`          | sub-node `36:934`                            |
| lg   | `3rem` (48px)       | `3.75rem` (60px)    | `-2%`          | sub-node `36:943`                            |
| md   | `2.25rem` (36px)    | `2.75rem` (44px)    | `-2%`          | sub-node `36:952`                            |
| sm   | `1.875rem` (30px)   | `2.375rem` (38px)   | none           | sub-node `36:961`                            |
| xs   | `1.5rem` (24px)     | `2rem` (32px)       | none           | sub-node `36:970`                            |

### Text track (Geist) — confirmed from node `36:975`

| Size | Font-size           | Line-height         | Letter-spacing | Source                                |
| ---- | ------------------- | ------------------- | -------------- | ------------------------------------- |
| 4xl  | `2.25rem` (36px)    | `2.75rem` (44px)    | `-2%`          | sub-node `36:1008` — sample text "Text 4XL" |
| 3xl  | `1.875rem` (30px)   | `2.375rem` (38px)   | none           | sub-node `36:1017` — sample text "Text 3XL" |
| 2xl  | `1.5rem` (24px)     | `2rem` (32px)       | none           | sub-node `36:1026` — sample text "Text 2XL" |
| xl   | `1.25rem` (20px)    | `1.875rem` (30px)   | none           | sub-node `36:1035`                    |
| lg   | `1.125rem` (18px)   | `1.75rem` (28px)    | none           | sub-node `36:1044`                    |
| md   | `1rem` (16px)       | `1.5rem` (24px)     | none           | sub-node `36:1053`                    |
| sm   | `0.875rem` (14px)   | `1.25rem` (20px)    | none           | sub-node `36:1062`                    |
| xs   | `0.75rem` (12px)    | `1.125rem` (18px)   | none           | sub-node `36:1071`                    |

**Note on Display md vs Text 4xl collision**: both cells resolve to 36px / 44px line-height. Different family (Space Grotesk vs Geist), so they are distinct tokens at the type-system level — the values just happen to coincide.

**Note on Text sm / Text xs below 1rem**: the body-base floor (FR-015, FR-004 of plan) applies to **heading** levels, not to all type. Text sm (0.875rem) and Text xs (0.75rem) are legitimate caption / overline / metadata sizes. The floor only applies when a **heading variant** at a small viewport would otherwise step below 1rem.

**Alternatives considered**:

- A. Treat Figma variable names as authoritative — _rejected_. The variable names show e.g. `Font size/display-2xl = 72` but the same row's sample text says "Display 4xl" with computed value 120px. The user instructed us to read the visible label.
- B. Use a single shared scale across both tracks — _rejected_. The two tracks have different visual purposes (display headings vs body text) and Figma deliberately gives them different rem values per token. A shared scale would either double the Display sizes (breaking body legibility) or halve the Text sizes (breaking large-display intent).

## R2 — Weight ladder

**Decision**: 4 weights per track — **Regular (400)**, **Medium (500)**, **Semibold (600)**, **Bold (700)**. CSS `font-weight` numeric values, matching the Figma variable defs at node `36:874` sub-nodes `36:884`–`36:902` and node `36:975` sub-nodes `36:984`–`36:1003`.

**Rationale**: Figma's "Weights" section for both tracks lists exactly four cells labeled Regular / Medium / Semibold / Bold with the supporting text confirming "Font weight: 400 / 500 / 600 / 700". Mapping the existing SCSS-side mixins is 1:1 (`font.scss:22-25`).

| Weight token | Numeric | SCSS mixin                          | Figma source |
| ------------ | ------- | ----------------------------------- | ------------ |
| `regular`    | `400`   | `font.$regular-font-weight`         | `36:887`     |
| `medium`     | `500`   | `font.$medium-font-weight`          | `36:892`     |
| `semibold`   | `600`   | `font.$semi-bold-font-weight`       | `36:897`     |
| `bold`       | `700`   | `font.$bold-font-weight`            | `36:902`     |

**Studio surface scope**: The existing `heading.fontWeight` Contentful field validates `'500' | '700'` only (`HeadingContentfulDefinition.ts:89-94`). Widening to four enums (Regular / Medium / Semibold / Bold) IS a Contentful schema delta requiring MCP confirmation. **This feature defers that widening** — authors retain Medium / Bold via Studio; the 4-weight ladder is exposed in the TS code, the theme, and Storybook for engineering / design / direct-component use. Widening the field is logged as a follow-up.

## R3 — Heading default ladder (H1 → H6)

**Decision**: H1–H6 descend the Display scale in single-step increments at Semibold (600). Confirmed against the Figma scale; the floor is the body base (1rem), so H6 at any viewport is `Display xs` (1.5rem) and does not step below 1rem.

| Level | Track   | Size   | Weight   | Desktop (md+) value         | Mobile (xs) step                | Notes                                       |
| ----- | ------- | ------ | -------- | --------------------------- | ------------------------------- | ------------------------------------------- |
| H1    | Display | 2xl    | Semibold | `4.5rem` / `5.625rem` line  | `3rem` (Display lg) / `3.75rem` | Locked by user. Steps down 2 cells at mobile. |
| H2    | Display | xl     | Semibold | `3.75rem` / `4.5rem` line   | `2.25rem` (Display md) / `2.75rem` | Steps down 2 cells at mobile.            |
| H3    | Display | lg     | Semibold | `3rem` / `3.75rem` line     | `1.875rem` (Display sm) / `2.375rem` | Steps down 2 cells at mobile.          |
| H4    | Display | md     | Semibold | `2.25rem` / `2.75rem` line  | `1.5rem` (Display xs) / `2rem`  | Steps down 2 cells at mobile.            |
| H5    | Display | sm     | Semibold | `1.875rem` / `2.375rem` line | `1.5rem` (Display xs) / `2rem`  | Steps down 1 cell at mobile.             |
| H6    | Display | xs     | Semibold | `1.5rem` / `2rem` line      | `1.5rem` (Display xs) / `2rem`  | Floor — no step.                          |

**Tablet (sm, 600–900px)** step: H1–H4 each take an intermediate cell — H1=Display xl, H2=Display lg, H3=Display md, H4=Display sm. H5/H6 do not step at tablet.

**Why this ladder**: The user locked H1 = Display 2xl Semibold. Descending the Display scale at Semibold (matching H1's weight) preserves a consistent typographic voice across levels. Single-step descent is the simplest non-arbitrary mapping. Mobile/tablet steps preserve hierarchy at smaller widths without ever crossing the body floor (FR-015 / FR-016).

**Alternatives considered**:

- A. Variable weights per level (e.g. H1 Bold, H2 Semibold, H3 Medium) — _rejected_. Adds visual noise; user described H1 as Semibold and did not differentiate weights across levels.
- B. Two-cell skip per level (H1 = 2xl, H2 = lg, H3 = md, H4 = xs) — _rejected_. Compresses the ladder; H4 collapses to xs which is the same as H6, violating non-increasing rule trivially at small viewports.
- C. Continuous `clamp()` per level (existing approach) — _rejected_. Spec FR-014 explicitly removes clamp() in favor of stepped breakpoints with the 8-token vocabulary.

## R4 — Paragraph / body variant ladder

**Decision**: Bind the existing `body-one`/`-two`/`-three`/`-four` enum to four cells in the Text track, with the locked **body default (body-two = Text md Medium)** in the middle:

| `visualAppearance` | MUI variant | Track | Size | Weight  | Font-size / line-height                                |
| ------------------ | ----------- | ----- | ---- | ------- | ------------------------------------------------------ |
| `body-one`         | `body1`     | Text  | lg   | Medium  | `1.125rem` (18px) / `1.75rem` (28px) line, weight 500   |
| `body-two`         | `body2`     | Text  | md   | Medium  | **`1rem` (16px) / `1.5rem` (24px) line, weight 500** _(LOCKED — Figma `text-md`)_ |
| `body-three`       | `body3`     | Text  | sm   | Regular | `0.875rem` (14px) / `1.25rem` (20px) line, weight 400   |
| `body-four`        | `body4`     | Text  | xs   | Regular | `0.75rem` (12px) / `1.125rem` (18px) line, weight 400   |

**Rationale**: `body-two` is already the Contentful default (`ParagraphContentfulDefinition.ts:27`) and matches the locked body default per user. The other three variants follow the Text-scale ladder one step in each direction. body1/body2 use Medium to match the body default's weight; body3/body4 drop to Regular because the smaller cells in the Figma reference use Regular at default.

**Note on `isStrong`**: The existing `isStrong: true` prop maps to font-weight 600 in `Paragraph.tsx:95`. In the new ladder this is **Semibold** — semantically identical numeric value, but the role-token system treats it as a named weight. Preserve the numeric mapping; rename internal variables to reference `semibold` where they currently say `600`.

## R5 — Overline + caption mapping

**Decision**: Re-route the existing overline + caption font sizes (currently hardcoded in `themes/code.org/styleOverrides/typography.ts:28-43`) through Text-track cells, **at the same final rem values they have today** so no visible change occurs on existing entries:

| Variant            | Current (px / rem) | Maps to        | New rem value | Δ visible?                |
| ------------------ | ------------------ | -------------- | ------------- | ------------------------- |
| `overline--size-s` | 10px / `0.625rem`  | Text xs (12px) | `0.75rem`     | Yes — grows ~20%          |
| `overline--size-m` | 12px / `0.75rem`   | Text xs (12px) | `0.75rem`     | No                        |
| `overline--size-l` | 14px / `0.875rem`  | Text sm (14px) | `0.875rem`    | No                        |
| `caption`          | 14px / `0.875rem`  | Text sm (14px) | `0.875rem`    | No                        |

The `overline--size-s` cell DOES change visibly (10px → 12px) — record this in the spec as an **intentional small change** under the legacy-mapping section. If a stakeholder objects, an alternative is to introduce an additional Text scale "xxs" cell at 0.625rem (10px) below xs, but that breaks the 8-cell symmetry the spec requires. Recommend keeping the change and validating with Applitools baseline diff.

**Alternative**: keep `overline--size-s` at 0.625rem with a code-level escape hatch (`var(--overline-xxs)`) — _deferred_. Cleaner to take the small visible change and stay on the 8-cell scale.

## R6 — Responsive breakpoint table

**Decision**: Use MUI's default breakpoint set (no override). The breakpoints are: `xs=0`, `sm=600`, `md=900`, `lg=1200`, `xl=1536` (pixels, from `@mui/material/styles/createBreakpoints`).

Per-variant breakpoint shape inside `theme.typography.h{N}`:

```ts
{
  fontFamily: '<Display stack>',
  fontWeight: 600, // Semibold
  fontSize: '4.5rem', // Display 2xl (desktop default)
  lineHeight: '5.625rem',
  letterSpacing: '-2%',
  [breakpoints.down('md')]: { fontSize: '3.75rem', lineHeight: '4.5rem' }, // Display xl (tablet)
  [breakpoints.down('sm')]: { fontSize: '3rem', lineHeight: '3.75rem' },    // Display lg (mobile)
}
```

**Rationale**: MUI's default breakpoints already match this repo's existing layout breakpoints (verified in `themes/code.org/index.ts` — no `breakpoints` field is overridden, confirming MUI defaults are in use). Custom breakpoints would require coordination with every component's layout.

**Note**: MUI's `cssVariables: true` option (already enabled at `themes/code.org/index.ts:10`) emits the variant config as CSS custom properties (e.g. `--mui-typography-h1-fontSize`). The breakpoint-conditional rules ARE preserved across SSR via MUI's emotion cache.

## R7 — Noto Sans fallback chain composition

**Decision**: Restore the **21-variant chain** that existed at commit `984a9f05` (2025-06-27, "feat(marketing): create People Collection component (#66745)") with `Geist` substituted for the prior primary `Figtree` (body) and `Space Grotesk` substituted as the primary for the Display track (headings).

**Final chain for body (Text track)**:

```
Geist,
Noto Sans, Noto Sans Math, Noto Sans Arabic, Noto Sans Armenian,
Noto Sans Bengali, Noto Sans SC, Noto Sans TC, Noto Sans Devanagari,
Noto Sans Georgian, Noto Sans Hebrew, Noto Sans JP, Noto Sans Kannada,
Noto Sans Khmer, Noto Sans KR, Noto Sans Myanmar, Noto Sans Sinhala,
Noto Sans Tamil, Noto Sans Telugu, Noto Sans Thai, Noto Sans Thaana,
sans-serif
```

**Final chain for headings (Display track)**: identical except `Space Grotesk` replaces `Geist` as the first family.

**Rationale**:

- The list is already canonicalized in **SCSS** at `packages/component-library-styles/font.scss:12-17` (`$noto-sans-fonts`, 20 variants — Math is in `font.scss` too; the prior commit had 21 including Math). Mirroring TS-side keeps a single source of truth.
- The 20 variants cover Latin (Noto Sans), CJK (JP/SC/TC/KR), Indic (Devanagari, Bengali, Tamil, Telugu, Kannada, Sinhala, Myanmar, Thai, Khmer), RTL (Arabic, Hebrew, Thaana), and other (Armenian, Georgian, Math). This matches the 24-locale per-locale resolver in `packages/fonts/src/constants.ts:14-39` 1:1 (the resolver dispatches to one of these variants by locale).
- The chain order matters: the browser picks the **first family that contains a glyph for the character being rendered**. Putting the script-specific variants before generic Noto Sans means a CJK character will be picked up by Noto Sans JP before falling through to the Latin-only Noto Sans. Reproducing the exact prior order preserves the historically-working selection.

**`@font-face` impact**: None added by this feature. `packages/fonts/src/fonts/noto-sans.scss` already declares the Latin `Noto Sans` variable @font-face globally via `@code-dot-org/fonts/brands/code.org/index.css` (loaded in `themes/code.org/critical-fonts.ts`). Script-specific Noto Sans variants are lazy-loaded by locale via `getFontByLocale` + the `FontLoader` client component (`packages/fonts/src/react/FontLoader/index.tsx`). The MUI font-family cascade only references the family **names** — when a downloaded face is available the browser uses it; when the user is in a locale that has not loaded a script-specific variant, the browser falls through to a system Noto Sans if installed and finally to `sans-serif`.

**Implementation**: Create `apps/marketing/src/themes/code.org/typography/fontStack.ts`:

```ts
import {GEIST_FONT, SPACE_GROTESK_FONT} from '../constants/fonts';

export const NOTO_SANS_CHAIN = [
  'Noto Sans',
  'Noto Sans Math',
  'Noto Sans Arabic',
  'Noto Sans Armenian',
  'Noto Sans Bengali',
  'Noto Sans SC',
  'Noto Sans TC',
  'Noto Sans Devanagari',
  'Noto Sans Georgian',
  'Noto Sans Hebrew',
  'Noto Sans JP',
  'Noto Sans Kannada',
  'Noto Sans Khmer',
  'Noto Sans KR',
  'Noto Sans Myanmar',
  'Noto Sans Sinhala',
  'Noto Sans Tamil',
  'Noto Sans Telugu',
  'Noto Sans Thai',
  'Noto Sans Thaana',
] as const;

export const createCodeOrgFontStack = (primary: string) =>
  [primary, ...NOTO_SANS_CHAIN, 'sans-serif'].join(', ');
```

`themes/code.org/index.ts` consumes `createCodeOrgFontStack(GEIST_FONT)` for the typography default and `createCodeOrgFontStack(SPACE_GROTESK_FONT)` for the Display-track variants. `themes/csforall/index.ts` continues to consume the existing `createFontStack` from `themes/common/constants.tsx` — **untouched**.

**Alternatives considered**:

- A. Add Noto Sans to `themes/common/constants.tsx`'s `createFontStack` directly (shared) — _rejected_. Would also extend csforall's font cascade, violating "do not touch csforall" (spec FR-019). Even though Latin renders identically, computed-style snapshots would diff and trip Applitools.
- B. Read the SCSS `$noto-sans-fonts` value at TS-build time and inline it — _rejected_. SCSS → TS bridge is fragile; the chain rarely changes; duplicating the small list is cheaper than the build plumbing.

## R8 — Deprecated component inventory

**Decision**: The deprecated components to migrate in scope of this feature are the **code.org-only corporate-site SCSS files** that hardcode `font-size` / `font-weight` / `line-height` and visually surface on code.org marketing pages today. Atomic / shared component-library files that ship to both tenants are **opt-in, file-by-file, after this feature lands** (with csforall visual regression gating each migration).

### In scope for this spec (US2 / FR-012)

| File                                                                                              | Hardcoded values                                          | Migration target                                                                       |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `apps/marketing/src/components/contentful/corporateSite/yourSchool/yourSchool.module.scss`        | `font-size: 2rem` (L143), `1.25rem` (L173), `0.875rem` (L232); `line-height: 1.4`, `1.54` | `2rem` → `var(--text-2xl)` _wait_ — there's no text-2xl that resolves to 2rem; 2rem = Display md (Space Grotesk, 36px). If this is a heading-like header, route to MUI `Typography variant="h4"`; if it's a numeric stat label, route to a new `--display-md`/`--text-3xl` shared SCSS var. **Per-line decision recorded in `contracts/deprecated-component-migration.md`.** |
| `apps/marketing/src/components/contentful/corporateSite/adoptionMap/adoptionMap.module.scss`      | `font-size: 0.75rem` (L31, L96); `line-height: 1.64`; `font-weight: 600` (L48) | `0.75rem` = Text xs. Route via `var(--font-size-text-xs)` (extended in `typography.module.scss`). |
| `apps/marketing/src/components/contentful/corporateSite/adoptionMap/adoptionMap.scss`             | `font-size: 1.5rem` (L18); `line-height: 0.55` (L19 — **bug** per fork agent) | `1.5rem` = Text 2xl OR Display xs. The 0.55 line-height looks like a typo — flag in PR. |
| `apps/marketing/src/components/contentful/corporateSite/afeEligibility/afeEligibility.module.scss`| `font-size: 1rem` (L26), `0.625rem` (L148); `font-weight: 500` (L147)        | `1rem` = Text md. `0.625rem` is **sub-1rem and below Text xs** — clamp to `var(--font-size-text-xs)` (0.75rem) per the spec's "sub-1rem → smallest ≥ 1rem" rule for headings, or accept as a Text-xxs caption (spec scope ambiguous — recommend clamping to Text xs and documenting). |
| `apps/marketing/src/components/contentful/activityCatalog/activitiesHero.tsx`                      | `fontSize: {xs: 36, md: 50}` **in px**, `fontWeight: 800` | px → rem (`{xs: '2.25rem', md: '3.125rem'}`); fontWeight 800 (Extra Bold) is **not in the 4-weight ladder** — research recommends routing to `Typography variant="h2"` or `h1` and dropping the inline `fontSize` / `fontWeight` overrides. Decision recorded in `contracts/deprecated-component-migration.md`. |
| `apps/marketing/src/components/contentful/activityCatalog/facetBar/facetBar.tsx`                   | `fontWeight: 600/700`                                     | If the label semantics are body, use `<Paragraph isStrong>` (Semibold). If heading, use Heading + override.       |
| `apps/marketing/src/components/contentful/activityCatalog/facetDrawer/facetDrawer.tsx`             | `fontWeight: 600/700` (L47, L100)                         | Same as facetBar.                                                                       |
| `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapPanel.tsx`          | `fontWeight={700}` (L41)                                  | `<Paragraph isStrong>` (Semibold = 600) **OR** widen to `fontWeight={isStrong ? 700 : 400}` — per-line decision. |
| `apps/marketing/src/components/contentful/video/videoComponents/styledMuiComponents/index.ts`      | `fontSize: '3rem'` (L84)                                  | `3rem` = Display lg → route to Heading variant.                                          |
| `apps/marketing/src/components/contentful/card/Card.tsx`                                           | `fontWeight="bolder"` (L155)                              | Use `<Paragraph isStrong>` (numeric 600) — `"bolder"` is browser-relative and inconsistent across contexts. |

Hero Banner: per the explore agent's first report there is a Hero Banner component reference in spec scope, but it was not surfaced in this inventory pass. **TBD in tasks**: run `find apps/marketing/src/components -iname '*hero*'` and add to the list. If no Hero Banner component exists at code.org-only scope today, scope shrinks accordingly. _(Action: confirm in `/speckit.tasks`.)_

### Out of scope here — atomic / shared component-library hardcoded type (opt-in follow-up)

The fork research identified ~12 shared component-library SCSS files (button, dropdown, closeButton, tabs, alert, tooltip, breadcrumbs, segmentedButtons, checkbox, tags, toggle, dialog, popover, carousel, actionBlock, list/simpleList, cms/header, cms/snapshot, radioButton, video) with hardcoded `font-size` / `font-weight` / `line-height` declarations — many in **px units**. Migrating these is risky because they ship to **both tenants** and any value change would diff csforall's Applitools baseline.

**Recommended follow-up scope**: a per-file migration spec that gates each file behind a csforall visual diff = 0. _Not in scope for this feature._

### CSforAll-only files — DO NOT TOUCH

- `apps/marketing/src/components/header/csForAll/SiteLogo.tsx:18` — `lineHeight: 1` (csforall-only header logo treatment)
- `apps/marketing/src/themes/csforall/index.ts` — full h1–h6 / body1–body4 / overline variants (the parallel csforall theme)
- `apps/marketing/src/components/header/csForAll/common/styles.ts:43,73-74` — reads `theme.typography.h5.fontSize`, `body3.fontSize`, `fontWeightBold` from the csforall theme (correctly tokenized)
- `apps/marketing/src/components/header/csForAll/DropdownMenu.tsx:43` — same pattern, csforall-only

These continue to render byte-identical pre / post this feature. Applitools baselines for csforall stories MUST diff to 0.

## R9 — Contentful schema impact

**Decision**: **No Contentful content-type or ComponentDefinition schema changes.**

**Verified by direct read** (not MCP, since both definitions are code-side and the spec FR-024 commits to no schema delta):

- `apps/marketing/src/components/contentful/heading/HeadingContentfulDefinition.ts:7-125` — `visualAppearance` enum stays at `heading-xxl`/`xl`/`lg`/`md`/`sm`/`xs`; `fontWeight` validates `'500' | '700'`; `fontSize` is a freeform Number (rem); `lineHeight` is a freeform Number.
- `apps/marketing/src/components/contentful/paragraph/ParagraphContentfulDefinition.ts:10-95` — `visualAppearance` enum stays at `body-one`/`-two`/`-three`/`-four`; `isStrong` / `isItalic` booleans unchanged.

**Contentful MCP context**: not required for this feature. The Heading and Paragraph **content types** in the Contentful schema (the actual entry-level schema, separate from the ComponentDefinition exported to Studio) have validations driven by `brandTextColorOptions(...)` and the inline enum values shown above. No content-type schema delta is needed because no enum value is added/removed and no field is added/removed. **Recorded explicitly per Constitution V**: this is application-code-only Contentful registration; no MCP read / write was performed for this feature.

**Studio surface deferred**: widening `heading.fontWeight` from `['500', '700']` to `['400', '500', '600', '700']` (Regular / Medium / Semibold / Bold) IS a Contentful schema delta. Logged as a deferred follow-up; not in scope here.

## R10 — Visual regression strategy

**Decision**: Apply the standard `marketing/storybook-eyes` (Applitools) gate per `[[project_storybook_eyes_baseline_gate]]`. Every story affected by this feature will diff post-merge and require baseline re-acceptance in the Applitools dashboard. The hard gate is the **csforall-only stories must diff to zero**.

**Risk**: any shared change (typography.module.scss var values, font.scss imports, common/constants.tsx if it grows a code.org-specific helper colocated there) that inadvertently affects csforall's rendered output will turn into a csforall baseline change requiring an unrelated re-acceptance. Mitigations:

1. Keep the new code.org-specific font-stack helper in `themes/code.org/typography/fontStack.ts`, **not** in `themes/common/constants.tsx`.
2. Extend `typography.module.scss` additively: every existing variable (`--font-size-body-{xs,sm,md,lg}`) retains its current resolved value. Only NEW variables are added.
3. Run csforall Storybook locally with `yarn storybook` and visually compare key stories (Heading, Paragraph, Hero Banner equivalent if any) BEFORE pushing.
4. If a csforall diff appears, treat as a regression — investigate before accepting the baseline.

**Alternative**: skip Applitools and rely on Jest snapshot tests — _rejected_. Type rendering is visual; pixel diffs catch glyph-substitution failures the snapshot wouldn't see.

## R11 — Why no parallel "heading default" token type

**Decision**: Do not introduce a parallel CSS-variable-based heading default token type (e.g. `--codeai-heading-h1-fontSize`, `--codeai-heading-h1-fontFamily`, `--codeai-heading-h1-fontWeight`, etc.). The MUI variant API (`theme.typography.h1…h6`) is itself the per-heading-default surface.

**Rationale**:

- MUI's `theme.typography.<variant>` accepts a full `{ fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, [breakpoints] }` payload. Changing any field in one place propagates to every consumer that renders `<Typography variant="h1">` or relies on the MUI emotion cache (which `Heading.tsx` does via `<Typography variant={tag}>`).
- With `cssVariables: true` (already on), MUI emits `--mui-typography-h1-fontSize` etc. — these CSS variables ARE addressable from SCSS modules (deprecated components, etc.) without needing a parallel codeai-namespace.
- A parallel `--codeai-heading-h1-*` set would duplicate the contract. Two sources of truth invite drift.

This resolves the user's spec-level question ("explore whether a new token type is necessary") with a documented "no — the MUI variant layer is that surface."

## R12 — Critical-font loading and FOUT

**Decision**: Leave the critical-font pipeline (`apps/marketing/src/themes/code.org/critical-fonts.ts` → `@code-dot-org/fonts/brands/code.org/index.css`) **unchanged**.

**Rationale**:

- `@code-dot-org/fonts/brands/code.org/index.css` already declares `@font-face` for Geist, Space Grotesk, and Noto Sans (variable). Adding Noto Sans **names** to the cascade does not require adding @font-face declarations — they already exist.
- Per-locale Noto Sans variants are lazy-loaded via the existing `FontLoader` client component and `getFontByLocale` resolver — unchanged.
- `font-display: swap` semantics are already in place for the loaded faces. The MUI font-family cascade ensures a glyph that lacks the primary face's coverage is rendered in the next available family WITHOUT waiting on additional downloads.

## R13 — Performance budget

**Decision**: ≤ 1 KB gzipped bundle delta across `apps/marketing` for this feature.

**Components of the delta**:

- New TS files in `themes/code.org/typography/` — small (~500 bytes gzipped: tokens object + builder function + font-stack helper).
- Deleted `HEADING_RESPONSIVE_SIZE` table in `Heading.tsx` — small win.
- `themes/code.org/index.ts` typography section grows (per-breakpoint blocks) but in unminified source; gzipped size grows < 200 bytes given high token repetition.
- No new dependency imports.

**Validation**: After implementation, run `yarn analyze` (or whatever the existing bundle-size dashboard step is) and confirm.

## R14 — Open follow-ups (logged, not in scope)

- Widen `heading.fontWeight` Contentful enum to 4 cells (Regular / Medium / Semibold / Bold) — Contentful schema delta, separate spec.
- Migrate the ~12 shared component-library SCSS files to the new shared `typography.module.scss` CSS variables — opt-in per-file with csforall visual regression gates.
- Add Hero Banner component to the deprecated-component list once its path is confirmed (or remove from scope if no longer present).
- Consider adding an `xxs` cell (0.625rem / 10px) to the Text track if `overline--size-s` deserves to keep its current visible size rather than growing to 0.75rem.
- Audit RTL layout under the restored Noto Sans Arabic / Hebrew / Thaana variants — spot check rather than full sweep.
