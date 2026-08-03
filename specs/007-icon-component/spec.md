# Feature Specification: Icon Component

**Feature Branch**: `dee/component-updates/icon`
**Created**: 2026-06-18
**Status**: Draft
**Input**: User description: "Create a new Icon component (separate from the existing Icon Highlight). Font-Awesome name text input, render the icon. Color options from the new universal CodeAI brand palette — same order and default as the Divider, but without any legacy options. Optional background with shape (circle or rounded square) and a fill mode of none, filled, or outline; the background color is picked from the same universal palette and defaults to a light grey `#f6f6f6` only on the Icon's background picker. Default icon font-size 32px, configurable. Background padding/size is fixed relative to the icon and not author-configurable. No outer margin on the rendered output."

## Overview

This feature adds a new **Icon** Contentful component that lets authors drop a single, decorated Font Awesome icon into a page. It is intentionally minimal and independent: the legacy **Icon Highlight** component (currently in `apps/marketing/src/components/contentful/iconHighlight/`, category `10: Deprecated`) and every other consumer of `FontAwesomeV6Icon` is unaffected. Icon Highlight stays exactly as-is.

The component reuses the existing `FontAwesomeV6Icon` primitive in `packages/component-library/src/fontAwesomeV6Icon/` for rendering — including the existing `iconName` text-input pattern and the existing brand-icon detection via `fontAwesomeV6BrandIconsMap` — and reuses the universal CodeAI brand color manifest (`apps/marketing/src/components/common/colors.ts`) for both the icon color picker and the optional background color picker. It introduces one Icon-specific styling concern (a wrapper that draws a circle or rounded square as a filled background or as an outline) and one Icon-specific default value (a `#f6f6f6` light-grey background default that is scoped to the Icon's background picker and does NOT bleed into other component pickers).

The component is for the **code.org** tenant. CS for All is being deprecated; the new Icon component is not registered for csforall and does not affect csforall pages.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Render a Branded Icon Inline (Priority: P1)

A content author drags an Icon component into a page, types a Font Awesome icon name (e.g. `lightbulb`), and the icon renders at the default 32px size in the default brand color, with no background, and no outer margin. The author can change the color from the universal CodeAI palette dropdown (same order and default as the Divider).

**Why this priority**: This is the core payload. Without the bare icon-with-color path, the component delivers nothing. Background and shape options are decoration on top.

**Independent Test**: Open Contentful Studio (or the Storybook story), add an Icon entry, set the icon name to `lightbulb`, leave all other fields at their defaults, and confirm the icon renders at 32px in the default brand color with no surrounding shape or margin.

**Acceptance Scenarios**:

1. **Given** a new Icon entry with default values, **When** the author publishes it, **Then** a `lightbulb`-style icon renders at 32px in the Divider's default brand color (`purplePrimary`) with no background and no outer margin.
2. **Given** an Icon entry, **When** the author types `github` (a Font Awesome brand-family icon), **Then** the icon renders correctly using the brands family (matching the existing brand-icon detection used by Icon Highlight).
3. **Given** an Icon entry, **When** the author changes the color dropdown to `bluePrimary`, **Then** the icon renders in `var(--codeai-blue-primary)`.
4. **Given** an Icon entry, **When** the author sets `iconSize` to `48`, **Then** the icon renders at 48px.
5. **Given** the existing Icon Highlight component and any other consumer of `FontAwesomeV6Icon`, **When** this feature ships, **Then** their visual output and Contentful schema are unchanged.

---

### User Story 2 - Add a Filled Background Shape Behind the Icon (Priority: P2)

A content author wants the icon to sit on a colored circle or rounded square (a common pattern in feature lists, callouts, and stat tiles). They open the Icon entry, set `backgroundFill` to `filled`, leave `backgroundShape` at `circle`, and the icon renders centered on a `#f6f6f6` circle sized relative to the icon. They can override `backgroundColor` to any of the universal brand colors.

**Why this priority**: This is the most common second-step request after a bare icon — surrounding it with a quiet shape so it can sit alongside text or as a visual anchor. Filled circles/rounded squares are the standard pattern.

**Independent Test**: In Storybook, set `backgroundFill="filled"`, `backgroundShape="circle"`, leave color at default — confirm a light-grey filled circle is drawn behind the icon at a consistent padding ratio. Switch `backgroundShape` to `square`; confirm a rounded-corner square is drawn instead.

**Acceptance Scenarios**:

1. **Given** an Icon with `backgroundFill = filled`, `backgroundShape = circle`, `backgroundColor = default`, **When** it renders, **Then** the icon sits inside a `#f6f6f6` filled circle whose diameter is the default padding ratio relative to the configured icon size.
2. **Given** an Icon with `backgroundFill = filled`, `backgroundShape = square`, **When** it renders, **Then** the shape is a rounded-corner square with the same padding ratio and consistent corner rounding.
3. **Given** an Icon with `backgroundFill = filled`, `backgroundColor = bluePrimary`, **When** it renders, **Then** the background is `var(--codeai-blue-primary)` (not `#f6f6f6`).
4. **Given** an Icon with `backgroundFill = none` (the default), **When** it renders, **Then** no shape is drawn and the rendered output is exactly the icon (same as User Story 1).
5. **Given** an author opens any **other** component's color picker (Heading, Paragraph, Divider, Container, Section, etc.), **When** they look at the dropdown, **Then** `#f6f6f6` is **not** a selectable option — the light-grey default exists only as the Icon-specific background fallback.

---

### User Story 3 - Use an Outline Instead of a Filled Background (Priority: P3)

A content author wants an icon ringed by an outline rather than sitting on a solid shape (a lighter visual, common for "step" markers or secondary callouts). They set `backgroundFill` to `outline` — the same `backgroundColor` value now drives the outline stroke instead of a fill, and the same `backgroundShape` choice (circle vs rounded square) selects the outline's shape. Padding/size relative to the icon stays the same.

**Why this priority**: Outline is a useful third option that comes "for free" if the background color and shape are reused as the outline's stroke and shape — it doesn't add a separate field, it just reinterprets the same two fields. Worth shipping in v1 to avoid an awkward follow-up that would require schema changes.

**Independent Test**: In Storybook, set `backgroundFill="outline"`, `backgroundShape="circle"`, `backgroundColor="purplePrimary"` — confirm a circular outline in `var(--codeai-purple-primary)` rings the icon at the same padding ratio as the filled mode.

**Acceptance Scenarios**:

1. **Given** an Icon with `backgroundFill = outline`, `backgroundShape = circle`, `backgroundColor = purplePrimary`, **When** it renders, **Then** a circular outline in `var(--codeai-purple-primary)` rings the icon at the same padding ratio as `filled` would use.
2. **Given** an Icon with `backgroundFill = outline`, `backgroundShape = square`, **When** it renders, **Then** the outline is a rounded-corner square with the same corner radius as the filled square variant.
3. **Given** an Icon with `backgroundFill = outline` and `backgroundColor` left at default, **When** it renders, **Then** the outline is drawn in `#f6f6f6` (consistent reuse of the same default — authors can pick a darker stroke as needed).
4. **Given** the icon's own color is independent of `backgroundColor`, **When** `backgroundFill = outline`, **Then** the icon glyph color is still driven by the `color` field and is not coupled to the outline color.
5. **Given** a `purplePrimary` Icon with `backgroundFill = filled` and `backgroundColor = #f6f6f6` placed inside a Section whose background is `purplePrimary`, **When** it renders, **Then** the glyph stays `purplePrimary` (contrast switch is OFF because `backgroundFill ≠ none`).
6. **Given** the same Icon with `backgroundFill = none` placed inside a Section whose background is `purplePrimary`, **When** it renders, **Then** the glyph flips to white (contrast switch is ON because `backgroundFill = none`).

---

### Edge Cases

- **Empty / unknown `iconName`**: If the field is empty or an unknown value, the underlying `FontAwesomeV6Icon` will produce an empty `<i>` (matching today's Icon Highlight behavior). No special error UI is added.
- **Brand-family icons**: Names that exist in `fontAwesomeV6BrandIconsMap` (e.g. `github`, `x-twitter`) MUST resolve to the `brands` family automatically, matching the existing Icon Highlight detection path. Authors don't pick a family.
- **Contrast switch interaction**: The contrast-switch system (FR-007..FR-013 of feature 006) applies to the icon glyph color **only when `backgroundFill = none`**. When `backgroundFill = filled` or `outline`, the icon's local background is the author's chosen fill/outline color (not the enclosing Section), and the glyph color is passed through unchanged so an author can place a `purplePrimary` icon on a light fill inside a `purplePrimary` Section without it flipping to white. The background shape's own color (filled or outline) is NEVER routed through the contrast switch — authors picked it explicitly.
- **Light-grey default visibility on light Sections**: The `#f6f6f6` default is intentionally low-contrast on a white Section. Authors choosing to keep the default on a light Section get a quiet decorative shape; this is the intended use of the default, not a bug.
- **`iconSize` lower bound**: `iconSize` accepts any positive number; very small values (e.g. < 8) render but become illegible. No clamping is added — authors are trusted on this dimension.
- **Outer margin**: The rendered output MUST have zero outer margin. Authors who want spacing put the Icon inside a Container or rely on the parent layout's gap; the Icon does not contribute spacing.
- **Server rendering**: The component renders on the server like the existing Icon Highlight and other Contentful components. No client-only boundary, no browser-only dependencies, no hydration issue.
- **Privacy / SEO**: No personal data, no third-party network calls, no metadata, structured data, sitemap, or canonical impact.
- **Storybook**: A Storybook story MUST cover bare icon, filled-circle, filled-square, outline-circle, outline-square, the default light-grey background, a non-default brand background color, and a non-default icon size.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A new Contentful component MUST be registered with id `icon` and name `Icon`, distinct from the existing `iconHighlight` component (which remains in category `10: Deprecated` and is unchanged by this feature).
- **FR-002**: The component MUST expose an `iconName` text-input field (Font Awesome icon name) using the same field shape as the existing Icon Highlight `iconName` field — `type: 'Text'`, `group: 'content'`, `required: true`. A reasonable default value (e.g. `lightbulb`) MUST be provided so a freshly-dropped entry renders something.
- **FR-003**: The component MUST resolve the icon family the same way Icon Highlight does today: when `iconName` is present in `fontAwesomeV6BrandIconsMap`, render with `iconFamily: 'brands'`; otherwise leave `iconFamily` unset. `iconStyle` MUST default to `'solid'`.
- **FR-004**: The component MUST render via the existing `FontAwesomeV6Icon` primitive from `@code-dot-org/component-library/fontAwesomeV6Icon` — no new icon-rendering primitive is introduced.
- **FR-005**: The component MUST expose a `color` dropdown for the icon glyph, populated from the universal CodeAI brand color manifest (`BRAND_COLORS` in `apps/marketing/src/components/common/colors.ts`). The dropdown's option order MUST match the Divider's brand-color order produced by `brandColorOptionsWithDefault('purplePrimary')`, and the default MUST be `purplePrimary`. The Icon component MUST NOT include any of the legacy options Divider keeps at the bottom of its list (`primary`, `strong`, `white` legacy entries).
- **FR-006**: The icon glyph color MUST be applied via the universal `cssVarForBrandColor` helper (or `resolvedCssVarForBrandColor` if FR-007 routes it through the contrast switch).
- **FR-007**: The icon glyph color MUST be routed through the contrast switch (`resolvedCssVarForBrandColor`) **only when `backgroundFill = none`**, in which case the icon's effective background is the nearest enclosing Section/Container background and the switch resolves identically to Heading/Paragraph. When `backgroundFill = filled` or `backgroundFill = outline`, the icon's glyph color MUST be applied as-authored via `cssVarForBrandColor` (no contrast switch). Rationale: with a fill or outline, the icon sits on a deliberately-authored local background — e.g. a `purplePrimary` icon on a light-grey fill inside a `purplePrimary` Section MUST stay `purplePrimary`, not flip to white. Authors who opt into a fill/outline take responsibility for the glyph/background contrast within the icon.
- **FR-008**: The component MUST expose a `backgroundFill` dropdown with exactly three options: `none` (default), `filled`, `outline`. When `none`, no background shape is drawn and no wrapper-related markup MUST contribute outer dimensions beyond the icon itself.
- **FR-009**: The component MUST expose a `backgroundShape` dropdown with exactly two options: `circle` (default) and `square`. The `square` option MUST render with consistent rounded corners (a single repo-defined corner radius — not a sharp square). `backgroundShape` MUST have no visible effect when `backgroundFill = none`.
- **FR-010**: The component MUST expose a `backgroundColor` dropdown populated from the same universal CodeAI brand color manifest used in FR-005, **plus** one Icon-specific extra option whose display name reads as a light-grey default (e.g. `Light Grey (default)`) and whose stored value is the literal hex `#f6f6f6`. The default of the `backgroundColor` dropdown MUST be this light-grey entry. `backgroundColor` MUST have no visible effect when `backgroundFill = none`.
- **FR-011**: The `#f6f6f6` light-grey option MUST exist only on the Icon component's `backgroundColor` dropdown. It MUST NOT be added to the shared `BRAND_COLORS` manifest, to `BRAND_COLOR_OPTIONS`, or to any other component's color picker. Implementation MUST be a small Icon-local addition (an option object appended to the Icon's `validations.in` list) rather than a manifest entry.
- **FR-012**: When `backgroundFill = filled`, the component MUST draw a solid shape behind the icon in the chosen `backgroundColor`. When `backgroundFill = outline`, the component MUST draw a stroke-only shape around the icon using the chosen `backgroundColor` as the stroke color. The two modes MUST use the same shape selection (`backgroundShape`) and the same padding/size ratio.
- **FR-013**: The component MUST expose an `iconSize` numeric field (units: CSS px) with a default of `32`. The field MUST accept arbitrary positive integers; the component MUST NOT clamp values. No min/max validation is enforced.
- **FR-014**: The background's outer size MUST be a fixed multiple/padding of the configured `iconSize`. The padding ratio is repo-internal (chosen by implementation; see Implementation Notes), MUST be consistent across `filled` and `outline`, and MUST NOT be exposed as an author-configurable field. The same rule applies to the `square` corner radius — a single internal constant, not author-configurable.
- **FR-015**: The rendered Icon component MUST have zero outer margin (no `margin` / no `Margin` style field). Authors who want spacing rely on the parent layout. The component MUST NOT expose a Margin field in Contentful.
- **FR-016**: The component MUST be registered for the **code.org** tenant only. The `apps/marketing/src/contentful/registration/csforall/` registration MUST NOT include the new Icon component.
- **FR-017**: The component MUST be a server-rendered React component, matching the existing Icon Highlight pattern. No client-only boundary, no `"use client"` directive, no browser-only dependency.
- **FR-018**: The existing Icon Highlight component, its Contentful definition, its tests, and its rendered output MUST NOT be modified by this feature. Any other current consumer of `FontAwesomeV6Icon` MUST also be unaffected.
- **FR-019**: The component MUST stay on the existing MUI-based stack — no new styling library is introduced. CSS may use inline `sx` (matching Divider/Section conventions) or a small module SCSS file, whichever is shorter; no new global SCSS variables MUST be introduced for the Icon-specific padding ratio or corner radius (use a local constant).
- **FR-020**: The component MUST ship with Storybook coverage exercising at minimum: (a) bare icon, default values; (b) non-default icon name including a brand-family icon; (c) custom `iconSize`; (d) custom `color`; (e) `backgroundFill = filled` with `backgroundShape = circle` at the default `#f6f6f6` background; (f) `backgroundFill = filled` with `backgroundShape = square` at a brand `backgroundColor`; (g) `backgroundFill = outline` with `backgroundShape = circle`; (h) `backgroundFill = outline` with `backgroundShape = square`.
- **FR-021**: The component MUST ship with unit tests exercising at minimum: default render, `color` prop application, `iconSize` prop application, brand-family detection, the three `backgroundFill` modes (each verifying that the wrapper markup is present/absent as expected), and verification that `#f6f6f6` is applied as the default `backgroundColor` when `backgroundFill ≠ none`.
- **FR-022**: No new Contentful writes are required from application code. The Contentful schema/content-type entry for the new Icon component MUST be applied by a human (via the Contentful UI or migration script reviewed by a human) and then re-read via Contentful MCP to confirm the new entry validates before the component definition is merged.
- **FR-023**: SEO is unaffected — no page-level metadata, canonical behavior, structured data, indexing behavior, or sitemap changes.
- **FR-024**: Privacy is unaffected — no personal data, Student Records, third-party data sharing, or analytics events are introduced or altered.
- **FR-025**: Accessibility: when an Icon is rendered purely decoratively (the default), it MUST NOT be announced by screen readers (no `title`, no `aria-label`). The existing `FontAwesomeV6Icon` honors a `title` prop only when set; this feature MUST NOT introduce a `title` field in the Contentful schema in v1 (accessibility audit + optional `title`/`aria-label` field is logged as deferred work).
- **FR-026**: The component MUST belong to a sensible Contentful category — the same category Icon Highlight would belong to if it were active (i.e. an in-content "decoration" / "media" grouping). Specific category id is an implementation detail to be settled in the plan, not the spec.

### Universal Color Options — Icon

The icon glyph `color` field uses `brandColorOptionsWithDefault('purplePrimary')` directly (no legacy filter), giving the dropdown the 22 universal CodeAI brand options in their canonical manifest order with `Purple Primary (default)` pre-selected.

The `backgroundColor` field uses the same 22 universal CodeAI brand options, plus a single Icon-local option appended in front of (or atop) the list:

| Display name         | Stored value    | Source                                   |
| -------------------- | --------------- | ---------------------------------------- |
| Light Grey (default) | `#f6f6f6`       | Icon-local — not in `BRAND_COLORS`       |
| Purple Primary       | `purplePrimary` | shared manifest                          |
| Purple Dark          | `purpleDark`    | shared manifest                          |
| …                    | …               | … (22 universal options, manifest order) |

## Integration Points _(mandatory when external systems or cross-workspace changes are involved)_

### Systems and Contracts

- **Upstream Inputs**:
  - Contentful entry of new content type `icon` with fields `iconName: Text`, `color: Text`, `backgroundFill: Text`, `backgroundShape: Text`, `backgroundColor: Text`, `iconSize: Number`.
  - The universal color manifest at `apps/marketing/src/components/common/colors.ts` (read-only).
  - The existing `fontAwesomeV6BrandIconsMap` constant at `apps/marketing/src/components/common/constants.ts` (read-only).
  - Font Awesome V6 web-font kit loaded via the existing site `<head>` injection (no new dependency).
- **Downstream Effects**:
  - One new Contentful component definition surfaced in Studio under the chosen category.
  - No cache-tag, analytics, redirect, third-party script, or SEO/metadata effect.
- **Runtime Surfaces**:
  - New files under `apps/marketing/src/components/contentful/icon/`: `Icon.tsx`, `iconContentfulDefinition.ts`, `index.ts`, `__tests__/Icon.test.tsx`, optional `icon.module.scss`.
  - One new Storybook story under `apps/marketing-storybook/stories/Icon.story.tsx`.
  - Registration in `apps/marketing/src/contentful/registration/code.org/...` (specific file selected in the plan).
  - No CI workflow change.
- **Tenant / Hostname Paths**:
  - `http://code.org.marketing-sites.localhost:3001` — Icon registered and renderable.
  - `http://preview-code.org.marketing-sites.localhost:3001` — Icon renderable in previews.
  - csforall tenants — Icon NOT registered; no behavioral change.

### Data Flow Notes

- Contentful entry → tenant-specific registration → server-rendered React component → `FontAwesomeV6Icon` primitive → static HTML containing `<i class="fa-… fa-…">`, optionally wrapped in a `<span>` (the shape wrapper) styled via inline `sx`/CSS variables.
- The new component reads from Contentful (no write).
- Contentful changes for this feature are read-only analysis at design time; the new content-type entry is a human-applied change (via Studio UI or human-applied migration), then re-read via MCP to confirm shape before the React component definition is merged.
- No new caching, revalidation, or middleware behavior is introduced.
- The contrast switch resolution (per FR-007) consumes the existing `SectionBackgroundContext` already established by feature 006.

### Key Entities

- **Icon (Contentful entry)**: A single decorated Font Awesome icon. Carries Font Awesome icon name, glyph color (universal brand color), optional background shape and fill mode, optional background color (universal brand color or Icon-local light-grey default), and icon size in px.
- **FontAwesomeV6BrandIconsMap (existing)**: The lookup that distinguishes Font Awesome brand-family icons from solid/regular families. Unchanged.
- **Brand Color Manifest (existing)**: The 22-token universal CodeAI palette. Unchanged.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A content author can drop a new Icon entry into a page and render a styled Font Awesome icon (glyph + optional shape) in under 60 seconds without leaving Contentful Studio.
- **SC-002**: 100% of the icon color options in the dropdown match — in value, display name, and order — the Divider's brand-color dropdown options, excluding Divider's three legacy entries (`primary`, `strong`, `white` legacy variants).
- **SC-003**: The default values produce a visually-recognizable icon (Purple Primary glyph, 32px, no background) with zero author input beyond entering an icon name.
- **SC-004**: The `#f6f6f6` light-grey default appears in exactly one place in the repo's component-facing surface — the Icon `backgroundColor` field — and is selectable from zero other component pickers. (Verifiable by grep across `*ContentfulDefinition.ts` and the shared `colors.ts` manifest.)
- **SC-005**: The existing Icon Highlight component, its Contentful schema, and its rendered output are byte-identical before and after this feature merges. (Verifiable by snapshot test or by inspection of the Icon Highlight files in the diff.)
- **SC-006**: All eight Storybook story configurations enumerated in FR-020 render without console errors and pass the existing storybook-eyes visual-diff acceptance step.
- **SC-007**: Switching `backgroundFill` from `filled` to `outline` at fixed `backgroundShape` and `backgroundColor` produces an outer dimension change of 0 pixels — i.e. the outline mode reuses the same shape footprint as filled mode.
- **SC-008**: Component bundle impact is bounded: the new Icon component adds no more than a few hundred bytes gzipped to the marketing app's client bundle, and adds no new third-party dependencies.

## Assumptions

- The existing `FontAwesomeV6Icon` primitive in `packages/component-library/src/fontAwesomeV6Icon/` is sufficient and does not need new props for this feature; the new Icon component composes it.
- The existing `fontAwesomeV6BrandIconsMap` is complete enough for the brand-icon names authors will use; no expansion is required as part of this feature.
- The universal CodeAI brand color manifest (`BRAND_COLORS`) is the canonical color source — no parallel color list is created for Icon.
- The contrast switch infrastructure from feature 006 (`SectionBackgroundContext`, `resolveTextColorForBackground`, `resolvedCssVarForBrandColor`) is in place and applies to nested icons the same way it applies to text.
- The Contentful content type `icon` does not exist yet and will be created by a human (Studio UI or human-applied migration) before the new component definition is merged.
- CS for All is deprecated; not registering the Icon component on csforall is acceptable and matches the pattern used by other recent component additions.
- The padding ratio (e.g. shape outer size ≈ 1.75× icon size) and the rounded-square corner radius are implementation choices to be set during the plan; they are repo-internal constants, not author-configurable.
- No font-loading or hydration concern is introduced — Font Awesome's web-font kit is already loaded site-wide and SSR works today via the existing Icon Highlight.
- No new privacy, SEO, sitemap, redirect, caching, or analytics surface is touched.
- Existing cache headers and revalidation windows remain unchanged.
- Shared component-library changes are NOT required; the new Icon component lives entirely in the `apps/marketing` layer and reuses the existing `@code-dot-org/component-library/fontAwesomeV6Icon` export.
- This is a pure additive change — no existing entry, schema, or rendered output is altered (other than the new Icon component appearing in Studio's component list).
