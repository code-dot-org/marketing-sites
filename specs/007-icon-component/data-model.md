# Data Model: Icon Component

**Feature**: 007-icon-component
**Date**: 2026-06-18

The Icon feature introduces one new Contentful content type and one corresponding React component prop shape. No new application-side persisted entities are introduced. There is no state machine (the component is stateless).

---

## Entity: `Icon` (Contentful content type — NEW)

A single Contentful entry that renders a Font Awesome icon, optionally decorated with a colored background shape.

### Fields

| Field name        | Contentful type | Required | Default         | Validation                                                       | Description                                                                                                                                                                   |
| ----------------- | --------------- | -------- | --------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iconName`        | `Symbol` (Text) | Yes      | `lightbulb`     | none (free-form FA name)                                         | Font Awesome v6 icon name (e.g. `lightbulb`, `github`, `arrow-right`).                                                                                                        |
| `color`           | `Symbol` (Text) | No       | `purplePrimary` | `in`: 22 universal CodeAI brand-color values (no legacy options) | Icon glyph color, drawn from the shared `BRAND_COLORS` manifest.                                                                                                              |
| `backgroundFill`  | `Symbol` (Text) | No       | `none`          | `in`: `[none, filled, outline]`                                  | Whether the icon has no shape, a solid background shape, or an outlined shape.                                                                                                |
| `backgroundShape` | `Symbol` (Text) | No       | `circle`        | `in`: `[circle, square]`                                         | Shape of the background or outline. `square` renders with rounded corners. Ignored when `backgroundFill = none`.                                                              |
| `backgroundColor` | `Symbol` (Text) | No       | `#f6f6f6`       | `in`: `[#f6f6f6]` + 22 universal CodeAI brand-color values       | Color of the filled background or the outline stroke. The default is the Icon-local Light Grey; this hex is NOT in the shared manifest. Ignored when `backgroundFill = none`. |
| `iconSize`        | `Integer`       | No       | `32`            | none (any positive integer; no clamp)                            | Icon glyph size in CSS pixels.                                                                                                                                                |

### Relationships

The Icon has no Contentful relationships (no reference fields). It is consumed as a leaf within Sections / Containers, but it does not reference other entries.

### Validation rules (derived from spec)

- **iconName** is the only required user-facing input; if empty, the entry fails Contentful validation. (Matches the existing Icon Highlight `iconName` field.)
- **color** dropdown uses `brandColorOptionsWithDefault('purplePrimary')` — the 22 universal options with `Purple Primary` annotated as the default. No legacy entries.
- **backgroundFill** options are exactly the three string literals — no aliases, no synonyms.
- **backgroundShape** options are exactly two string literals.
- **backgroundColor** options are `[{value: '#f6f6f6', displayName: 'Light Grey (default)'}, ...BRAND_COLOR_OPTIONS]` — the Light Grey option is **not** added to the shared manifest.
- **iconSize** accepts any positive integer; component code does not clamp.

### State transitions

None. The entity is read-only at runtime and stateless on the component side.

---

## Entity: React component `Icon` (props shape — NEW)

A pure presentation component composed in `apps/marketing/src/components/contentful/icon/Icon.tsx`. Maps 1:1 from the Contentful entry above.

### Props

| Prop              | Type                              | Default           | Maps from Contentful field                                   |
| ----------------- | --------------------------------- | ----------------- | ------------------------------------------------------------ |
| `iconName`        | `string`                          | _(required)_      | `iconName`                                                   |
| `color`           | `BrandColor` (from `colors.ts`)   | `'purplePrimary'` | `color`                                                      |
| `backgroundFill`  | `'none' \| 'filled' \| 'outline'` | `'none'`          | `backgroundFill`                                             |
| `backgroundShape` | `'circle' \| 'square'`            | `'circle'`        | `backgroundShape`                                            |
| `backgroundColor` | `BrandColor \| '#f6f6f6'`         | `'#f6f6f6'`       | `backgroundColor`                                            |
| `iconSize`        | `number`                          | `32`              | `iconSize`                                                   |
| `className`       | `string \| undefined`             | `undefined`       | _(passed by Contentful native editor for design-tab styles)_ |

### Derived values (computed inside the component)

| Computed value    | How computed                                                                                                          | Used for                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `iconFamily`      | `fontAwesomeV6BrandIconsMap.has(iconName) ? 'brands' : undefined`                                                     | Passed to `FontAwesomeV6Icon`                                                                                            |
| `iconStyle`       | Always `'solid'`                                                                                                      | Passed to `FontAwesomeV6Icon`                                                                                            |
| `resolvedColor`   | `backgroundFill === 'none' ? resolvedCssVarForBrandColor(color, useSectionBackground()) : cssVarForBrandColor(color)` | Inline `sx`/`style` color on the icon. Contrast switch fires only when there is no fill or outline (see research.md R1). |
| `resolvedBgColor` | `backgroundColor === '#f6f6f6' ? '#f6f6f6' : cssVarForBrandColor(backgroundColor as BrandColor)`                      | Inline `sx`/`style` background/border                                                                                    |
| `outerSize`       | `iconSize * SHAPE_RATIO` where `SHAPE_RATIO = 1.75`                                                                   | Wrapper width/height (when `backgroundFill !== 'none'`)                                                                  |
| `borderRadius`    | `backgroundShape === 'circle' ? '50%' : '25%'`                                                                        | Wrapper `border-radius`                                                                                                  |

### Rendered output (informal)

When `backgroundFill === 'none'`:

```html
<i
  class="fa-solid fa-{iconName} fa-{family?}"
  style="font-size: {iconSize}px; color: {resolvedColor};"
></i>
```

When `backgroundFill === 'filled'`:

```html
<span
  style="
  display: inline-flex; align-items: center; justify-content: center;
  width: {outerSize}px; height: {outerSize}px;
  background-color: {resolvedBgColor};
  border-radius: {borderRadius};
"
>
  <i
    class="fa-solid fa-{iconName} fa-{family?}"
    style="font-size: {iconSize}px; color: {resolvedColor};"
  ></i>
</span>
```

When `backgroundFill === 'outline'`:

```html
<span
  style="
  display: inline-flex; align-items: center; justify-content: center;
  width: {outerSize}px; height: {outerSize}px;
  border: 3px solid {resolvedBgColor};
  border-radius: {borderRadius};
"
>
  <i
    class="fa-solid fa-{iconName} fa-{family?}"
    style="font-size: {iconSize}px; color: {resolvedColor};"
  ></i>
</span>
```

No outer margin is applied. The wrapper is `inline-flex`, so the rendered output is a single inline-block-like element with intrinsic size equal to either the icon itself (none) or `outerSize × outerSize` (filled/outline).

---

## Out-of-model (intentionally not added)

- **`title` / `aria-label`**: not in v1 schema (FR-025). Logged for follow-up.
- **`colorOverride`** hex on the icon glyph: not in v1 schema (R1 in research.md).
- **`iconStyle` / `iconFamily`** as authored fields: not in v1 (R4 in research.md); resolved automatically.
- **Padding / margin / corner-radius** authored controls: not in v1 (FR-014, FR-015).

---

## Touched existing entities

| Existing entity                                                                     | Change                                             |
| ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| `BRAND_COLORS` manifest (`apps/marketing/src/components/common/colors.ts`)          | **No change.** Read-only reuse.                    |
| `fontAwesomeV6BrandIconsMap` (`apps/marketing/src/components/common/constants.ts`)  | **No change.** Read-only reuse.                    |
| `FontAwesomeV6Icon` primitive (`packages/component-library/src/fontAwesomeV6Icon/`) | **No change.** Read-only reuse.                    |
| `IconHighlight` and its Contentful definition                                       | **No change.** Explicitly preserved.               |
| `apps/marketing/src/contentful/registration/code.org/index.ts`                      | **Modified.** Adds one new component registration. |
| `apps/marketing/src/contentful/registration/csforall/...`                           | **No change.** Icon not registered for csforall.   |
