# Phase 1 Data Model: Brand Color System Initialization

**Feature**: 006-brand-color-system-init
**Date**: 2026-06-17

This feature does not introduce a runtime persistence layer or a new Contentful content type. The "data" in scope is the manifest of brand-color tokens consumed by application code, the SCSS variables they reference, and the small derived state used by the contrast switch.

**Tenant scope**: the data model below applies to the code.org tenant. Under the soft-isolation decision (`research.md` Decision 10), csforall content authors will see the new `BrandColorToken` entries in their Studio dropdowns and csforall pages will load the new CSS variables in the shared SCSS layer; however, no csforall content uses these tokens, no csforall component references the new variables, and `Section.tsx` does not emit the new `data-bg-tone` attribute on csforall background values. The rule table below describes code.org behavior; csforall renders unchanged.

## Entities

### BrandColorToken

The canonical record in the `BRAND_COLORS` manifest.

| Field         | Type                                                                        | Source                 | Notes                                                                                                                                                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`       | `string` (stable kebab- or camelCase key)                                   | Manifest               | Used as the Contentful dropdown value and the TypeScript prop value. Existing entries (e.g. `purple`, `darkPurple1`) preserved verbatim. New entries follow `{family}{Shade}` (e.g. `purpleDark`, `purplePrimary`, `purpleMid`, `purpleLight`) plus `black` and `white`. |
| `displayName` | `string`                                                                    | Manifest               | Author-facing label rendered in the Contentful dropdown (e.g. `"Purple Dark"`).                                                                                                                                                                                          |
| `cssVar`      | `string`                                                                    | Manifest               | A `var(--codeai-...)` reference, or a literal where appropriate (`"white"`, `"#000000"`).                                                                                                                                                                                |
| `family`      | `'purple' \| 'blue' \| 'green' \| 'orange' \| 'pink' \| 'black' \| 'white'` | Manifest (new)         | Drives the contrast switch's family-aware shifting. Black and White are their own families and never shift to a different family.                                                                                                                                        |
| `shade`       | `'dark' \| 'primary' \| 'mid' \| 'light' \| 'n-a'`                          | Manifest (new)         | Drives both the switch's "do I switch" check (light shades on light backgrounds) and the target shade ("shift to family `*-dark` or `*-primary`"). Black and White carry `n-a`.                                                                                          |
| `hex`         | `string` (informational, not stored on the token; lives in SCSS)            | `primitiveColors.scss` | Hex value owned by the SCSS primitive layer; never duplicated in TypeScript.                                                                                                                                                                                             |

**Validation rules**:

- `value` is unique across the manifest.
- `cssVar` of a family token references the same `--codeai-{family}-{shade}` variable the SCSS layer defines.
- For every family token with `shade in {dark, primary, mid, light}`, the corresponding `--codeai-{family}-{shade}` CSS variable exists in `primitiveColors.scss` (or the file co-located with the existing `--codeai-*` primitives).
- Tokens consumed by Contentful dropdowns appear in `BRAND_COLOR_OPTIONS` exactly once.
- Legacy fallback keys (`LEGACY_ICON_COLORS = ['secondary', 'brand']`, `LEGACY_PARAGRAPH_COLORS = ['secondary']`) remain present and unchanged; new tokens do not collide with their values.

**State transitions**: None. The manifest is read-only at runtime.

### Manifest Inventory (final shape after this feature)

The full set after this feature ships. Existing entries are preserved; new entries are appended (or interleaved logically — final ordering is at the discretion of the implementation, with the only constraint that Contentful-dropdown order in `BRAND_COLOR_OPTIONS` MUST be deliberate and stable).

| `value`         | `displayName`  | `family` | `shade` | Hex (from SCSS)                                    |
| --------------- | -------------- | -------- | ------- | -------------------------------------------------- |
| `primary`       | Primary        | black    | n-a     | (semantic — resolves via `--text-neutral-primary`) |
| `white`         | White          | white    | n-a     | `#FFFFFF`                                          |
| `black`         | Black          | black    | n-a     | `#000000`                                          |
| `purpleDark`    | Purple Dark    | purple   | dark    | `#1F1976`                                          |
| `purplePrimary` | Purple Primary | purple   | primary | `#4C42CF`                                          |
| `purpleMid`     | Purple Mid     | purple   | mid     | `#ACA8EA`                                          |
| `purpleLight`   | Purple Light   | purple   | light   | `#E4E2F8`                                          |
| `blueDark`      | Blue Dark      | blue     | dark    | `#06338D`                                          |
| `bluePrimary`   | Blue Primary   | blue     | primary | `#0099F3`                                          |
| `blueMid`       | Blue Mid       | blue     | mid     | `#6FCAFF`                                          |
| `blueLight`     | Blue Light     | blue     | light   | `#D5EFFF`                                          |
| `greenDark`     | Green Dark     | green    | dark    | `#003F25`                                          |
| `greenPrimary`  | Green Primary  | green    | primary | `#34BD43`                                          |
| `greenMid`      | Green Mid      | green    | mid     | `#7CDB87`                                          |
| `greenLight`    | Green Light    | green    | light   | `#CCF1D0`                                          |
| `orangeDark`    | Orange Dark    | orange   | dark    | `#510000`                                          |
| `orangePrimary` | Orange Primary | orange   | primary | `#F46800`                                          |
| `orangeMid`     | Orange Mid     | orange   | mid     | `#FFA868`                                          |
| `orangeLight`   | Orange Light   | orange   | light   | `#FFE3CE`                                          |
| `pinkDark`      | Pink Dark      | pink     | dark    | `#921149`                                          |
| `pinkPrimary`   | Pink Primary   | pink     | primary | `#E62378`                                          |
| `pinkMid`       | Pink Mid       | pink     | mid     | `#F07FB0`                                          |
| `pinkLight`     | Pink Light     | pink     | light   | `#FBDAE8`                                          |

**Legacy retained**: `purple` (existing alias `#6a62d9`), `darkPurple1` (`#4c42cf`), `darkPurple2` (`#1f1976`), `lightGreen3` (`#ccf1d0`). These remain as legacy aliases; new entries (`purplePrimary`, `purpleDark`, `greenLight`) reference the same SCSS primitives. No content migration is required.

Total post-feature unique tokens listed in `BRAND_COLOR_OPTIONS`: 23 new options (`black` is added; `white` and `primary` already exist) + 4 legacy aliases that may be hidden from the Contentful dropdown via a separate "legacy" array if desired. The author-facing dropdown surfaces the 22 brand options per the spec.

### BackgroundContext

The derived state used by the contrast switch.

| Field    | Type                                              | Source                                                            | Notes                                                                                                                                                                                  |
| -------- | ------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`   | `'dark' \| 'light' \| 'mid'`                      | Derived from the resolved background token's `shade` and `family` | `dark` = `{*-dark, *-primary, black}`; `light` = `*-light`; `mid` = `{*-mid, white}`                                                                                                   |
| `family` | `BrandColorToken['family']`                       | Resolved background token's `family`                              | Used only when the switch needs to know the background's hue, e.g. for visual debug; the rule table does NOT key on background `family` (text family is what drives the target shade). |
| `source` | `'section' \| 'container' \| 'page-root-default'` | Where the background was resolved from                            | Diagnostic only; the cascade resolves automatically. `'page-root-default'` means "no enclosing background found" and is treated as `tone='mid'`, `family='white'`.                     |

**State transitions**: Recomputed per `Section`/`Container` boundary. The cascade re-resolves on every nested boundary that sets a `data-bg-*` attribute.

### ContrastSwitchRule

The pure-function relationship between (text token, background context) and the rendered token.

```text
Inputs:  textToken: BrandColorToken, background: BackgroundContext
Output:  renderedToken: BrandColorToken
```

The rule table (matches spec FR-007 through FR-013):

| Background `tone` | Text category                   | Rendered                                                                  |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `dark`            | `{black, *-dark, *-primary}`    | `white`                                                                   |
| `dark`            | `{white, *-mid, *-light}`       | passthrough (text unchanged)                                              |
| `light`           | `{black, *-dark, *-primary}`    | passthrough                                                               |
| `light`           | `white`                         | `black`                                                                   |
| `light`           | `{*-light, *-mid}` (any family) | text's own family at shade `dark` (e.g. `purpleMid` → `purpleDark`)       |
| `mid`             | `{black, *-dark, *-primary}`    | passthrough                                                               |
| `mid`             | `white`                         | `black`                                                                   |
| `mid`             | `{*-light, *-mid}` (any family) | text's own family at shade `primary` (e.g. `purpleMid` → `purplePrimary`) |

**Validation rules**:

- Every row of the table is covered by at least one Jest test case.
- Every row is covered by at least one Storybook story.
- `colorOverride` (when set) short-circuits the rule entirely — the override hex is rendered as-is regardless of background.
- Rich Text body text resolves through this rule as if its authored color were `black`, producing `passthrough` on light backgrounds and `white` on dark backgrounds (consistent with the constitution's Rich Text expectation).

**State transitions**: None. The function is pure.

## Cross-entity Relationships

- `BrandColorToken.family` and `BrandColorToken.shade` together act as the foreign key into the `ContrastSwitchRule` table.
- `BackgroundContext.tone` is derived purely from the background `BrandColorToken`'s `shade` (and the family-vs-`black`/`white` distinction).
- `colorOverride` (a hex string field on Heading and Paragraph) is orthogonal to the manifest — it short-circuits the resolver and bypasses the rule entirely.

## Out of Scope (not modeled in this feature)

- **Per-locale label translation** of `displayName` — the dropdown labels are English-only for this pass.
- **Contentful-side validation list** — none; the `BRAND_COLOR_OPTIONS` array in code is the source of truth.
- **WCAG AA contrast certification** — assumed; a separate audit is logged as future work.
- **Color picker UI in Rich Text** — explicitly excluded.
- **Override coverage on Text Link, Simple List, Section** — deferred.
