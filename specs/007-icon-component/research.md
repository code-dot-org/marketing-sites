# Phase 0 Research: Icon Component

**Feature**: 007-icon-component
**Date**: 2026-06-18

This document resolves the small set of implementation choices the spec deliberately left for the plan stage (the contrast-switch routing in FR-007, the padding ratio / corner radius constants in FR-014, and the CSS strategy in FR-019), plus a short scan of the existing repo patterns that the new Icon component should mirror. There were no `[NEEDS CLARIFICATION]` markers in the spec; every entry below is a "decide-and-record" item, not an open question.

---

## R1 — Icon glyph contrast-switch routing (FR-007)

**Decision**: Route the icon glyph `color` through `resolvedCssVarForBrandColor(color, useSectionBackground())` **only when `backgroundFill === 'none'`**. When `backgroundFill === 'filled'` or `'outline'`, use `cssVarForBrandColor(color)` (no switch).

**Rationale**:

- The contrast switch's purpose is to keep a glyph readable against its **immediate visual background**. When `backgroundFill === 'none'`, the icon glyph's immediate background is the Section/Container — same situation as Heading and Paragraph, so the same rule applies.
- When `backgroundFill === 'filled'`, the glyph's immediate background is the chosen fill color (often `#f6f6f6` or another light tone); switching against the Section's tone produces wrong results — e.g. a `purplePrimary` icon on a light-grey fill inside a `purplePrimary` Section would flip to white and become invisible against the light fill. Author intent in the fill case is clearly "I want this color on this background, ignore the Section."
- When `backgroundFill === 'outline'`, the visual situation is genuinely ambiguous: the glyph technically sits over the Section's background (transparent inside the outline ring), but the outline implies a self-contained "badge" treatment. Treating outline the same as filled (skip the switch) keeps the rule simple and lets authors place an outlined icon inside a dark Section without the glyph flipping color.
- The cost is two extra lines of code (a single ternary in `Icon.tsx`) — well below the "too much complexity" threshold the user named.

**Smarter rejected alternative** — "use fill color as local background for the switch": would route `purplePrimary` on a `purpleDark` fill to white automatically. Considered and rejected: it requires a new code path (treat `#f6f6f6` as a "white"/light tone for switch purposes since it's outside `BRAND_COLORS`), and it overrules the author's explicit color pick — exactly the behavior the user wants to escape. Authors who opt into a fill/outline accept responsibility for readable color pairings; that's the deal.

**Alternatives considered**:

- **Unconditional contrast switch** (the original plan): rejected per user feedback — fails the `purplePrimary` icon + light fill + `purplePrimary` Section case.
- **No contrast switch at all** (the user's fallback): rejected because the `backgroundFill === 'none'` case is the common case where the switch is genuinely helpful (an icon sitting "naked" on a dark Section needs to flip color just like nearby text does). Dropping it entirely makes Icon behave inconsistently with Heading/Paragraph for no reason.
- **Plain `cssVarForBrandColor`, no contrast switch**: see above; rejected.
- **Icon-specific contrast variant**: rejected — adds a parallel rule with no design intent behind it. The text rule is fine for the `none` case.
- **Author-controlled `colorOverride` hex field**: deferred — Heading and Paragraph have this; SimpleList and Text Link did not. The Icon adopts the same posture as the latter two (no override) to keep the schema small; if authors complain, an `Override Color` hex field can be added in a follow-up without breaking existing entries.

---

## R2 — Shape footprint, padding ratio, corner radius (FR-014)

**Decision**: The background shape's outer dimension is `1.75 × iconSize` in CSS pixels. The `square` shape uses a corner radius of `25 %` (which renders as `0.25 × outer dimension`). These are Icon-local constants — not added to any shared SCSS or token file. The same outer dimension applies to `filled` and `outline`; `outline` uses a `2px` solid stroke.

**Rationale**:

- A 1.75 × ratio at the default 32 px icon size yields a 56 px outer shape — a familiar standard for "icon-on-tile" patterns across marketing components (matches the optical weight of Material's Avatar at the same content size and FA's own recommended `2x`/`3x` tile sizes scaled down). It keeps the icon centered with comfortable but not excessive padding.
- A 25 % radius on the square gives "squircle-style" corners that read as intentionally rounded without looking like a circle — distinctly different from the `circle` shape so authors get a visible payoff from switching. This matches the rounded-tile pattern in existing card and stat components in the marketing layer.
- A `3px` outline stroke reads cleanly at the default icon size and matches the visual weight of FA's solid glyphs better than a thinner stroke at this scale. The stroke does not scale with `iconSize` — author trust applies here just as for very small icons; see FR-013 in the spec.
- Keeping these as **local constants** (inside `Icon.tsx`, e.g. `const SHAPE_RATIO = 1.75; const SQUARE_RADIUS = '25%'; const OUTLINE_WIDTH = 2`) avoids touching `primitiveColors.scss` or any shared token file — they have nothing to do with brand color.

**Alternatives considered**:

- **`2 × iconSize` outer ratio**: rejected — too much padding at the default size; the icon visually shrinks inside the tile.
- **`1.5 × iconSize` outer ratio**: rejected — too tight; on `square` with `25 %` corners the icon glyph touches the corner radius at typical sizes.
- **Fixed outer pixel value (e.g. always 56 px regardless of icon size)**: rejected — breaks the spec's explicit "default padding/margin/size in relation to the icon size" requirement (FR-014) and produces wrong-looking output at non-default icon sizes.
- **Author-configurable padding/corner radius**: rejected by spec (FR-014 — "MUST NOT be exposed as an author-configurable field").
- **Adding shared SCSS variables for the ratio/radius**: rejected — they're Icon-specific shape decisions, not site-wide design tokens, and adding them to the global SCSS layer pollutes a layer that's meant for brand-color primitives only.

---

## R3 — CSS strategy: `sx` prop vs SCSS module (FR-019)

**Decision**: Inline `sx` on a single `<Box>` wrapper (when `backgroundFill !== 'none'`). No new SCSS file is added.

**Rationale**:

- The Icon component has a small, dynamic style payload: outer dimension is `iconSize × 1.75`, background-or-outline color depends on `backgroundColor`, border-radius depends on `backgroundShape`. All three are driven by runtime props, so a static SCSS module would still need inline overrides — net code goes up, not down.
- Divider and Heading already use the `sx` pattern (`apps/marketing/src/components/contentful/divider/Divider.tsx:48-52`, `Heading.tsx:90-103`); this keeps the new Icon stylistically consistent with the two most-touched neighbors in the same directory.
- A separate `icon.module.scss` would add a file and a class-name plumbing layer without gaining anything reusable, since no other component shares these shape rules.

**Alternatives considered**:

- **`icon.module.scss` + dynamic CSS variables**: rejected for the size reasons above. Considered an acceptable second choice if `sx` becomes unwieldy, but it isn't here.
- **Inline `style` prop**: rejected — `sx` is the repo convention for MUI-based components and supports theme-aware values for free.

---

## R4 — How the existing Icon Highlight handles `iconName` (reuse pattern)

**Decision**: Mirror the Icon Highlight pattern exactly for `iconName` resolution.

**Findings** (from reading `apps/marketing/src/components/contentful/iconHighlight/IconHighlight.tsx:8,39-46`):

- `iconName` is a `type: 'Text'` field with `required: true` (no `validations.in` list — free-form Font Awesome name).
- The component checks `fontAwesomeV6BrandIconsMap.has(iconName)` and conditionally sets `iconFamily: 'brands'`.
- `iconStyle` is hard-coded to `'solid'`.

The new Icon component uses the same three rules. No expansion of `fontAwesomeV6BrandIconsMap` is needed — the spec FR-002/FR-003 explicitly call out matching the existing pattern.

**Alternatives considered**:

- **Add `iconFamily` and `iconStyle` as Contentful fields**: rejected — out of scope per the user's "use the same functionality to select" instruction. Authors don't choose family/style today on Icon Highlight; the new Icon shouldn't either. Logged as deferred work if a future request needs `regular` or `light` styles.

---

## R5 — `backgroundColor` storage: brand-token strings vs hex

**Decision**: `backgroundColor` is `type: 'Text'`. Stored values are the brand-token `value` strings (e.g. `purplePrimary`) for the 22 universal options, plus the literal hex string `#f6f6f6` for the Icon-local Light Grey default. The component code maps the value to a CSS color: brand tokens through `cssVarForBrandColor`, the literal `#f6f6f6` passes through directly.

**Rationale**:

- All other components store brand-token values, not hex — this preserves the indirection that lets the contrast-switch and CSS-variable layer work on the icon glyph `color` field. The same field shape on `backgroundColor` keeps the schema uniform.
- Storing `#f6f6f6` as a literal hex (one specific Icon-local value) avoids adding a `lightGrey` entry to `BRAND_COLORS` — which would surface on every other component's color picker, violating the spec's "doesn't add it to other color pickers" instruction (FR-011 + `[[user_branch_prefix]]` constraints).
- The mapping logic in the component is one branch: `value === '#f6f6f6' ? '#f6f6f6' : cssVarForBrandColor(value as BrandColor)`. No new helper, no new manifest entry.

**Alternatives considered**:

- **Add `lightGrey` to `BRAND_COLORS`**: rejected — bleeds into every other component's picker.
- **Add a separate `backgroundColorOverride` hex field**: rejected — doubles the schema for a single value. Authors would have to know which field wins.
- **Allow any hex in `backgroundColor`**: rejected — no design need; opens up unbounded values that bypass the brand palette.

---

## R6 — Contentful category placement

**Decision**: Category `03: Content Building Blocks`.

**Rationale**:

- The Icon is a small, reusable building block authors drop alongside Heading, Paragraph, Link, and Simple List inside a Section or Container. That's exactly what `03: Content Building Blocks` covers in the existing Studio category list.
- Icon Highlight sits in `10: Deprecated`; the new Icon is not deprecated, so it cannot reuse that category.

**Alternatives considered**:

- **`04: Decoration` (initial plan choice)**: rejected — narrower than the Icon's actual usage. Authors will use icons as inline content elements (next to headings, inside list rows), not just as page decorations.
- **`02: Page Structure` (where Divider lives)**: rejected — Divider is structural; Icon is a content element.
- **A new category just for icons**: rejected — premature; one new component doesn't warrant a new category.

---

## R7 — Tenant registration (FR-016)

**Decision**: Register the Icon component **only** in `apps/marketing/src/contentful/registration/code.org/index.ts`. Leave `apps/marketing/src/contentful/registration/csforall/` untouched.

**Rationale**:

- CS for All is being deprecated (per `[[project_codeai_brand_rename]]`). Not registering the new component on csforall is the established pattern for recent additions (e.g. the brand-color expansion in feature 006 only adds new options to the code.org Section variant).
- Csforall authors don't need a new component on a deprecated tenant; registering it would create surface-area to maintain for no value.

**Alternatives considered**:

- **Register on both tenants**: rejected — pure cost, no benefit.
- **Conditional registration with a feature flag**: rejected — over-engineering for a deprecation context.

---

## R8 — Existing icon-related consumers (impact scan)

**Decision**: No consumers of `FontAwesomeV6Icon` need to change.

**Findings** (from `grep -rn "FontAwesomeV6Icon" apps/ packages/src 2>/dev/null` — performed during research):

- The primitive is consumed by Icon Highlight (`apps/marketing/src/components/contentful/iconHighlight/IconHighlight.tsx`) and by several `@code-dot-org/component-library/cms/*` higher-level components (`iconHighlight`, dropdown decoration, etc.).
- This feature adds a new consumer (the new Icon component) and changes no existing consumer.
- The primitive itself (`packages/component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx`) is **not modified** — current API is sufficient.

**Risk**: zero. New consumer only.

---

## R9 — Contentful MCP confirmation step (FR-022 + constitution)

**Decision**: Before the new component is merged, a human creates the `icon` content type in Contentful Studio (or applies a human-reviewed migration script). After creation, the schema is **re-read via Contentful MCP** and verified to match the proposal in `contracts/contentful-icon-content-type.md`. The PR description must explicitly state which fields were confirmed via MCP vs inferred from application code (per constitution principle V and `[[contentful_array_no_manual]]`-style discipline).

**Rationale**: The constitution explicitly requires Contentful MCP confirmation for schema-affecting changes (Workflow and Review, line 235-238). No application-code Contentful writes occur in this feature.

**Open item**: confirm that the planned `iconSize` field can be `type: 'Number'` (`Integer` is the Contentful-native type; the SDK may surface it differently). Will be verified via MCP at the human-applied step.

---

## R10 — Bundle/perf impact

**Decision**: No measurable bundle impact beyond a few hundred bytes of TypeScript that compresses well.

**Reasoning**:

- The new component pulls in `FontAwesomeV6Icon` (already in the bundle), `Box` from MUI (already in the bundle), and the existing color helpers (already in the bundle). New code is ~50 lines of TypeScript.
- No new third-party dependency.
- No client-side hydration cost: the component is server-rendered; only `useSectionBackground` runs at render time, which is the same hook already used by Heading and Paragraph.

---

## Summary

All ten research items are resolved with established repo patterns or single-line decisions. There are no open `NEEDS CLARIFICATION` markers and no items that block Phase 1.
