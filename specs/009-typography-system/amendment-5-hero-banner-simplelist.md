# Amendment 5 — Hero Banner H1 + SimpleList Text scale

**Date**: 2026-06-23
**Branch**: `009-typography-system`
**Status**: Implemented locally; awaiting commit + Applitools baseline acceptance.

After amendments 1–4 shipped locally, the user noticed two components still on legacy typography: the deprecated Hero Banner's `<h1>` title was rendering through the old `.heading-xxl` SCSS class (Space Grotesk Medium with a `clamp()` size, line-height 1) instead of the new `theme.typography.h1` token (Display xl Semibold); and SimpleList only exposed 4 size options when authors wanted the full 8-cell Text scale that Paragraph now offers.

## The two changes

### 1. Hero Banner — `<Heading1>` → `<Typography component="h1" variant="h1">`

`packages/component-library/src/cms/heroBanner/HeroBanner.tsx:131` swapped the rendered heading from the custom DSCO `<Heading1>` primitive (which applies the legacy `.heading-xxl` SCSS class) to MUI's `<Typography component="h1" variant="h1">`. Now both tenants render their hero banner through their own `theme.typography.h1`:

- **code.org** → Display xl Semibold per amendment-4's role token (3.75rem / 4.5rem line-height / -0.02em letter-spacing, with the responsive ladder down to Display lg at tablet / Display md at mobile).
- **csforall** → Geist 5rem weight 800 per its existing static theme (`apps/marketing/src/themes/csforall/index.ts:45-50`).

The existing optical-alignment margin tweak in `packages/component-library/src/cms/heroBanner/heroBanner.module.scss:81-83` targets the `h1` element directly (not the `.heading-xxl` class), so it survives the JSX swap unchanged.

The `Heading1` import was dropped from this file; `BodyOneText` and `BodyTwoText` (used by subHeading/description) stay as-is. The legacy `.heading-xxl` CSS class is **not** removed — other consumers of `<Heading1>` across the design system continue to use it. A follow-up could migrate every `<Heading1>` consumer the same way and eventually delete both the primitive and the class.

### 2. SimpleList — widened to the 8-cell Text scale

The Contentful Studio dropdown for SimpleList's `size` field is widened from 4 legacy values (`xs`/`s`/`m`/`l`, from the shared `componentSizeXSToLDefinition`) to 8 Text cells (`text-xs` through `text-4xl`), with `text-md (default)` first. The shared `componentSizeXSToLDefinition` is left untouched because Spacer still uses it.

**Files changed**:

- `apps/marketing/src/components/contentful/simpleList/SimpleListContentfulDefinition.ts` — replaced the `size: componentSizeXSToLDefinition` reference with an inline 8-option enum (default `text-md`, "Text md (default)" label first).
- `apps/marketing/src/components/contentful/simpleList/SimpleList.tsx` — accepts the widened `SimpleListSize` prop. Legacy stored values (`xs`/`s`/`m`/`l`) auto-map at render time to `text-xs`/`text-sm`/`text-md`/`text-lg` via `resolveSize()`, so existing entries continue to render byte-identically (the underlying `--font-size-text-*` cells equal the old `--font-size-body-*` values per amendment-4's aliasing).
- `packages/component-library/src/common/types/index.ts` — new `TextScaleSize` exported type (`'text-xs' | … | 'text-4xl'`).
- `packages/component-library/src/common/constants/index.ts` — new `textScaleSizeToBodyTextSizeMap` mapping each Text cell to the DSCO Typography `visualAppearance` value for the rendered label. Larger cells (`text-xl` through `text-4xl`) all map to `body-one`; their actual font-size is overridden by the SCSS class.
- `packages/component-library/src/list/simpleList/SimpleList.tsx` — `size` prop type widened to `SimpleListSize = ComponentSizeXSToL | TextScaleSize`. Default prop value changed from `'m'` to `'text-md'`. Picks the right map (`componentSizeToBodyTextSizeMap` for legacy values, `textScaleSizeToBodyTextSizeMap` for new ones) via a small `isTextScaleSize` type guard.
- `packages/component-library/src/list/simpleList/simpleList.module.scss` — added 8 new `.simpleList-size-text-*` classes covering all Text cells. Each new class sets `font-size: var(--font-size-text-*)` on the label (overriding whatever the DSCO Typography emits) and `icon-dimensions(var(--font-size-text-*))` on the icon. The legacy 4 classes (`.simpleList-size-{l,m,s,xs}`) are preserved for any in-code consumer that still passes legacy size values directly.
- `packages/component-library/src/list/simpleList/index.ts` + `packages/component-library/src/list/index.ts` — barrel exports for the new `SimpleListSize` type.
- `packages/component-library/src/list/simpleList/stories/SimpleList.story.tsx` — added a `TextScaleSizes` story exercising `text-xs`/`text-md`/`text-xl`/`text-3xl` cells.

## User-confirmed decisions

### A — Accept the csforall hero banner visual shift

The swap to `<Typography component="h1" variant="h1">` makes the shared DSCO Hero Banner render via each tenant's own `theme.typography.h1`. csforall's hero banner shifts from today's `.heading-xxl` clamp (Space Grotesk Medium, ~2.5rem at narrow widths to 4rem at wide) to csforall's own `theme.typography.h1` (Geist 5rem weight 800).

This is the second documented intentional csforall Applitools baseline change after amendment-4's SimpleList xs 1px shrink. CSforAll's `theme.typography.h1` is the correct per-tenant H1 contract; routing through it is the documented multi-tenant pattern (`[[next_static_public_immutable_cache]]` policy doesn't apply — this is a CSS class change, not a static asset rewrite).

### B — Text Link is out of scope

Per Figma, the Brand Text Link's 3 sizes (`s`/`m`/`l`) have opinionated per-size uppercase rules (`s` non-uppercase 14px; `m` uppercase 14px; `l` uppercase 16px) and shouldn't be widened to 8 cells without breaking the design contract. Brand Text Link is left as-is in this amendment.

## Intentional visible deltas to expect

When pushing this branch and accepting Applitools baselines, expect these:

- **code.org Hero Banner** — H1 visibly smaller (60px @ desktop, was clamped to 64px+); Semibold (was Medium). New letter-spacing -0.02em. Responsive ladder per amendment-4 (Display lg @ tablet, Display md @ mobile).
- **csforall Hero Banner** — H1 visibly different (5rem Geist 800wt instead of clamp() Space Grotesk Medium). Documented as intentional; do NOT investigate this as a regression.
- **SimpleList default appearance** — UNCHANGED. Default is now `text-md` which resolves to identical CSS values as the legacy `m` size (1rem font-size, 8px gap, 12px bullet icon).
- **SimpleList Studio dropdown** — was 4 entries (XS/S/M/L). Now 8 entries with "Text md (default)" first and "Text 4xl" through "Text xs" following. Existing entries with `m`/`l`/`s`/`xs` stored values still render correctly via the marketing wrapper's auto-map (Studio shows a validation warning if an author opens such an entry, but the field continues to render).

## Verification

- `yarn workspace @code-dot-org/marketing jest` — 121 suites / **822 tests passing** (zero net delta vs amendment-4).
- `yarn workspace @code-dot-org/component-library test` — 50 suites / **301 tests passing**. The existing SimpleList Storybook tests for `xs/s/m/l` continue to pass because the legacy SCSS classes are preserved.
- `npx tsc --noEmit -p tsconfig.json` from `apps/marketing/` and `packages/component-library/` — no new errors. Two pre-existing errors in `SimpleList.test.tsx` test fixtures (unrelated entry-type shape issues from before this amendment) remain untouched.
- `yarn lint` clean (2 pre-existing warnings in `AdoptionMap.test.tsx` + 3 in component-library stories — all unrelated to this work).
- `yarn prettier --check` clean on all touched files.
- `git diff apps/marketing/src/themes/csforall/` and `apps/marketing/src/themes/common/` — empty. CSforAll theme byte-identical at the theme layer; the intentional csforall visual change is via the shared `packages/component-library/src/cms/heroBanner/HeroBanner.tsx` JSX swap and the csforall theme's own existing `theme.typography.h1` definition (untouched).

## Files changed

| File                                                                                    | Change                                                                                                                                  |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/component-library/src/cms/heroBanner/HeroBanner.tsx`                          | `<Heading1>` → `<Typography component="h1" variant="h1">`; updated imports.                                                             |
| `packages/component-library/src/common/types/index.ts`                                  | New `TextScaleSize` type export.                                                                                                        |
| `packages/component-library/src/common/constants/index.ts`                              | New `textScaleSizeToBodyTextSizeMap` constant.                                                                                          |
| `packages/component-library/src/list/simpleList/SimpleList.tsx`                         | `size` prop type widened; default changed to `'text-md'`; new `isTextScaleSize` guard + branched visualAppearance lookup.               |
| `packages/component-library/src/list/simpleList/simpleList.module.scss`                 | Added 8 `.simpleList-size-text-*` SCSS classes consuming `--font-size-text-*` CSS variables; legacy 4 classes preserved.                |
| `packages/component-library/src/list/simpleList/index.ts` + `list/index.ts`             | Barrel exports for `SimpleListSize`.                                                                                                    |
| `packages/component-library/src/list/simpleList/stories/SimpleList.story.tsx`           | New `TextScaleSizes` story.                                                                                                             |
| `apps/marketing/src/components/contentful/simpleList/SimpleListContentfulDefinition.ts` | Inline `size` field with 8 enum values; `text-md (default)` first; default `'text-md'`.                                                 |
| `apps/marketing/src/components/contentful/simpleList/SimpleList.tsx`                    | Imports widened type; `resolveSize()` auto-maps legacy `xs`/`s`/`m`/`l` → `text-xs`/`sm`/`md`/`lg`; default falls through to `text-md`. |

## Still awaiting user

- Local dev-server smoke check (Hero Banner H1 visibly Display xl Semibold on code.org; SimpleList dropdown shows 8 text-\* options with "Text md (default)" first; existing legacy SimpleList entries continue to render).
- Applitools baselines — accept the code.org Hero Banner H1 visual shift and the csforall Hero Banner H1 shift (Geist 5rem 800wt) as the second documented intentional csforall delta.
- Push + commit per `[[feedback_no_push_without_approval]]`.

## Out of scope (deferred)

- Brand Text Link size widening — Figma-locked per user; not in scope.
- Legacy `<Heading1>` DSCO primitive cleanup — still exists for non-HeroBanner consumers; could be migrated and the `.heading-xxl` SCSS class deleted in a follow-up.
- Removing the legacy `--font-size-body-*` aliases — still used by SimpleList's legacy SCSS classes (preserved for back-compat); cleanup would require migrating those legacy classes to text-\* equivalents and dropping the aliases.
