# Phase 1 Data Model: Custom Text component

This component has **no persisted data store**. The "data model" is the prop/field shape authored in Contentful and the in-memory resolution from type-defaults + overrides to a rendered style. Contentful field details are code-inferred (Contentful MCP not connected this session) and must be confirmed + human-applied before implementation.

## Entity: CustomTextType (enumerated preset)

The selectable type. Each value maps to a complete `CustomTextDefault` (see below).

| value          | displayName      |
| -------------- | ---------------- |
| `custom`       | Custom (default) |
| `subtitle`     | Subtitle         |
| `overline`     | Overline         |
| `statistic`    | Statistic        |
| `courseTopics` | Course Topics    |
| `courseLabs`   | Course Labs      |

- Default when unset: `custom`.
- Validation: must be one of the six values (`validations.in`).

## Entity: CustomTextDefault (per-type default style set)

Internal map `CUSTOM_TEXT_TYPE_DEFAULTS: Record<CustomTextType, CustomTextDefault>`. Not authored — code-owned. Draft values in research.md R7 (pending design confirmation).

| field              | type                                              | meaning                                                           |
| ------------------ | ------------------------------------------------- | ----------------------------------------------------------------- |
| `tag`              | `'span' \| 'p' \| 'div' \| 'label'`               | default semantic element (`span` for all except `subtitle` → `p`) |
| `track`            | `'text' \| 'display'`                             | font track → font stack + scale table                             |
| `size`             | `SizeToken` (`xs…4xl`)                            | cell in `SCALE_TEXT`/`SCALE_DISPLAY`                              |
| `weight`           | `WeightToken` (`regular\|medium\|semibold\|bold`) | maps via `WEIGHTS` to 400–700                                     |
| `color`            | `BrandColor`                                      | default text color token                                          |
| `textTransform`    | `'none'\|'uppercase'\|'lowercase'\|'capitalize'`  | default casing                                                    |
| `backgroundColor?` | `BrandColor`                                      | present only for chip types (Course Topics / Course Labs)         |
| `borderColor?`     | `BrandColor`                                      | border token used when `backgroundColor` is set (2px, fixed)      |

## Entity: CustomTextOverrides (authored, all optional)

Each field, when set, replaces **only its own dimension** on top of the selected type's default. Absence = use type default. A `default` sentinel value in dropdowns means "inherit from type."

| field (Contentful var) | type | options / form                                         | replaces                                                      |
| ---------------------- | ---- | ------------------------------------------------------ | ------------------------------------------------------------- |
| `htmlTag`              | Text | `default` + `span`, `p`, `div`, `label`                | `tag`                                                         |
| `color`                | Text | `brandTextColorOptions(<type default>)`                | `color`                                                       |
| `backgroundColor`      | Text | `default (none)` + `brandColorOptionsWithDefault(...)` | `backgroundColor` (enables border + disables contrast switch) |
| `borderColor`          | Text | `default` + `brandColorOptionsWithDefault(...)`        | `borderColor` (only effective when a background is present)   |
| `textSize`             | Text | `default` + `xs…4xl`                                   | `size`                                                        |
| `font`                 | Text | `default` + `Text (Geist)` + `Display (Space Grotesk)` | `track` (and font stack)                                      |
| `fontWeight`           | Text | `default` + `Regular/Medium/Semibold/Bold`             | `weight`                                                      |
| `textTransform`        | Text | `none` + `Uppercase/Lowercase/Capitalize`              | `textTransform`                                               |
| `iconNameLeft`         | Text | Font Awesome v6 name                                   | adds a leading icon                                           |
| `iconNameRight`        | Text | Font Awesome v6 name                                   | adds a trailing icon (ignored if `iconNameLeft` set)          |
| `children`             | Text | manual / entry binding                                 | text content                                                  |

## Entity: ResolvedCustomText (resolver output)

`resolveCustomTextStyles(args)` → consumed by `CustomText.tsx`.

| field           | type                                                  | derivation                                                                                                                                                                                |
| --------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`           | string                                                | `htmlTag` override ?? type default `tag`                                                                                                                                                  |
| `sx`            | `Record<string, unknown>`                             | `fontFamily` (from resolved track stack), `fontSize`+`lineHeight`(+`letterSpacing`) from the resolved track/size cell, `fontWeight` from resolved weight, `textTransform` when not `none` |
| `resolvedColor` | string (CSS var/hex)                                  | background present → `cssVarForBrandColor(color)`; else `resolvedCssVarForBrandColor(color, enclosingBackground)`                                                                         |
| `background`    | `{ backgroundColor: string; border: string } \| null` | when a background color is resolved: fill var + `2px solid <borderColor var>`; else `null`                                                                                                |
| `icon`          | `{ name: string; side: 'left' \| 'right' } \| null`   | `iconNameLeft` → left; else `iconNameRight` → right; else `null`                                                                                                                          |

## Resolution precedence (mirrors resolveHeadingStyles)

1. **Type default** seeds `tag`, `track`, `size`, `weight`, `color`, `textTransform`, and (chip types only) `backgroundColor`/`borderColor`.
2. **Per-property overrides** each replace their single dimension; a `default` sentinel leaves the type value intact (so clearing/leaving-default restores the type default — FR-004).
3. **Contrast / background rule**: if a background color is resolved (type default or override), bypass the contrast switch (direct `cssVarForBrandColor`) and render the 2px border; otherwise apply `resolveTextColorForBackground` against the enclosing Section background.

## Validation rules

- `type` ∈ the six enum values; falls back to `custom`.
- Color/background/border values ∈ `BRAND_COLORS` (or the `default`/`none` sentinel).
- `borderColor` has no visible effect without a background (graceful no-op — edge case).
- `textSize` ∈ `SizeToken`; `font` ∈ {`text`,`display`}; `fontWeight` ∈ {400,500,600,700}.
- Border width is constant 2px — no field exists for it.
- At most one icon renders; both-set resolves to left (deterministic).
- Empty `children` renders nothing harmful (no layout break).

## State transitions

None. The component is stateless and re-derives `ResolvedCustomText` from props on every render.
