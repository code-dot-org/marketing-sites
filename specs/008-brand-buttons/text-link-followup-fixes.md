# Text Link & Button follow-up fixes

**Feature**: 008-brand-buttons
**Date**: 2026-06-22 (post-merge follow-up)
**Status**: Implemented

After the initial 008-brand-buttons implementation landed and the user reviewed the new code.org rendering, eight issues were identified and fixed in this follow-up pass — six against the Brand Text Link and two against the Brand Button (dual-CTA size parity, icon-size precision). This document captures the plan that was used and what shipped.

## Context

The initial rebrand left a handful of rough edges:

1. **`Black` Hierarchy renders purple** — `resolveHierarchy()` in `apps/marketing/src/components/contentful/link/Link.tsx` had no `case 'black'`, so authors picking Black hit the catch-all `color` (purple) branch.
2. **`OpenInNew` external-link SVG always black** — `themes/code.org/styleOverrides/svgIcon.ts` applies a global `color: var(--text-neutral-primary)` that defeats `fontSize="inherit"` on the icon. The external-link icon never picked up the link's per-Hierarchy color.
3. **Brand Link lost its bottom margin** — the new `themes/code.org/styleOverrides/link.ts` didn't set `marginBottom`; the legacy override used `theme.spacing(2)`. Authors who wanted the old default got nothing.
4. **Brand Text Links not underlined by default** — Figma omits underline on the Brand Link, but the project history (and most reader expectations) calls for an underline. Needed a per-instance opt-out so authors can suppress it when a context demands it.
5. **Editorial Card and other CMS card primitives use the in-house DSCO `Link`, not the Brand Text Link** — the component-library can't import from `apps/marketing`, so a global re-skin wasn't possible. Needed a slot-prop pattern.
6. **Rich-text inline links look oversized** — the Brand `m` size forces 14px / 21.7px / UPPERCASE typography over the paragraph's natural font, line-height, and case. Inline rich-text links should inherit those.
7. **Primary and Secondary Brand Buttons render at different sizes** — Secondary has a `2px` solid border that contributes to its outer box; Primary's base was `1px solid transparent` and its background contributed nothing extra. In a dual-CTA section the two buttons sat at different heights and widths.
8. **Icon-only sizing must always be 20px** — with-text buttons follow size (`s`/`m` at 13px, `l`/`xl` at 20px), but every icon-only button — regardless of size class — should render its glyph at 20px. The `l` and `xl` icon-only rules were relying on inheritance from the parent rule rather than declaring it explicitly.

## Findings (confirmed via Read before implementation)

| Concern                                | Anchor file / line                                                                                                                                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Black-not-black bug                    | `Link.tsx` `resolveHierarchy()` lines ~53–62 — no `case 'black'`; fallthrough returned `'color'`.                                                                                                                                  |
| SVG hardcoded color                    | `themes/code.org/styleOverrides/svgIcon.ts:6` sets `color: var(--text-neutral-primary)` globally on `MuiSvgIcon`.                                                                                                                  |
| Missing margin                         | `themes/code.org/styleOverrides/link.ts` never set `marginBottom`. Legacy `themes/csforall/styleOverrides/link.ts` does `marginBottom: theme.spacing(2)`.                                                                          |
| Always-uppercase / per-size typography | `themes/code.org/styleOverrides/link.ts` applied `font-size`, `line-height`, `text-transform` unconditionally to every link.                                                                                                       |
| EditorialCard uses DSCO Link           | `packages/component-library/src/cms/editorialCard/EditorialCard.tsx:6` imports `Link from '@/link'`. Also found `cms/iconHighlight/`, `cms/heroBanner/` → `Alert` chain.                                                           |
| RichText inline link                   | `apps/marketing/src/components/contentful/richText/RichText.tsx:77-85` passes only `removeMarginBottom`, `isLinkExternal: false`, `href` — so size defaults to `m`.                                                                |
| Button size parity                     | `packages/component-library/src/button/genericButton.module.scss` base rule `border: 1px solid transparent` vs Secondary's `border: 2px solid <color>` — outer box differed by 2px. Tertiary inherited the 1px base, same problem. |
| Icon-only icon sizing                  | `packages/component-library/src/button/genericButton.module.scss` — `.button-l.button-iconOnly` and `.button-xl.button-iconOnly` had no explicit `i` override; they relied on the parent size's 20px rule.                         |

## Implementation

### 1. Fix the `Black` mapping — `apps/marketing/src/components/contentful/link/Link.tsx`

In `resolveHierarchy()`, add the missing explicit case before the catch-all:

```ts
if (color === 'black') return 'black';
```

### 2. SVG inherits text color (and contrast-switches) — `apps/marketing/src/themes/code.org/styleOverrides/link.ts`

Add `& svg { color: inherit; }` to the root rule of the code.org `MuiLink` override. The SVG inherits the per-Hierarchy color set on the anchor, so `OpenInNew` follows whatever the link's resolved Hierarchy color is — including the contrast-switch flip on dark Sections, since the Hierarchy itself flips. The global `svgIcon.ts` is left tenant-neutral.

### 3. Restore default bottom margin — `apps/marketing/src/themes/code.org/styleOverrides/link.ts`

Add `marginBottom: theme.spacing(2)` (matching the legacy value) to the override's `root({theme})` return. `Link.tsx`'s existing `marginBottom: removeMarginBottom ? 0 : undefined` sx wins when the author opts out and otherwise defers to the theme default. No change to `Link.tsx` required for the opt-out itself.

### 4. Underline by default + `disableUnderline` opt-out

Brand Text Links underline natively (overriding Figma's no-underline default) with a per-instance Studio opt-out, ordered directly under `removeMarginBottom` in the Design tab.

**`apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts`** — `BASE_VARIABLES`:

```ts
disableUnderline: {
  displayName: 'Disable underline',
  description:
    'Brand Text Links are underlined by default. Enable to render without an underline.',
  type: 'Boolean',
  defaultValue: false,
  group: 'style',
},
```

**`apps/marketing/src/components/contentful/link/Link.tsx`**:

- Accept new optional `disableUnderline?: boolean` on `LinkProps`.
- Emit `data-disable-underline={disableUnderline ? 'true' : undefined}` on the Brand-tenant `<MuiLink>`. The csforall path conditionally removes the inner-`<span>`'s hardcoded `textDecoration: 'underline'` when `disableUnderline === true` (so the legacy path honors the same field).

**`apps/marketing/src/themes/code.org/styleOverrides/link.ts`** — uniform-underline model:

- Root rule: `text-decoration: underline; text-decoration-style: solid; text-decoration-thickness: from-font;`.
- Opt-out: `'&[data-disable-underline="true"]': { textDecoration: 'none' }`.
- Per-Hierarchy Hover preserves the `color`-Hierarchy text-color shift (`#4C42CF → #382EA5`); drops the previous "underline-on-hover" toggles for `black`/`white` since underline is already on.

### 5. EditorialCard slot — sweep across CMS card primitives

The component-library can't depend on `apps/marketing`, so every CMS card primitive that embeds the in-house DSCO `Link` gets an optional `LinkComponent?: React.ComponentType<LinkProps>` slot defaulting to the in-house Link. Direct callers (Storybook, in-package usage) stay byte-identical.

Inventory result (`grep -rln "from '@/link'" packages/component-library/src/cms/`):

- `packages/component-library/src/cms/editorialCard/EditorialCard.tsx`
- `packages/component-library/src/cms/iconHighlight/IconHighlight.tsx`
- `packages/component-library/src/cms/heroBanner/HeroBanner.tsx` (passes to inner `Alert`)
- `packages/component-library/src/alert/Alert.tsx` (transitive — used by HeroBanner)

Each accepts `LinkComponent` (HeroBanner forwards it to its inner Alert). Default = in-house Link.

A shared adapter at `apps/marketing/src/components/contentful/link/BrandLinkAdapter.tsx` translates the DSCO Link prop shape (`text` / `external` / `openInNewTab` / `target` / `aria-label`) to the Brand Link prop shape (`children` / `isLinkExternal` / `ariaLabel`). Each marketing-layer CMS card wrapper imports `BrandLinkAdapter` from `@/components/contentful/link` and passes `LinkComponent={BrandLinkAdapter}`.

### 6. Rich-text inline link inherits surrounding typography — explicit `inline` prop

**`apps/marketing/src/components/contentful/link/Link.tsx`**:

- Accept new optional `inline?: boolean` on `LinkProps`.
- When `true` on the Brand-tenant path, emit `data-inline="true"` on `<MuiLink>` and **don't set the `link--size-…` className** — skip the per-size typography hook entirely. Hierarchy color, underline-by-default, `disableUnderline`, and `isPending` all still apply.

**`apps/marketing/src/themes/code.org/styleOverrides/link.ts`**:

```ts
'&[data-inline="true"]': {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'none',
  marginBottom: 0,
},
```

**`apps/marketing/src/components/contentful/richText/RichText.tsx`** — at the `INLINES.HYPERLINK` case, pass `inline` alongside the existing props.

### 7. Equalize Primary / Secondary / Tertiary outer footprint — `packages/component-library/src/button/genericButton.module.scss`

Primary's filled background contributed no border to its outer box, while Secondary's `2px` outline did. In a dual-CTA row, the Secondary button rendered 2px taller and wider than its Primary sibling. The fix adds the same `2px` thickness to Primary (border color === background color, so visually invisible) and bumps the base transparent border to `2px` so Tertiary picks up the same outer footprint as well.

- Base rule: change `border: 1px solid transparent` → `border: 2px solid transparent`. Update the matching `&:active { border: …!important }` rule to `2px` so the active-state reset stays consistent.
- Each Primary cell (purple / black / white) adds `border-color: var(--button-color-…)` matching its `background-color` in all states — default, hover, loading, disabled. With `border-color` matching `background-color`, the border is visually invisible but contributes to the box-sizing-border-box outer dimensions.
- Secondary cells: unchanged — already `2px` with a visible color.
- Tertiary cells: unchanged source, but the base now provides the same `2px` transparent border so the hover-fill area matches Primary/Secondary.
- `box-sizing: border-box` was already in place, so changing the border thickness only affects the outer box — the per-size Figma padding values stay correct, and `outline`-based focus ring is unaffected.
- Destructive (legacy, segregated) is intentionally left alone per spec FR-026.

### 8. Icon-size precision per size + icon-only mode — `packages/component-library/src/button/genericButton.module.scss`

Brand Button icon sizing follows two rules:

- **With-text:** `s`/`m` icon = `13px`; `l`/`xl` icon = `20px`.
- **Icon-only:** **always `20px`** regardless of size class (`s`/`m`/`l`/`xl`).

The `.button-s` and `.button-m` rules already had an explicit `i { font-size: 20px; width: 20px; }` block under `&.button-iconOnly`. The `.button-l` and `.button-xl` rules were missing the explicit block and relied on inheriting the parent's `20px` — true today, fragile if the parent rule ever changes. Add the same explicit `i` block under `&.button-iconOnly` for `l` and `xl` so all four sizes follow the identical pattern.

## Verification

1. **Typecheck** — `yarn workspace @code-dot-org/component-library tsc --noEmit` and `yarn workspace @code-dot-org/marketing tsc --noEmit` both exit 0 (the 34 marketing errors that remain are all in pre-existing test files unrelated to this feature; verified by filtering `*.test.tsx`).
2. **Tests** — `yarn workspace @code-dot-org/component-library test` → 301 / 301 pass. `yarn workspace @code-dot-org/marketing test --testPathPattern "iconHighlight|editorial|link|richText|alert"` → 39 / 39 pass. The EditorialCard external-link test was updated to assert any `<svg>` (Brand Link uses MUI `OpenInNew` instead of the legacy FontAwesome external-link icon).
3. **Lint** — `yarn workspace @code-dot-org/component-library lint` and `yarn workspace @code-dot-org/marketing lint` both exit 0 (only pre-existing warnings in unrelated files).
4. **Prettier** — `yarn prettier --write` ran on every touched source file and on every spec doc in this feature folder.
5. **Storybook visual** — run `yarn workspace @code-dot-org/marketing-storybook storybook` and walk:
   - `color="black"` renders `#000000`, not purple.
   - `OpenInNew` external icon inherits the link's color (purple on Default; flips with the link on dark Sections).
   - Default link has bottom margin; `removeMarginBottom` removes it.
   - Default link is underlined; `disableUnderline` removes underline in all Hierarchies and all states.
6. **Editorial Card / IconHighlight / HeroBanner stories** — the embedded link picks up Brand Text Link visuals (Space Grotesk 700, per-Hierarchy color, underline, focus ring) via the `LinkComponent` slot.
7. **Rich-text inline link** — author a paragraph in Contentful Studio with an inline hyperlink. Confirm the link renders in the same font-family / font-size / line-height as the paragraph (no UPPERCASE, no 14px override), with underline + Hierarchy color preserved.
8. **CSforAll byte-identity** — walk csforall preview pages with Text Link entries; no visual diff against pre-feature baseline (csforall's `LegacyLinkContentfulComponentDefinition` keeps the full 22-color/4-size enum; the new `disableUnderline` field defaults to `false` so existing entries are unchanged).
9. **Button size parity** — open the Button story in design-system Storybook and place Primary + Secondary side-by-side at the same size class (e.g. both `m`). Confirm the two buttons render at identical outer heights and widths. Repeat for Primary + Tertiary, and across all four sizes (`s`/`m`/`l`/`xl`).
10. **Icon-size precision** — Storybook walk: with-text buttons at `s` and `m` render their icons at `13px`; with-text buttons at `l` and `xl` at `20px`; every icon-only button at every size renders at `20px`.

## What shipped — file inventory

**Brand Text Link core:**

- `apps/marketing/src/components/contentful/link/Link.tsx` — `resolveHierarchy('black') → 'black'`; new `disableUnderline` + `inline` props; `data-disable-underline` + `data-inline` attributes; csforall path honors `disableUnderline`.
- `apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts` — `disableUnderline` Boolean field added to `BASE_VARIABLES` after `removeMarginBottom`.
- `apps/marketing/src/components/contentful/link/BrandLinkAdapter.tsx` — **NEW**. Maps DSCO Link prop shape to Brand Link.
- `apps/marketing/src/components/contentful/link/index.ts` — re-export `BrandLinkAdapter`.
- `apps/marketing/src/themes/code.org/styleOverrides/link.ts` — restored `marginBottom`; added `& svg { color: inherit }`; underline-by-default; `data-disable-underline` opt-out; `data-inline` typography-inherit reset.
- `apps/marketing/src/components/contentful/richText/RichText.tsx` — pass `inline` at HYPERLINK case.

**Component-library CMS sweep (slot-prop pattern):**

- `packages/component-library/src/cms/editorialCard/EditorialCard.tsx`
- `packages/component-library/src/cms/iconHighlight/IconHighlight.tsx`
- `packages/component-library/src/alert/Alert.tsx`
- `packages/component-library/src/cms/heroBanner/HeroBanner.tsx`

**Marketing wrappers — wire the adapter:**

- `apps/marketing/src/components/contentful/editorialCard/EditorialCard.tsx`
- `apps/marketing/src/components/contentful/iconHighlight/IconHighlight.tsx`
- `apps/marketing/src/components/contentful/heroBanner/HeroBanner.tsx`

**Brand Button size parity:**

- `packages/component-library/src/button/genericButton.module.scss` — base border bumped to `2px solid transparent`; `:active` base reset matched; Primary cells (purple / black / white) all get explicit `border-color` matching `background-color` in every state.

**Brand Button icon-size precision:**

- `packages/component-library/src/button/genericButton.module.scss` — `.button-l.button-iconOnly` and `.button-xl.button-iconOnly` now declare the `20px` icon glyph explicitly (matches the `s` and `m` pattern).

**Test update:**

- `apps/marketing/src/components/contentful/editorialCard/__tests__/EditorialCard.test.tsx` — external-link icon assertion updated to match Brand Link's MUI `OpenInNew` SVG.

## Out of scope

- The csforall theme override and the legacy `resolveLegacyLinkColor` path are unchanged structurally — csforall still renders today's visuals.
- The in-house DSCO `Link`'s own SCSS module is not re-styled; the EditorialCard / IconHighlight / HeroBanner / Alert fixes route through the slot, not a re-skin of the underlying Link.
- The `OpenInNew` icon's color inheritance does **not** touch `svgIcon.ts`'s global default — only Link-scoped behavior changes.
- No Contentful Studio schema work was required (the `disableUnderline` field is a code-side ComponentDefinition variable, not a Contentful content-type field — same model as the original 008-brand-buttons spec).
