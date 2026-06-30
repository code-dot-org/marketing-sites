# Feature Specification: Custom Text component

**Feature Branch**: `010-custom-text`  
**Created**: 2026-06-29  
**Status**: Draft  
**Input**: User description: "The next new component will be called Custom Text... a catch-all for all non-heading and non-body text elements... a dropdown selector for the options that will display per each option default... ability to override individual design options like text color, background color, text size, font, etc... colors/fonts/text sizes follow our MUI-based theme... contrast-switching unless the element has a background... icons on the left or right inheriting text color... predefined types: Custom, Subtitle, Overline, Statistic, Course Topics, Course Labs... HTML tag customizable (default `<span>`, Subtitle defaults to `<p>`)... background styles use a border color with a fixed 2px border width."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Author a predefined text style from a dropdown (Priority: P1)

A content author building a page in Contentful Studio needs a small text element that is neither a heading nor a body paragraph (for example, an overline label above a section, or a large statistic number). They add a Custom Text component, type their text, and choose a type from a dropdown (Custom, Subtitle, Overline, Statistic, Course Topics, Course Labs). The element immediately renders with that type's predefined styling — color, size, font, weight, casing, and semantic tag — with no further configuration required.

**Why this priority**: This is the core value of the component. Without it, authors would keep hand-building these elements out of Containers wrapped around Headings/Paragraphs. A working dropdown with sensible per-type defaults is the minimum viable product and is independently shippable.

**Independent Test**: In Studio, add a Custom Text component, enter text, and select each of the six types in turn. Confirm each renders with its distinct default appearance and correct semantic tag, with the page still rendering server-side.

**Acceptance Scenarios**:

1. **Given** a new Custom Text component with no overrides, **When** the author selects the "Overline" type, **Then** the text renders with the Overline default styling (size, color, font, weight, casing) and its default semantic tag.
2. **Given** a Custom Text component, **When** the author selects "Subtitle", **Then** the element renders using `<p>` as its default semantic tag while all other types default to `<span>`.
3. **Given** a Custom Text component set to any type, **When** no type is explicitly selected, **Then** the component falls back to the "Custom" type default.

---

### User Story 2 - Override individual style options without losing other defaults (Priority: P1)

After choosing a type, an author needs to tweak a single visual property — for instance, change only the text color, or only the size — for a specific instance, while keeping every other default from the selected type intact.

**Why this priority**: The "override one thing, keep the rest" behavior is the second half of the component's reason to exist and is what avoids per-instance custom builds. It is tightly coupled to Story 1 and is required for the component to be useful in real layouts.

**Independent Test**: Select a type, then set a single override (e.g., text color). Confirm only that property changes and all other type defaults remain. Repeat for each override field independently.

**Acceptance Scenarios**:

1. **Given** a Custom Text set to "Statistic", **When** the author overrides only the text color, **Then** the color changes but the Statistic default size, font, weight, and tag are retained.
2. **Given** a Custom Text with a text-size override applied, **When** the author clears that override, **Then** the size reverts to the selected type's default.
3. **Given** a Custom Text of any type, **When** the author overrides the HTML tag, **Then** the rendered semantic element changes to the chosen tag while styling is unaffected; the tag behaves like any other override field (overridable on every type, including Subtitle's `<p>` default).
4. **Given** all override fields use theme values (color tokens, theme text-size steps such as `xs`/`sm`/`md`, theme font choices), **When** an author edits any override, **Then** no manual pixel/hex entry is required to express a valid value.

---

### User Story 3 - Backgrounded text with border, and contrast-aware text color (Priority: P2)

An author needs a text element that sits on a colored chip/pill background (e.g., a Course Topics or Course Labs label). When they set a background color, the element gains a border (using a separately chosen border color) at a fixed 2px width. When there is no background, the text color automatically adapts to the enclosing section background for readable contrast, matching the rest of the design system.

**Why this priority**: Backgrounded "chip" styles are needed for the Course Topics / Course Labs use cases, but the component delivers value (Stories 1 and 2) before this is in place, so it is P2.

**Independent Test**: Place a Custom Text on light and dark section backgrounds with no element background and confirm the text color contrast-switches. Then set a background color and a border color and confirm a 2px border renders and the contrast-switch no longer applies to the text.

**Acceptance Scenarios**:

1. **Given** a Custom Text with no background color, **When** it is placed on a dark section background, **Then** its text color follows the existing contrast-switching convention for legibility.
2. **Given** a Custom Text with a background color set, **When** the author also sets a border color, **Then** a 2px border in that color renders around the element and the text color is applied directly (no contrast switch).
3. **Given** a Custom Text with a background color set, **When** the author attempts to change the border width, **Then** no border-width control is available and the width remains 2px.

---

### User Story 4 - Single leading or trailing icon that matches the text color (Priority: P2)

An author needs a small icon before or after the text (e.g., a marker beside a Course Labs label). They provide an icon name for either the left or the right side. The icon renders inline with the text and takes the same color as the resolved text color.

**Why this priority**: Icons enrich specific use cases but are not required for the component to be useful; text-only Custom Text is already valuable.

**Independent Test**: Add a left icon name and confirm the icon renders before the text in the text color; clear it and add a right icon name and confirm it renders after the text in the text color.

**Acceptance Scenarios**:

1. **Given** a Custom Text with a left icon name set, **When** the element renders, **Then** the icon appears before the text and inherits the resolved text color.
2. **Given** a Custom Text with a right icon name set, **When** the element renders, **Then** the icon appears after the text and inherits the resolved text color.
3. **Given** a Custom Text, **When** the author provides both a left and a right icon name, **Then** the component renders a single icon (only one side is supported at a time) per the documented precedence, rather than icons on both sides.

---

### Edge Cases

- **No text content**: The element renders nothing meaningful; the component should not break the page when text is empty.
- **Override conflicting with type**: When an override is set and later the type is changed, the override persists and continues to take precedence over the new type's default for that one property.
- **Border color set without background**: Border styling is only meaningful with a background; with no background, the border is not rendered.
- **Icon name invalid or unknown**: An unrecognized icon name degrades gracefully (no icon / no layout break) rather than erroring the page.
- **Both icon sides populated**: Resolved to a single icon via documented precedence (left wins unless specified otherwise), never both.
- **Contrast switch vs. transparent section**: On a transparent/unknown enclosing background, the contrast switch is bypassed and the chosen/default text color is used as-is.
- **Tenancy/locale/content states**: Behavior is identical across tenants and locales; the component is presentational and reads enclosing section background context the same way existing text components do, including in preview/draft.
- **Server rendering**: The component renders on the server-rendered path; any Studio client boundary must not force the element itself client-only.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The component MUST provide a type dropdown with exactly these options: Custom, Subtitle, Overline, Statistic, Course Topics, Course Labs, defaulting to "Custom" when unset.
- **FR-002**: Each type MUST carry a complete set of default style values (text color, text size, font, weight, casing where applicable, default semantic tag, and any default background/border for backgrounded types) so that selecting a type alone produces a finished element.
- **FR-003**: The component MUST allow per-property overrides for at least: text color, background color, border color, text size, font, font weight, HTML/semantic tag, and the leading/trailing icon name(s).
- **FR-004**: Each override MUST affect only its own property; all other properties MUST retain the selected type's default. Clearing an override MUST restore that property to the type default.
- **FR-005**: All color, font, and text-size values (defaults and overrides) MUST be expressed using the existing MUI-based theme tokens and scales (e.g., theme text-size steps `xs`/`sm`/`md`/… rather than raw pixels; brand color tokens rather than raw hex), with no manual px/hex entry required for valid authoring.
- **FR-006**: The HTML element tag MUST be customizable, defaulting to `<span>` for all types except Subtitle, which MUST default to `<p>`; the tag MUST be overridable on every type using the codebase's existing variable-tag mechanism (the MUI `component` prop pattern used by Heading/Paragraph), behaving like any other override field.
- **FR-007**: When no element background is set, text color MUST follow the existing contrast-switching convention (adapting to the enclosing section background) used by the current text/icon components; when an element background is set, the text color MUST be applied directly without contrast switching.
- **FR-008**: When a background color is set, the element MUST render a border using a separately authored border color at a fixed 2px width, with no width override exposed to authors.
- **FR-009**: The component MUST support a single inline icon positioned either leading or trailing the text, configured by an icon-name field per side, with no additional per-icon style fields (icon color is inherited from the resolved text color). Both sides MUST NOT render simultaneously.
- **FR-010**: The component MUST be authorable in Contentful Studio with grouped, constrained fields (dropdowns with fixed option lists and explicit defaults) consistent with existing component definitions, and MUST be registered for the code.org brand.
- **FR-011**: This is a new React component in the marketing Contentful component layer (`apps/marketing/src/components/contentful/`), built on the existing MUI-based component stack and reusing existing color/contrast, theme-token, and icon utilities rather than introducing parallel primitives; shared design-system changes are out of scope unless a reused utility requires a minimal, justified extension.
- **FR-012**: The component MUST render on the existing server-rendered path; no new browser-only dependency or client-only hydration boundary is introduced beyond what the existing text components already rely on (e.g., enclosing-section background context).
- **FR-013**: The component introduces no personal data, Student Records, consent, or FERPA-relevant data handling; it is purely presentational, so no new Privacy Policy impact applies.
- **FR-014**: Required validation surfaces MUST include Storybook stories (covering each type, a representative set of overrides, backgrounded/bordered and icon variants, and light/dark section backgrounds), Jest unit tests for the style-resolution and tag/contrast/icon-precedence logic, and Studio preview verification; visual-diff coverage MUST be considered consistent with the repo's existing storybook-eyes gate.
- **FR-015**: Accessibility MUST meet WCAG AA: contrast-switched and backgrounded color combinations MUST remain legible, semantic tag choices MUST not be used to fake heading hierarchy, and icons MUST be decorative/non-essential to meaning unless labeled.
- **FR-016**: A new Contentful content type / component definition is required. The exact field schema MUST be confirmed against Contentful before any write; any Contentful schema change MUST follow the human-confirmation-then-re-read workflow (the team applies/approves the model change; the result is re-read via Contentful MCP). No automated Contentful writes are performed without that confirmation.
- **FR-017**: The component has no SEO/metadata, canonical, indexing, structured-data, or sitemap impact beyond rendering inline text within already-indexed pages; existing page-level SEO behavior MUST remain unchanged.

## Integration Points _(mandatory when external systems or cross-workspace changes are involved)_

### Systems and Contracts

- **Upstream Inputs**: A new Contentful component/content type ("Custom Text") with fields for text content, type selector, and the override set (text color, background color, border color, text size, font, font weight, HTML tag, leading icon name, trailing icon name). Enclosing section background is read from existing React context, not a Contentful field.
- **Downstream Effects**: None beyond rendered DOM. No new cache tags, analytics events, redirects, or third-party scripts.
- **Runtime Surfaces**: New component folder under `apps/marketing/src/components/contentful/custom-text/`; registration in the code.org brand registration file; Storybook stories; Jest tests. No middleware, route handler, or provider changes.
- **Tenant / Hostname Paths**: Renders identically across `http://[brand].marketing-sites.localhost:3001` and `http://preview-[brand].marketing-sites.localhost:3001`.

### Data Flow Notes

- The component receives its fields from Contentful at render time and resolves a final style set by layering authored overrides on top of the selected type's defaults, then applying contrast-switching (text-color-only, when no element background is present) using the enclosing section background context.
- Failure modes (empty text, unknown icon name, conflicting icon sides, border color without background) degrade gracefully without breaking the page.
- SSR, caching, and preview/draft boundaries remain intact; the component reuses the same section-background context mechanism as existing text components.
- Contentful schema specifics are to be confirmed via Contentful MCP during planning; the new content type is treated as a human-confirmed write followed by an MCP re-read, not an automated change.
- No SEO metadata, canonical, structured-data, or sitemap behavior changes.

### Key Entities _(include if feature involves data)_

- **Custom Text type**: A named preset (Custom, Subtitle, Overline, Statistic, Course Topics, Course Labs) that maps to a complete default style set (text color, size, font, weight, casing, default semantic tag, and any default background/border).
- **Style override set**: The per-instance authored values that selectively replace individual properties of the chosen type's defaults; absence of a value means "use the type default."
- **Resolved style**: The final computed appearance = type defaults with overrides layered on, plus contrast resolution and (when applicable) border/background rules.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An author can produce any of the six predefined text styles by entering text and selecting a type, with zero additional configuration, in under 30 seconds.
- **SC-002**: For every override field, changing that one field leaves all other resolved properties identical to the type default in 100% of cases (verified by tests covering each field).
- **SC-003**: Authors can build the previously hand-assembled non-heading/non-body text elements (overlines, subtitles, statistics, course topic/lab labels) entirely with this single component, eliminating the need to wrap Headings/Paragraphs in custom Containers for these cases.
- **SC-004**: Text remains legible (meets WCAG AA contrast) across all predefined types on the supported light and dark section backgrounds, with and without an element background.
- **SC-005**: The component renders on the server-rendered path and passes the existing Storybook visual-diff and Jest test gates before merge.

## Assumptions

- The exact default style values for each of the six types (specific color tokens, size steps, fonts, weights, casing, and any default chip background/border for Course Topics / Course Labs) come from the design/Figma source and will be finalized during planning; this spec fixes the override behavior and theme-token constraints, not the literal per-type values.
- "Contrast-switching unless the element has a background" reuses the existing `useSectionBackground` + resolved-brand-color mechanism already used by Heading/Paragraph/Icon, rather than introducing a new contrast system.
- The variable HTML tag is implemented with the existing MUI `component` prop pattern (as used by Heading/Paragraph), not a custom `as` prop.
- Icons reuse the existing Icon utility and Font Awesome icon-name convention; the icon-name field is the only per-side input, and icon color is inherited from the resolved text color.
- When both a leading and trailing icon name are provided, the component renders only one (leading takes precedence) to enforce the "never both sides" rule; the precise precedence can be adjusted in planning.
- This component lives in the marketing Contentful layer for the code.org brand; no shared component-library change is required beyond possibly reusing/extending existing utilities minimally.
- Existing cache headers, revalidation windows, SSR behavior, and privacy posture remain unchanged; no new personal-data collection or third-party sharing is introduced.
