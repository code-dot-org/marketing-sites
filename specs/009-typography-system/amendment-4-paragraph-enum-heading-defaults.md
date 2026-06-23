# Amendment 4 — Paragraph enum consolidation + Heading defaults + 4-weight ladder

**Date**: 2026-06-23
**Branch**: `009-typography-system`
**Status**: Implemented locally; awaiting commit + Applitools baseline acceptance.

This amendment lands five changes after Phases 1–9 of the original spec 009 implementation. None of the original phases were reverted; this is incremental on top.

## The five changes

### 1. Paragraph `visualAppearance` enum narrowed to 8 Text cells

`apps/marketing/src/components/contentful/paragraph/ParagraphContentfulDefinition.ts` dropped the 4 legacy `body-*` entries from `validations.in`. Studio now offers only:

1. **`text-md` (default)** ← first in the dropdown, with `(default)` in the displayName
2. `text-4xl`
3. `text-3xl`
4. `text-2xl`
5. `text-xl`
6. `text-lg`
7. `text-sm`
8. `text-xs`

`defaultValue` changed from `'body-two'` to `'text-md'`. Existing Contentful entries with `visualAppearance` stored as `body-one|two|three|four` continue to render correctly: `resolveParagraphStyles.ts` already maps each to its `body{N}` MUI variant, which now resolves through the updated `ROLE_TOKENS` (Regular weight per change #3). Authors do not need to re-open or re-publish any existing entry. Studio will surface a validation warning on the field if an author opens an entry with `body-*` stored, but the rendered page is unaffected.

This matches the narrowing precedent set by spec 008 (Brand Text Link color enum 22 → 3): drop legacy values from `validations.in`, auto-map at render time, no `(deprecated)` labels.

### 2. `Text md (default)` indicator + ordering

The `text-md` enum entry sits at the top of the dropdown and its `displayName` reads `"Text md (default)"`. The `defaultValue` on the field is also `'text-md'` so newly placed Paragraph entries arrive with that value pre-selected.

### 3. Paragraph default weight: Regular (400), not Medium (500)

`ROLE_TOKENS` in `apps/marketing/src/themes/code.org/typography/tokens.ts`:

- `body1`, `body2`, `body3`, `body4` all changed `weight: 'regular'` (400).
- `PARAGRAPH_APPEARANCE_ROLES['text-4xl'|'text-3xl'|'text-2xl'|'text-xl']` all changed `weight: 'regular'`.

`isStrong = true` continues to emit `WEIGHTS.semibold` (600) per the existing `resolveParagraphStyles.ts` logic; no code change in the resolver.

### 4. Heading defaults stepped down one cell + Medium for H2–H6

`ROLE_TOKENS` updates:

| Level | Size (before) | Size (after) | Weight (before) | Weight (after) |
| ----- | ------------- | ------------ | --------------- | -------------- |
| H1    | Display 2xl   | Display xl   | Semibold        | Semibold       |
| H2    | Display xl    | Display lg   | Semibold        | Medium         |
| H3    | Display lg    | Display md   | Semibold        | Medium         |
| H4    | Display md    | Display sm   | Semibold        | Medium         |
| H5    | Display sm    | Display xs   | Semibold        | Medium         |
| H6    | Display xs    | Display xs   | Semibold        | Medium         |

Step ladders also shifted one cell. H1's new step table: `{md: 'xl', sm: 'lg', xs: 'md'}` (was `{md: '2xl', sm: 'xl', xs: 'lg'}`). H5 and H6 both render at Display xs — non-increasing hierarchy preserved (H5 == H6, both still ≥ body floor of 1rem). The `DISPLAY_APPEARANCE_ROLES` 6-of-8 cell aliases were re-pointed at the new role tokens (display-xl → ROLE_TOKENS.h1; display-lg → h2; etc.); `display-2xl` no longer matches any canonical heading and gets a freshly-authored role with its own step table.

### 5. Heading `fontWeight` Studio enum widened to 4 weights + `default` sentinel

`HeadingContentfulDefinition.ts` `fontWeight.validations.in` now lists:

```ts
[
  {value: 'default', displayName: 'Default (from level)'},
  {value: '400', displayName: 'Regular'},
  {value: '500', displayName: 'Medium'},
  {value: '600', displayName: 'Semibold'},
  {value: '700', displayName: 'Bold'},
];
```

`defaultValue` is `'default'`. Newly placed Heading entries inherit the level's canonical weight (H1 = Semibold; H2–H6 = Medium); only an explicit numeric pick overrides. This mirrors the `appearance` field's `'default'` sentinel pattern. Prior to this fix, the `fontWeight` field defaulted to `'500'`, so every new Heading entry silently shadowed the H1 canonical Semibold when authors switched the level to H1 — the override field was overriding even though the author hadn't touched it.

`resolveHeadingStyles.ts` was updated to treat `'default'` as a no-op: when `fontWeight === 'default'` (or omitted), no inline `sx.fontWeight` is emitted and the variant's per-level canonical weight flows through.

The React prop type now is `'default' | '400' | '500' | '600' | '700'` on both `Heading.tsx` (`HeadingProps.fontWeight`) and `resolveHeadingStyles.ts`.

To make the numeric weights render real (not synthesized) faces, `packages/fonts/src/fonts/space-grotesk.scss` gained two new `@include SpaceGrotesk.faces(...)` lines for weights 400 and 600. Geist needed no change — it ships as a variable font that already covers 100–900. The Space Grotesk additions add ~50–80 KB of new woff2 files to the bundle on both tenants; csforall doesn't render Space Grotesk so the new weights are wasted bytes for csforall but no visual change there.

## Two user-confirmed design decisions (locked during the planning session)

### Decision A — Visual Appearance is SIZE-ONLY

When an author picks a Display cell on the Heading "Visual Appearance" dropdown, the override only changes the size, line-height, letter-spacing, and per-breakpoint step lock. Weight + font-family inherit from the Heading Level's role token.

To get "h2 looks like H1" (same visual treatment as canonical H1 = Display xl Semibold) on an `<h2>` semantic tag, the author sets TWO controls:

1. Heading Level = "Heading 2"
2. Visual Appearance = "Display xl"
3. Override · Font weight = "Semibold"

This is a behavior change from the original spec 009 US3 design (which had Visual Appearance override the cell as a whole — size + weight). `resolveHeadingStyles.ts` was rewritten:

- `variantTag` always equals `semanticTag` (no more variant-binding lookup table).
- When `appearance !== 'default'`, emit inline `sx.fontSize` + `sx.lineHeight` + `sx.letterSpacing` from the chosen cell.
- ALSO emit matching values at the cell's step breakpoints so the variant's responsive ladder can't reclaim smaller sizes at narrow widths.
- Never emit `sx.fontWeight` from the appearance override — weight stays from the level's variant.

### Decision B — Alias all four `--font-size-body-*` (including body-xs)

`packages/component-library-styles/typography.module.scss` no longer declares separate numeric values for `--font-size-body-{xs,sm,md,lg}`. They alias to the Text scale:

```scss
--font-size-body-xs: var(
  --font-size-text-xs
); // 0.813rem → 0.75rem (intentional change)
--font-size-body-sm: var(--font-size-text-sm); // 0.875rem unchanged
--font-size-body-md: var(--font-size-text-md); // 1rem unchanged
--font-size-body-lg: var(--font-size-text-xl); // 1.25rem unchanged
```

The `body-xs` line shifts the resolved value from `0.813rem` (13px) to `0.75rem` (12px). One shared consumer (`packages/component-library/src/list/simpleList/simpleList.module.scss:114`) renders this on both tenants. The csforall SimpleList xs-size will visually shrink 1px. This is accepted as an intentional Applitools baseline change.

## Intentional visible deltas to expect when accepting baselines

When pushing this branch and walking the Applitools dashboard, expect these intentional diffs:

- **All code.org Heading defaults** look smaller: H1 = 60px (was 72px); H2 = 48px (was 60px); H3 = 36px (was 48px); etc.
- **All code.org Heading H2–H6 defaults** look thinner: Medium 500 (was Semibold 600). Only H1 stays Semibold.
- **All code.org Paragraph defaults** look thinner: Regular 400 (was Medium 500). `isStrong` still produces Semibold 600.
- **CSforAll SimpleList xs-size** shrinks 1px (13px → 12px) due to the body-xs alias. This is a csforall regression in the literal sense (byte-identity violated) but explicitly intentional. Any OTHER csforall diff is unexpected and must be investigated.
- **Heading `Override · Font weight` dropdown** in Studio shows 4 options (Regular, Medium, Semibold, Bold) instead of 2 (Medium, Bold).
- **Paragraph `Visual Appearance` dropdown** in Studio shows 8 options, all starting with `text-` and with `Text md (default)` first.

## Files changed

| File                                                                                         | Change                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/marketing/src/themes/code.org/typography/tokens.ts`                                    | ROLE_TOKENS H1–H6 ladder + weights; body1–body4 weight = regular; PARAGRAPH_APPEARANCE_ROLES weights = regular; DISPLAY_APPEARANCE_ROLES re-aliased to new role tokens. |
| `apps/marketing/src/components/contentful/heading/HeadingContentfulDefinition.ts`            | fontWeight enum 4 values; appearance field comment updated for size-only semantics.                                                                                     |
| `apps/marketing/src/components/contentful/heading/Heading.tsx`                               | fontWeight prop type widened to 4 values.                                                                                                                               |
| `apps/marketing/src/components/contentful/heading/resolveHeadingStyles.ts`                   | Rewritten size-only Visual Appearance branch; variantTag always = semanticTag; per-breakpoint cell locks.                                                               |
| `apps/marketing/src/components/contentful/paragraph/ParagraphContentfulDefinition.ts`        | visualAppearance enum narrowed to 8 text-\* options; defaultValue = 'text-md'; "Text md (default)" displayName.                                                         |
| `apps/marketing/src/components/contentful/paragraph/Paragraph.tsx`                           | Default prop value changed from 'body-two' to 'text-md'.                                                                                                                |
| `apps/marketing/src/components/contentful/paragraph/resolveParagraphStyles.ts`               | **No change** — legacy auto-map still handles `body-*` stored values; weight flows from variant.                                                                        |
| `packages/fonts/src/fonts/space-grotesk.scss`                                                | Added @include for weights 400 and 600 (Regular + Semibold).                                                                                                            |
| `packages/component-library-styles/typography.module.scss`                                   | Legacy `--font-size-body-*` block now aliases to `--font-size-text-*`.                                                                                                  |
| `apps/marketing-storybook/stories/Heading.story.tsx`                                         | fontWeight argType widened; DefaultsPerLevel labels updated; OrthogonalHeadingLevelVsAppearance shows the "h2 looks like H1 with 2 clicks" recipe.                      |
| `apps/marketing-storybook/stories/Paragraph.story.tsx`                                       | Playground argType narrowed to 8 text-\* values; default arg changed; DefaultsByVariant + LegacyStoredValuesStillRender updated.                                        |
| `apps/marketing/src/themes/code.org/typography/__tests__/buildTypography.test.ts`            | H1 size 4.5 → 3.75; H1 step values; H2 weight + size assertions; body2 weight 500 → 400; ROLE_TOKENS sanity.                                                            |
| `apps/marketing/src/themes/code.org/typography/__tests__/buildTypography.responsive.test.ts` | ROLE_TOKENS sanity for H1 new ladder + H2–H6 Medium + H6 step floor + body2 Regular.                                                                                    |
| `apps/marketing/src/components/contentful/heading/__tests__/resolveHeadingStyles.test.ts`    | Rewritten for the variantTag-always-equals-semanticTag rule; new size-only cell tests; "h2 looks like H1" requires 2 controls.                                          |

## Verification

- `yarn workspace @code-dot-org/marketing jest` — **821 / 821 passing** across 121 suites.
- `yarn workspace @code-dot-org/marketing lint` — clean (2 pre-existing warnings in `AdoptionMap.test.tsx` unrelated to this work).
- `yarn prettier --check` on touched files — clean.
- `npx tsc --noEmit -p tsconfig.json` from `apps/marketing/` — no new errors (only the pre-existing `Paragraph.test.tsx:8` strictness error from the spec 009 base, which this amendment does not modify).
- `git diff apps/marketing/src/themes/csforall/` and `apps/marketing/src/themes/common/` — empty. CSforAll theme byte-identical.

## Still awaiting user

- Manual dev-server walk (Heading defaults visually thinner; Paragraph default Regular; Studio dropdowns updated).
- DevTools Network tab check for SpaceGrotesk-Regular + SpaceGrotesk-SemiBold woff2 files (real faces, not synthesized).
- Applitools baseline acceptance — accept code.org Heading + Paragraph diffs; investigate any csforall diff outside the documented SimpleList xs 1px shrink.
- PR push + commit per `[[feedback_no_push_without_approval]]`.

## Out of scope (deferred)

- Heading `fontWeight` field is now widened to 4 weights but the rest of the deprecated-component cleanup (per spec 009 US2) was completed in Phase 5 of the original implementation. No additional deprecated-component changes here.
- The PARAGRAPH_APPEARANCE_ROLES weight shift to Regular applies to the 4 new larger Text cells (`text-4xl`, `text-3xl`, `text-2xl`, `text-xl`). If a future amendment wants distinct weight defaults per cell, that's a separate change.
- The `--font-size-body-xs` consumer in `simpleList.module.scss:114` could be migrated to consume `--font-size-text-xs` directly so the legacy var becomes pure-alias and removable in a follow-up. Not in scope here.
