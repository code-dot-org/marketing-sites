# Amendment 2 — Default style values

**Date**: 2026-06-29
**Branch**: `010-custom-text`
**Status**: Implemented locally; awaiting commit + Applitools baseline acceptance. This is the second of the two planned commits — structural/functional work landed in the structure commit; this commit sets the per-type **default style values**.

Amendment 1 left the per-type defaults in `CUSTOM_TEXT_TYPE_DEFAULTS` as `TODO(design)` drafts. This commit replaces the drafted values for the types the design specified. Only the listed dimensions change; every other default is retained.

## Default changes

| Type              | Change                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Subtitle**      | Size `lg` → **`xl`**                                                                                                                                                               |
| **Overline**      | Size `xs` → **`md`**; case `uppercase` → **`capitalize`**                                                                                                                          |
| **Course Topics** | Weight `semibold` → **`medium`**; case `none` → **`capitalize`**; fill color `purpleLight` → **`white`**; border `purplePrimary` → **`black`**; padding **`0.25em 0.5em`**         |
| **Course Labs**   | Case `none` → **`capitalize`**; shape `pill` → **`roundedSquare`**; fill color `blueLight` → **`purpleLight`**; border `bluePrimary` → **`purpleMid`**; padding **`0.25em 0.5em`** |

Retained as-is: `custom` and `statistic` defaults; Course Topics' `span`/text/`sm`/`purpleDark`/filled/pill; Course Labs' `span`/text/`sm`/`semibold`/`blueDark`/filled.

## Supporting change — per-type chip padding

Chip padding was previously a single hardcoded value in `CustomText.tsx`. Course Topics and Course Labs need their own padding, so padding became a per-type default threaded through the resolver:

- `CustomTextDefault` gains an optional `padding?: string`.
- `ResolveCustomTextResult.background` now carries `padding`; the resolver emits `def.padding ?? DEFAULT_CHIP_PADDING` (`'0.25em 0.5em'`, used for any backgrounded type without its own padding — e.g. an author-triggered `custom` chip). Course Topics and Course Labs set the same `0.25em 0.5em` explicitly.
- `CustomText.tsx` dropped its hardcoded `padding` and spreads it from `background`.

## Files changed

| File                                                                                            | Change                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/marketing/src/components/contentful/customText/resolveCustomTextStyles.ts`                | Updated Subtitle/Overline/Course Topics/Course Labs defaults; added `padding` to `CustomTextDefault` + `DEFAULT_CHIP_PADDING`; `background.padding` in the result. |
| `apps/marketing/src/components/contentful/customText/CustomText.tsx`                            | Chip padding now sourced from `background` instead of a hardcoded value.                                                                                           |
| `apps/marketing/src/components/contentful/customText/__tests__/resolveCustomTextStyles.test.ts` | Updated Subtitle/Overline assertions; added Course Topics + Course Labs default-value tests; added `padding` to the filled-chip expectation (27 tests total).      |

## Verification

- `yarn jest src/components/contentful/customText` — 2 suites / **27 tests passing**.
- `yarn eslint src/components/contentful/customText` — clean.
- `yarn tsc --noEmit -p tsconfig.json` — no `customText` errors.
- `yarn prettier --write` — applied to touched files.

## Still draft / out of scope

- `statistic` (display/`lg`/bold/`purplePrimary`) and `custom` (text/`md`/regular/`black`) defaults remain the amendment-1 drafts — not specified by design in this pass; the `TODO(design)` note in the resolver is kept for them.
- Per-type **text-color inheritance**: the `color` field still defaults to `black` and does not inherit a type's default text color (the `Default (from type)` sentinel pattern used by background/border colors was not applied to `color` — see amendment-1 "Known follow-ups"). So Course Topics/Labs render black text unless the author picks a color. Unchanged here.
- Live Contentful content type still needs MCP confirmation + human apply.
