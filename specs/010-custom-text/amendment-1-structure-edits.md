# Amendment 1 — Structure & functionality edits (pre-default-styles)

**Date**: 2026-06-29
**Branch**: `010-custom-text`
**Status**: Implemented locally; awaiting commit + Applitools baseline acceptance. This is the first of two planned commits — structural/functional adjustments here; per-type **default style values** follow in a separate commit.

After the initial implementation landed locally (resolver + component + Contentful definition + tests + Storybook), the user reviewed it and requested three structural changes before we start tuning the default styles. None of these change the spec's user stories or requirements; they refine the override surface and the background mechanism.

## The three changes

### 1. Default line-height — 1 for span types, per-size for Subtitle

Every type except Subtitle renders as `<span>` and is a small, single-line, few-word element that does not need line-height above 1. Subtitle is the only `<p>`-based type and keeps the size cell's default line-height.

- `resolveCustomTextStyles.ts` — `CustomTextDefault` gains an optional `lineHeight?: number`. All span types set `lineHeight: 1`; Subtitle leaves it unset. The resolver emits `lineHeight: def.lineHeight ?? cell.lineHeight`.
- Behavior: `custom`/`overline`/`statistic`/`courseTopics`/`courseLabs` → line-height `1`; `subtitle` → the `SCALE_TEXT.lg` cell line-height.

### 2. HTML tag override — `<p>`/`<span>` only, last in the Design tab

- Options reduced to `Default (from type)`, `<span>`, `<p>` — `<div>` and `<label>` removed. `CustomTextTag` narrowed to `'span' | 'p'`.
- The `htmlTag` field is now the **last** entry in the Contentful definition's `variables` (so it sorts last among `style`-group fields in the Studio Design tab).
- Tests and the Storybook "Overrides" story updated to use `<span>`/`<p>` instead of `<div>`.

### 3. Background fill + shape (Icon-parity); fill is the trigger

Previously a background rendered whenever a background **color** was set. That trigger moves to an explicit **Background fill** selection, matching the Icon component.

- New `backgroundFill` field: `Default (from type)`, `None`, `Filled`, `Outline`.
- New `backgroundShape` field: `Default (from type)`, `Pill`, `Rounded Square`.
- `backgroundColor` is now the fill color (used only when fill is `Filled`); its `'none'` sentinel was removed and replaced with a `Default (from type)` sentinel so a type's default fill color flows through.
- Border width is **1px** for every backgrounded style, refining the spec's original fixed 2px (FR-008). Any time a background fill is selected — `Filled` or `Outline`, any type — the default border is 1px. It remains non-author-controllable (no width field). `CUSTOM_TEXT_BORDER_WIDTH = '1px'`.
- Resolver:
  - `hasBackground = backgroundFill !== 'none'` (was: `backgroundColor` present).
  - `Filled` → fill color + 1px border + shape radius. `Outline` → transparent interior + 1px border + shape radius (border-only). `None` → no wrapper.
  - Shape → border radius: `Pill` = `999px`, `Rounded Square` = `0.25rem`. `ResolveCustomTextResult.background` now carries `borderRadius` (was hardcoded in the component).
  - Contrast switch still fires only when fill is `None` — **`Outline` also bypasses the switch**, matching Icon's rule (`backgroundFill === 'none' ? switch : direct`). Noted because an outline chip's interior is the Section background, yet the author-chosen color is applied directly for Icon parity.
- Type defaults: `courseTopics`/`courseLabs` default to `Filled` + `Pill`; all other types default to `None`.

### 4. Vertical alignment — kill the inherited inline strut

When a default or override text size is smaller than the root 16px, the text was floating with extra space above it and the background shape was taller than the glyph. The cause is the CSS inline **strut / half-leading**: an inline element's line-box height is governed by the font metrics of the element that establishes the line box (the surrounding container at root 16px), not by the smaller text — so `line-height: 1` on the text alone can't shrink it. The plain (non-backgrounded) text sits in a Contentful `<div>` (root 16px strut); the chip wrapper was `inline-block` and inherited the 16px line-height, so its internal line box reserved 16px regardless of the text size.

Custom Text is always a standalone element, so both cases are fixed structurally:

- **Plain text** renders **block-level** (`display: block` on the Typography). A block establishes its own line box at the text's size, so the surrounding container hugs the text — no parent strut. Contentful's `cfTextAlign` still positions the text within the block.
- **Chips** wrap in `display: inline-flex; align-items: center; line-height: 1`. A flex container sizes its cross-axis to the actual text line box, so padding + 1px border + shape hug the real glyph height with no phantom top space. The wrapper's `font-size` is pinned to the resolved text size so the `em`-based padding tracks the text rather than the inherited 16px.

## Files changed

| File                                                                                            | Change                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/marketing/src/components/contentful/customText/resolveCustomTextStyles.ts`                | Added `lineHeight` to defaults; narrowed `CustomTextTag` to `span`/`p`; added `CustomTextBackgroundFill`/`CustomTextBackgroundShape`; fill-driven background trigger; shape→radius map; `background.borderRadius` in the result; `CUSTOM_TEXT_BORDER_WIDTH` set to `1px`.                                         |
| `apps/marketing/src/components/contentful/customText/CustomText.tsx`                            | New `backgroundFill`/`backgroundShape` props; `htmlTag` typed `span`/`p`; border radius now sourced from the resolver's `background`; plain text rendered block-level; chip wrapper switched to `inline-flex`/center/`line-height:1` with `font-size` pinned to the text size (kills the inherited inline strut). |
| `apps/marketing/src/components/contentful/customText/CustomTextContentfulDefinition.ts`         | `htmlTag` moved last + reduced to span/p; added `backgroundFill`/`backgroundShape`; `backgroundColor`/`borderColor` use a `Default (from type)` sentinel.                                                                                                                                                         |
| `apps/marketing/src/components/contentful/customText/__tests__/resolveCustomTextStyles.test.ts` | New line-height test; htmlTag test uses `span`; background tests driven by `backgroundFill`; added outline + radius assertions (25 tests total).                                                                                                                                                                  |
| `apps/marketing/src/components/contentful/customText/__tests__/CustomText.test.tsx`             | htmlTag override test uses `<p>`.                                                                                                                                                                                                                                                                                 |
| `apps/marketing-storybook/stories/CustomText.story.tsx`                                         | argTypes for fill/shape, span/p tag, sentinel colors; Chips story shows filled-pill + outline-rounded-square.                                                                                                                                                                                                     |

## Verification

- `yarn jest src/components/contentful/customText` — 2 suites / **25 tests passing**.
- `yarn eslint src/components/contentful/customText` — clean.
- `yarn tsc --noEmit -p tsconfig.json` — no `customText` errors (pre-existing unrelated test-fixture errors elsewhere untouched).
- `yarn prettier --write` — applied to all touched files.

## Known follow-ups for the default-styles commit

- **Per-type text-color inheritance**: the `color` (text color) field still defaults to `black` (relabeled "Default" by `brandTextColorOptions`), so it does not yet inherit a type's default text color the way `backgroundColor`/`borderColor` now do via the `Default (from type)` sentinel. Chips currently render the field's color, not the type default `purpleDark`/`blueDark`, unless the author leaves a sentinel. Decide in the default-styles commit whether `color` should also gain a `Default (from type)` sentinel.
- **Draft default values** (`CUSTOM_TEXT_TYPE_DEFAULTS`): chip fills/borders, Statistic display size, and the chip padding/radius remain `TODO(design)` drafts (research.md R7/O3) — to be finalized in the default-styles commit against Figma.

## Out of scope (deferred)

- Updating the per-type default style values (commit 2).
- The contracts in `contracts/` were written against the pre-amendment field set; they remain accurate for the resolver shape but predate the fill/shape fields. They'll be reconciled if needed when default styles land.
