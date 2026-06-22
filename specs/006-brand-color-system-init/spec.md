# Feature Specification: Brand Color System Initialization

**Feature Branch**: `006-brand-color-system-init`
**Created**: 2026-06-17
**Status**: Draft
**Input**: User description: "Establish the new CodeAI brand color system across the recently-updated components. 5 primary colors (Purple, Blue, Green, Orange, Pink), each with 4 shades (Dark, Primary, Mid, Light), plus Black and White. Expose the palette in existing color dropdowns of components already updated this cycle (Heading, Paragraph, Text Link, Simple List, Container, Section). Add an automatic foreground/background contrast switch so dark text on a dark background flips to white, and light text on a light background flips to black. Keep the change minimal: MUI-based, no major content/layout/breaking changes, no effect on existing in-use colors. Components that don't yet have color options (Button, dividers, etc.) are out of scope and will receive options in a later pass. Rich Text remains black/white only."

## Overview

This feature seeds the new CodeAI brand color palette (22 named colors: 5 primary families × 4 shades plus Black and White) into the existing universal color manifest at `apps/marketing/src/components/common/colors.ts` and exposes it to content authors via the color dropdowns already wired into recently-updated components — Heading, Paragraph, Text Link, Simple List, native Container, native Section, and the custom Section component. It adds the contrast-switch rule that lets one color selection produce a readable result on both light and dark backgrounds, removing the most common authoring pitfall (dark text on dark background, white text on white background).

It is deliberately scoped to surface the palette and the contrast rule — not to migrate every page, restyle existing entries, or introduce color options on components that don't already have them. A broader re-engineering pass is planned for after all pages are rebuilt on the updated components; architectural opportunities (e.g. consolidating per-brand section colors, fully migrating Overline to the shared manifest) are noted but deferred.

**Tenant scope**: This feature targets the **code.org** tenant. The **csforall** tenant is being deprecated and is explicitly out of scope for behavioral changes. Because the shared `BRAND_COLOR_OPTIONS` array and the shared SCSS primitives layer are loaded by both tenants, csforall content authors will see the new options in their Contentful Studio dropdowns and csforall pages will load the new CSS variables in their stylesheet. However, **no csforall content uses the new options** and no csforall component references the new CSS variables, so csforall rendered pages do not change. The only csforall-facing behavioral safeguard in this feature is a guard in `Section.tsx` that prevents the new `data-bg-tone` attribute from being emitted on Sections whose `background` value is not one of the 22 new CodeAI brand tokens (which excludes every value csforall uses). Adding a full per-brand filter on dropdown options or splitting the SCSS layer is rejected as unnecessary infrastructure given the deprecation timeline.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Apply Brand Colors in Existing Component Dropdowns (Priority: P1)

A content author building a Contentful entry opens the color picker on a Heading, Paragraph, Text Link, Simple List item, native Container background, native Section background, or the custom Section component. They see the new CodeAI brand palette (Purple, Blue, Green, Orange, Pink across Dark/Primary/Mid/Light, plus Black and White) and pick a color. The component renders in that color.

**Why this priority**: This is the entire payload of the feature — making the brand palette available wherever the existing components accept a color. Without it, the palette is invisible to authors and the rest of the rebrand work has nothing to consume.

**Independent Test**: Open Contentful Studio (or Storybook), edit any of the listed components, open its color/background dropdown, and confirm the 22 brand options appear and render correctly.

**Acceptance Scenarios**:

1. **Given** a Heading entry, **When** the author opens the color dropdown, **Then** all 22 brand colors are selectable and selecting any one renders the heading text in that color.
2. **Given** a native Container with no background, **When** the author selects "Blue Primary" as background, **Then** the container renders with background `#0099F3`.
3. **Given** an existing entry that uses a legacy color value (e.g. `secondary`), **When** the entry is published unchanged, **Then** the rendered color is identical to what was rendered before this feature shipped.
4. **Given** a Button, Divider, or any component without a color option today, **When** an author opens its editor, **Then** no new color picker appears and the component is visually unchanged.

---

### User Story 2 - Automatic Foreground/Background Contrast Switch (Priority: P2)

A content author places text inside a Container or Section whose background is one of the dark shades (Dark, Primary, or Black). The text they chose — even if they explicitly picked a dark color like "Black" or "Purple Primary" — renders as White so it remains readable. On light backgrounds, low-contrast text shifts within its own color family to a darker shade that still reads on that background (e.g. "Purple Mid" text on a "Purple Light" section renders as "Purple Dark"), while White text shifts to Black. Dark text on light backgrounds and light text on dark backgrounds are left alone, so the rule never overrides a deliberately readable pairing.

**Why this priority**: The contrast rule is what makes the palette usable without forcing every author to know which shade pair is readable. It eliminates the most common failure mode (unreadable text from a careless background pick) while preserving the brand-color flavor — a hue stays in the same family rather than collapsing to a flat black on every light background. It also lets the same component output the right color across light and dark sections without configuration.

**Independent Test**: Place a Heading with `color = "Black"` inside a Section with `background = "Purple Dark"`. Confirm the heading renders white. Change the section background to `Purple Light` and the heading color to `Purple Mid`; confirm the heading renders as `Purple Dark`. Change the section background to `Purple Mid` and confirm the same `Purple Mid` heading renders as `Purple Primary`.

**Acceptance Scenarios**:

1. **Given** a Section with background in {Dark, Primary, Black}, **When** a child text element has color in {Dark, Primary, Black}, **Then** the rendered text color is White.
2. **Given** a Section with background in {Dark, Primary, Black}, **When** a child text element has color in {Mid, Light, White}, **Then** the rendered text color is unchanged (stays as authored).
3. **Given** a Section with a Light background (e.g. Purple Light), **When** a child text element has a color in {_-Light, _-Mid} (any family), **Then** the rendered text shifts to the text's own family Dark shade (e.g. Purple Mid on Purple Light → Purple Dark; Green Light on Purple Light → Green Dark).
4. **Given** a Section with a Light background, **When** a child text element has color White, **Then** the rendered text color is Black.
5. **Given** a Section with a Light background, **When** a child text element has color in {_-Dark, _-Primary, Black}, **Then** the rendered text color is unchanged (stays as authored).
6. **Given** a Section with a Mid background or background White, **When** a child text element has a color in {_-Light, _-Mid} (any family), **Then** the rendered text shifts to the text's own family Primary shade (e.g. Purple Mid on Purple Mid → Purple Primary; Pink Light on White → Pink Primary).
7. **Given** a Section with a Mid background or background White, **When** a child text element has color White, **Then** the rendered text color is Black.
8. **Given** a Section with a Mid background or background White, **When** a child text element has color in {_-Dark, _-Primary, Black}, **Then** the rendered text color is unchanged (stays as authored).
9. **Given** a Container with a background nested inside a Section with a different background, **When** a text element is inside the Container, **Then** the contrast rule resolves against the Container's background (the nearest ancestor with a background wins).
10. **Given** the Primary font default currently uses `neutral-black`, **When** that default is migrated to the new Black token with contrast switching, **Then** the rendered text is visually identical on light backgrounds and white on dark backgrounds.

---

### User Story 3 - Override the Automatic Contrast Switch (Priority: P3)

A content author wants white text on a Light background (or some other deliberately low-contrast pairing) — for example, an artistic moment in a landing page. They use the existing `colorOverride` hex field on Heading or Paragraph (or its equivalent on other colorable components) to bypass the contrast rule and pin the rendered color.

**Why this priority**: Without an override, authors are locked into the rule and lose a small but real set of intentional design choices. The override path already exists on Heading and Paragraph as a hex field; this feature preserves that and clarifies that it sits above the contrast switch.

**Independent Test**: Place a Heading inside a Light-background Section, set `color = "White"` (which would normally switch to Black) and set `colorOverride = "#FFFFFF"`. Confirm the heading renders white.

**Acceptance Scenarios**:

1. **Given** a Heading with `colorOverride` set to a hex string, **When** it renders inside any Section/Container background, **Then** the override hex wins and no contrast switch is applied.
2. **Given** a Paragraph with `colorOverride` set, **When** it renders inside any Section/Container background, **Then** the override hex wins and no contrast switch is applied.
3. **Given** a component that does not currently expose `colorOverride` (e.g. Text Link, Simple List), **When** an author needs to bypass the contrast rule on that component, **Then** the rule still applies and the author's recourse is to change the background or accept the switched color (documented limitation; widening override coverage is out of scope here).

---

### Edge Cases

- **Legacy entries**: Existing Contentful entries using legacy color keys (`secondary`, `brand`, `neutral-black`, etc.) continue to render with their previous appearance — no migration is forced.
- **Primary font default migration**: The one intentional visible change is the Primary font default, which moves from `neutral-black` to the new `Black` token; the resulting appearance on light backgrounds is intended to be visually identical to today's output.
- **Rich Text**: Rich Text exposes no color picker. Body text inside Rich Text resolves through the contrast switch as if its authored color were Black — i.e. it passes through unchanged on light backgrounds and renders as White on dark backgrounds. Inline links and tables continue to use their own defined colors and are not affected by the contrast switch.
- **Nested backgrounds**: When a Container with a background sits inside a Section with a different background, the contrast rule resolves against the nearest enclosing background.
- **Component without a known enclosing background**: When a colorable component renders outside any Section/Container with a background (e.g. at the root of a page), the contrast switch behaves as if the background were White.
- **Per-brand Section variants**: The CS for All and Corporate Section components currently expose brand-specific background lists. This feature does not consolidate them; the new palette is added to the shared manifest and to native Container/Section, and the custom Section components remain on their existing per-brand lists for this pass.
- **Overline**: Overline currently uses an inline color list (Primary/Secondary/White) and not the shared manifest. This feature does not migrate Overline; Overline is unaffected and continues with its existing options. Migration is noted as deferred work.
- **Tenant / brand differences**: This feature targets the `code.org` tenant. `csforall` is deprecated and not modified behaviorally: its Studio dropdowns and CSS payload pick up the new options/variables (shared infrastructure) but no csforall content or component references them, and its Sections do not emit the new `data-bg-tone` attribute. Per-brand visual differences continue to flow through theme files; full per-brand isolation infrastructure (forked ContentfulDefinitions, split SCSS) was considered and rejected as unnecessary given the csforall deprecation timeline.
- **Storybook**: Storybook stories for affected components MUST cover at least one background-switched and one override case.
- **A11y**: The pairings produced by the contrast switch — Dark/Primary/Black vs White on dark backgrounds, family `*-dark` text on family or cross-family `*-light` backgrounds, family `*-primary` text on `*-mid` or White backgrounds, and Black from White — are presumed to clear WCAG AA contrast. A formal contrast audit is out of scope for this initialization pass and is logged as a follow-up.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The shared color manifest at `apps/marketing/src/components/common/colors.ts` MUST expose 22 brand color tokens: White, Black, and the 5 primary families (Purple, Blue, Green, Orange, Pink) each in Dark, Primary, Mid, and Light shades, at the hex values defined in the Brand Palette table below.
- **FR-002**: Each new token MUST carry the same shape as the existing entries in `BRAND_COLORS` (`value`, `displayName`, `cssVar`) so existing consumers and Contentful validation continue to work without per-call adjustment.
- **FR-003**: The corresponding CSS custom properties MUST be defined in the existing primitive-colors SCSS layer (`primitiveColors.scss`) so the manifest's `cssVar` references resolve to a real value at runtime.
- **FR-004**: The `BRAND_COLOR_OPTIONS` validation array fed to Contentful MUST include the 22 new options so they appear in author-facing dropdowns wherever the array is referenced.
- **FR-005**: Components currently consuming `BRAND_COLOR_OPTIONS` MUST surface the new options automatically: Heading, Paragraph, Text Link, Simple List (icon `type` and `textColor`), and the native Container/Section design tokens registered via `apps/marketing/src/contentful/registration/code.org/designTokens.ts`. The new options will appear in both tenants' Studio dropdowns because the underlying definitions are shared; this is acceptable per the Tenant Scope clause because csforall content does not consume them.
- **FR-006**: The custom Section component MUST allow the 22 brand colors as background options on the **Corporate Site** (code.org) variant only. The `apps/marketing/src/components/contentful/section/sectionCorporateSiteContentfulDefinition.ts` background option list is extended; the `sectionCSforAllContentfulDefinition.ts` background option list MUST remain untouched. Per-brand legacy background lists are preserved.
- **FR-007**: When the resolved enclosing background is one of {`*-dark`, `*-primary`, `black`}, child text whose color is one of {`*-dark`, `*-primary`, `black`} MUST render as White.
- **FR-008**: When the resolved enclosing background is a `*-light` shade, child text whose color is one of {`*-light`, `*-mid`} MUST render as that text's own family `*-dark` shade (preserving hue, increasing contrast). For example, `purpleMid` text on a `purpleLight` background renders as `purpleDark`; `greenLight` text on a `purpleLight` background renders as `greenDark`.
- **FR-009**: When the resolved enclosing background is a `*-mid` shade or `white`, child text whose color is one of {`*-light`, `*-mid`} MUST render as that text's own family `*-primary` shade. For example, `purpleMid` text on a `purpleMid` background renders as `purplePrimary`; `pinkLight` text on `white` renders as `pinkPrimary`.
- **FR-010**: When the resolved enclosing background is any light shade ({`*-light`, `*-mid`, `white`}), child text whose color is `white` MUST render as `black`.
- **FR-011**: When the resolved enclosing background is any light shade ({`*-light`, `*-mid`, `white`}), child text whose color is one of {`*-dark`, `*-primary`, `black`} MUST pass through unchanged.
- **FR-012**: When the resolved enclosing background is any dark shade ({`*-dark`, `*-primary`, `black`}), child text whose color is one of {`*-light`, `*-mid`, `white`} MUST pass through unchanged.
- **FR-013**: The contrast switch MUST resolve against the nearest enclosing background (Container preferred over Section when nested) and MUST treat "no enclosing background" as White.
- **FR-014**: An existing `colorOverride` hex field on a component MUST take precedence over both the dropdown color and the contrast switch.
- **FR-015**: The Primary font default in the **code.org** typography theme (`apps/marketing/src/themes/code.org/index.ts`) MUST be migrated from `neutral-black` to the new `Black` token wired to the contrast switch; no other typography or layout default may change. The csforall typography theme is NOT touched.
- **FR-016**: Rich Text MUST continue to expose no color picker. Body text inside Rich Text MUST render under the contrast switch (resolving as if its authored color were Black: passes through on light backgrounds, becomes White on dark backgrounds). Inline links and tables inside Rich Text MUST continue to use their existing defined colors and MUST NOT be re-routed through the brand-color switch.
- **FR-017**: Components that do not currently expose a color option (Button, Divider, section-level non-Section backgrounds, etc.) MUST NOT be modified by this feature. Adding color options to them is explicitly out of scope.
- **FR-018**: Existing in-use color values on existing Contentful entries MUST continue to render unchanged, with the single intentional exception of the Primary font default migration in FR-015.
- **FR-019**: The author-facing dropdown UI for the 22-color palette MUST remain a single dropdown by default; if usability testing shows the flat list is unworkable, a dual-control (family + shade) alternative MAY be considered, provided it does not require duplicating the field in the Contentful schema and does not add architectural cost beyond the current manifest.
- **FR-020**: The 22 brand colors MUST be defined once (in the shared manifest) and reused by both the MUI theme/CSS-variable layer and the Contentful field registrations — no parallel definition lists. Each token MUST carry enough metadata to resolve its family (Purple/Blue/Green/Orange/Pink/Black/White) and shade (Dark/Primary/Mid/Light/n-a) so the contrast switch can shift within a family without a separate lookup table.
- **FR-021**: All color-aware work MUST stay on the existing MUI-based component stack — no alternative styling system is introduced and no major refactor of the theme layer is performed in this pass.
- **FR-022**: Affected components MUST have Storybook coverage for at least one "contrast-switch shifted within family" case (e.g. Purple Mid text on Purple Light background rendering as Purple Dark), one "contrast-switch to white on dark background" case, and one "contrast-switch passes through" case. Heading and Paragraph additionally MUST have coverage for the `colorOverride` path.
- **FR-023**: Accessibility expectations: the pairings produced by the contrast switch (Dark/Primary/Black vs White on dark backgrounds; family `*-dark` vs `*-light` background; family `*-primary` vs `*-mid` or White background; Black vs White from a White text input) are presumed AA-compliant. This feature does not re-audit them. A follow-up contrast audit is logged as a future task but does not block this work.
- **FR-024**: No new Contentful writes are required by this feature. All changes are application-code only; existing entries continue to validate against the expanded `BRAND_COLOR_OPTIONS` because the existing options remain valid members of the new, larger set.
- **FR-025**: SEO is unaffected — no page-level metadata, canonical behavior, structured data, or sitemap behavior changes.
- **FR-026**: Privacy is unaffected — no personal data, Student Records, or third-party data flows are introduced or altered.

### Brand Palette

| Family | Dark    | Primary | Mid     | Light   |
| ------ | ------- | ------- | ------- | ------- |
| Purple | #1F1976 | #4C42CF | #ACA8EA | #E4E2F8 |
| Blue   | #06338D | #0099F3 | #6FCAFF | #D5EFFF |
| Green  | #003F25 | #34BD43 | #7CDB87 | #CCF1D0 |
| Orange | #510000 | #F46800 | #FFA868 | #FFE3CE |
| Pink   | #921149 | #E62378 | #F07FB0 | #FBDAE8 |

Plus: **Black** `#000000`, **White** `#FFFFFF`.

## Integration Points _(mandatory when external systems or cross-workspace changes are involved)_

### Systems and Contracts

- **Upstream Inputs**: Contentful entries with `color` / `background` / `textColor` / `type` fields on Heading, Paragraph, Text Link, Simple List, native Container, native Section, and custom Section. No new Contentful field types are introduced.
- **Downstream Effects**: Browser-rendered text and background colors on the marketing pages; CSS custom properties exposed under the `--codeai-*` namespace.
- **Runtime Surfaces**: `apps/marketing/src/components/common/colors.ts` (manifest), the SCSS primitives layer, the affected component files under `apps/marketing/src/components/contentful/`, the Contentful registration layer under `apps/marketing/src/contentful/registration/code.org/designTokens.ts`, the typography theme defaults under `apps/marketing/src/themes/code.org/` and `apps/marketing/src/themes/csforall/`, and Storybook stories under `apps/marketing-storybook/stories/`.
- **Tenant / Hostname Paths**: This feature targets the `code.org` brand tenant (e.g. `http://code.org.marketing-sites.localhost:3001`). The `csforall` tenant (`http://csforall.marketing-sites.localhost:3001`) is deprecated and is verified to render unchanged. The shared manifest and SCSS layer are loaded on csforall but produce no visible difference because no csforall content or component references the new tokens/variables. Per-brand variation continues to flow through theme files and per-brand component definitions (Corporate Site vs CS for All Section variants).

### Data Flow Notes

- Contentful (read-only for this feature) provides existing entries with their existing color values. The new manifest expands the validation set but does not invalidate any existing value.
- The contrast switch resolves at render time on the server-rendered path (Next.js SSR): given the enclosing background and the authored text color, the resolved text color is decided server-side and emitted in the HTML; no client-only execution is added.
- No Contentful writes are performed by this feature; no MCP-confirmed Contentful changes are required. The follow-on rebrand of individual entries (where authors want to switch to brand colors) is human-driven in Contentful Studio and out of scope here.
- SEO metadata, canonical/indexing behavior, structured data, and sitemap behavior are untouched.
- Privacy posture, consent banners, and third-party data flows are untouched.
- Cache headers and revalidation windows remain unchanged.

### Key Entities

- **Brand Color Token**: A named entry in `BRAND_COLORS` with a stable `value` key (e.g. `purplePrimary`), a `displayName` for the Contentful dropdown (e.g. "Purple Primary"), and a `cssVar` pointing into the SCSS primitives layer. Tokens also carry enough metadata (family + shade, or an equivalent representation) to drive the contrast switch's family-aware shifting.
- **Color Family**: A grouping of four tokens that share a hue — Purple, Blue, Green, Orange, Pink. Each family has a Dark, Primary, Mid, and Light shade. Black and White stand alone and are not part of a family.
- **Color Shade**: One of `dark`, `primary`, `mid`, `light` for family tokens; `n/a` for Black and White. Used by the contrast switch to decide both whether to switch and which target shade to render.
- **Background Tone**: A derived attribute of the resolved enclosing background — `dark-tone` ({`*-dark`, `*-primary`, `black`}), `light-bg-tone` ({`*-light`}), or `mid-bg-tone` ({`*-mid`, `white`}) — used as the lookup key for the contrast-switch decision.
- **Background Context**: The nearest enclosing rendered element with a background color from the brand manifest. Resolved per render tree, used as the input to the contrast switch.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A content author can pick any of the 22 brand colors in the color dropdown of every affected component (Heading, Paragraph, Text Link, Simple List, native Container, native Section, custom Section) and see the choice render correctly, on first try, in Storybook and on a preview page.
- **SC-002**: For every pairing in the contrast-switch rule (FR-007 through FR-013), a Storybook example renders the expected readable color with no manual intervention. The matrix includes: (a) dark background + dark/primary/black text → White; (b) `*-light` background + cross-family `*-light`/`*-mid` text → text-family `*-dark`; (c) `*-mid` or White background + `*-light`/`*-mid` text → text-family `*-primary`; (d) any light background + White text → Black; (e) any pairing where text already contrasts with the background passes through unchanged.
- **SC-003**: No existing Contentful entry that currently renders correctly shows a visual change after this feature ships, except for the Primary font default migration (FR-015), which is visually identical on light backgrounds.
- **SC-004**: The brand palette is defined exactly once in the codebase (in `colors.ts` plus its SCSS primitives), with no duplicate hex lists in component definitions, theme files, or Contentful registrations.
- **SC-005**: Components not currently exposing a color option (Button, Divider, etc.) show no new field, no new prop, and no visual change in Storybook or on staged pages.
- **SC-006**: The author-facing dropdown for the 22-color palette is rendered as a single control by default; if a dual-control alternative is adopted, it is implemented without duplicating the field in the Contentful schema.

## Assumptions

- The single source of truth established in commit `ff2d67ee` (the `BRAND_COLORS` manifest at `apps/marketing/src/components/common/colors.ts`) is the correct file to extend; no parallel new manifest is created.
- "Recently-updated components" refers to those touched on the `dee/brand-color-system-init` branch (Heading, Paragraph, Text Link, Simple List, Overline, native Container, custom Section). Overline is included in the brief by reference but is excluded from this pass because it does not consume the shared manifest today; migrating Overline to the manifest is a follow-up.
- The Section component's existing per-brand background lists (CS for All and Corporate variants) remain in place for this pass; the new brand palette is added as additional options on the **Corporate Site** definition only. The **CS for All** definition is untouched.
- **csforall isolation is soft**: shared infrastructure (the `BRAND_COLOR_OPTIONS` array, the shared SCSS primitives, the shared `ContentfulDefinition` files for Heading/Paragraph/Link/SimpleList) is NOT forked per brand. csforall content authors will see the new options in their Studio dropdowns and csforall pages will load the new CSS variables, but no csforall content uses them and `Section.tsx` does not emit the new `data-bg-tone` attribute on csforall background values, so csforall rendered pages do not change. Hard isolation (factory refactor + SCSS split) was considered and rejected given csforall's deprecation timeline.
- Contentful Studio renders the expanded `BRAND_COLOR_OPTIONS` as a single dropdown without further configuration; if the rendered control is unworkable at 22 options, the dual-control alternative is in-scope to design but not pre-decided.
- The `colorOverride` hex pattern already on Heading and Paragraph is the correct override mechanism; widening it to Text Link, Simple List, and the Section components is deferred.
- The contrast switch is implemented server-side and reads the enclosing background via either a React context, a CSS variable cascade, or MUI's nested ThemeProvider — the exact mechanism is an implementation decision for the planning phase, not a spec-level constraint, provided the SSR path remains intact.
- No new Contentful field types, no schema migrations, and no MCP-confirmed Contentful writes are part of this feature.
- The shared component-library workspace is not modified by this feature; all changes live in the `apps/marketing` app.
- Visual regression coverage continues to flow through the existing `marketing/storybook-eyes` pipeline; new stories produced by this feature will require baseline acceptance in the Applitools dashboard as part of CI.
- A formal WCAG AA contrast audit of the 22-color palette and its switch pairings is out of scope for this initialization; the pairings are presumed compliant pending that follow-up.
