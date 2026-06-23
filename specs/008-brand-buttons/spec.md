# Feature Specification: Brand Buttons & Brand Text Link

**Feature Branch**: `008-brand-buttons`
**Created**: 2026-06-22
**Status**: Draft (Clarified)
**Input**: User description: "We need to build the new button capabilities to match to the new branding. This will be for the code.org website only. CSForAll shouldn't be affected… Buttons will have the following design options: Size (Small/Medium/Large/Extra Large), Color (Default-Purple/Black/White), Type (Primary/Secondary/Tertiary), Icon-only boolean, Icon Position (Left/Right), Icon Name (FA). Background and border colors per state… Font Space Grotesk, 8px corner radius (tokenized). Use Figma → Brand Buttons." Subsequent clarification: "Use the colors in Figma — those are final. Also, build the updates to Text Link component so we have a cohesive solution."

## Clarifications

### Session 2026-06-22

- Q: Use Figma colors as authoritative, or keep placeholder/brand-variable indirection in SCSS? → A: Figma colors are final; SCSS encodes the exact hex/token grid extracted from `Aw6YXqpx6QFlNMXqCKk60e` node `7:3976`. The per-state token grid is recorded in `data-model.md` and `research.md`.
- Q: Is Text Link in scope for this feature, or kept in a separate follow-up spec? → A: In scope. Build the Text Link updates in this same feature for a cohesive solution.
- Q: How should existing Text Link Contentful entries be migrated (current schema offers 22 universal CodeAI brand colors via `brandTextColorOptions`)? → A: Narrow to 3 Hierarchies (`color` / `black` / `white`) matching Figma; auto-map at render time. Existing `color="primary"` (the legacy alias for `purplePrimary`) auto-maps to the new `color` (purple) Hierarchy with contrast-switch ON (purple on light Sections; white on dark Sections). Existing `color="default"` (black-with-switch) auto-maps to the new `black` Hierarchy with contrast-switch ON (black on light; white on dark). Existing `color="white"` auto-maps to the new `white` Hierarchy with contrast-switch OFF. Other brand-color values have no real entries built against them; they collapse to the `color` (purple) Hierarchy as a fallback. Authors do not need to re-open any entry. Reuse the existing `useSectionBackground` + `resolveTextColorForBackground` plumbing from spec 006 for the two switching Hierarchies.
- Q: Does the contrast-switch decision differ between Buttons and Text Link? → A: Yes. **Buttons: contrast switch OFF** (manual color updates per usage — already specced in FR-011). **Text Link: contrast switch ON for `color` and `black` Hierarchies; OFF for `white` Hierarchy** (preserves the existing Text Link behavior; links are inline text and need to adapt to varied Section backgrounds the way Heading/Paragraph do).
- Q: Should the Text Link size scale align with Buttons (S/M/L/XL) or stay as today (XS/S/M/L)? → A: Text Link exposes **`s` / `m` / `l`** only (3 sizes — no XS, no XL), matching the Figma Brand Link spec. Existing `xs` entries auto-map to `s` at render time. Buttons keep their full `s`/`m`/`l`/`xl`. Studio shows "Small / Medium / Large" for Text Links and "Small / Medium / Large / Extra Large" for Buttons.
- Q: Are the new Button options (size, type, color, icon names, icon-only) added to a Contentful **content type** for `button`, or are they Component Definition variables? → A: **Component Definition variables only.** There is **no `button` content type in Contentful** — the Button is a Contentful Experiences component whose options are hard-coded in `ButtonLegacyContentfulComponentDefinition.variables` and appear in Studio's **Design tab** (the `group: 'style'` variables). The **Content tab** keeps the existing bindable fields (`text`, `href`, `isLinkExternal`, `ariaLabel`); these can bind to a Link content-type entry's fields (the existing pattern) or be authored manually. The same model applies to the new Text Link rebrand: no `link` content type change either — the Hierarchy narrowing happens entirely in the per-tenant Component Definition exported from `LinkContentfulDefinition.ts`. **No Contentful Studio schema work is required for this feature.** No human-applied schema delta; no `ctf_get_content_type` re-read step. Every "schema" change is a code edit to the ComponentDefinition's `variables` object.

## Overview

This feature replaces the current code.org Button **and Text Link** visuals and capability surfaces with the new CodeAI **Brand Buttons** specification from the CodeAI Design System Figma file (component set _Brand Buttons_, node `7:3976`, which contains both Button Hierarchies and Link Hierarchies). It is the button-level continuation of the broader CodeAI rebrand work tracked under spec 006 (Brand Color System) and follows the same pattern: shared design-system primitives in `packages/component-library/src/button/` and `apps/marketing/src/components/contentful/link/`, consumed by both the Contentful authoring surfaces and by direct in-code call sites.

The scope is wholly the **code.org** tenant. The CSforAll tenant continues to render with its current button + link styling and is not touched by this feature — CSforAll is being deprecated separately and any visual changes to it are explicitly out of scope.

The intent is to **update in place** rather than parallel-version. Two shared primitives are touched:

1. **Button** — the existing `Button` / `LinkButton` exports from `@code-dot-org/component-library/button` are re-skinned and extended to expose the full Brand Buttons matrix (4 sizes × 3 colors × 3 types × 5 states × icon-only vs with-text × left/right icon position). The existing code.org Contentful `button` entry (currently `ButtonLegacyContentfulComponentDefinition`, id `button`) is updated by **expanding its schema with new fields whose defaults preserve every previously-authored entry's visual intent** — authors do not need to re-open or re-publish existing pages.
2. **Text Link** — the existing `Link` component at `apps/marketing/src/components/contentful/link/Link.tsx` (Contentful id `link`, display name `Text Link`) is re-skinned and **narrowed** to the 3 Brand Link Hierarchies (`color`/purple, `black`, `white`) × 5 states × 3 sizes (`s`/`m`/`l` — no XS, no XL per Figma). The existing 22-color brand palette picker is replaced by an internal mapping at render time so existing entries continue to render without author re-editing. The contrast switch (introduced by spec 006) stays ON for the `color` and `black` Hierarchies and OFF for `white`.

The Figma per-state token grid (background / border / text / focus-ring / per-size dimensions for every cell) is recorded in **`specs/008-brand-buttons/figma-tokens.md`** and is **final** — the SCSS implementation lands the exact hex values from Figma as new CSS custom properties (under `packages/component-library-styles/`) rather than reusing universal brand-color variables or placeholder fallbacks.

Three things are intentionally **not** in scope:

1. **Background-aware contrast switching for Buttons.** Unlike Heading / Paragraph / Icon / Text Link — which auto-flip color based on the enclosing Section background per the contrast-switch system from spec 006 — Buttons remain manually colored. Authors pick the button color explicitly per usage; if a section background changes later, button colors stay until an author updates them. The team has confirmed this is acceptable for buttons given how prominently styled they are and how few sit on color-shifting backgrounds.
2. **Icon-only mode on Text Link.** Text Link always renders text (with optional left/right icon). Authors who want an icon-only clickable element use the Button with `isIconOnly=true`. Keeps the Text Link API clean and avoids two ways to render the same visual.
3. **The destructive Brand Buttons variant** (a separate Figma component set, `Destructive Button` node). The existing `destructive` color in `packages/component-library/src/button/types.ts` is preserved for downstream consumers that already depend on it (admin/dialog flows in the design system); its visual treatment may diverge from Brand Buttons until a follow-up spec aligns it.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Render the New Brand Button Across the Full Variant Matrix (Priority: P1)

A frontend developer or designer needs to see the new Brand Button rendered in every size, type, color, state, and icon configuration to confirm the implementation matches Figma. Opening the design-system Storybook, they pick a Button story and step through size (S/M/L/XL), type (Primary/Secondary/Tertiary), color (Default-Purple/Black/White), icon-only on/off, icon position (Left/Right), and observe the visual treatment for the resting state and for the hover, focus, disabled, and loading states.

**Why this priority**: This is the foundational payload. Until the design-system primitive renders the new visuals correctly across the matrix, every downstream consumer (Contentful authoring, in-code forms, carousels) is blocked. All other stories build on this one.

**Independent Test**: Open `apps/design-system-storybook` (or the equivalent Brand Buttons story file in `apps/marketing-storybook`), select Brand Button, and verify that each of the 4 sizes × 3 types × 3 colors cells renders with the correct background, border, text color, padding, font size, font weight, text case, icon size, and gap. Trigger hover / focus / disabled / loading on each cell and confirm the per-state treatment matches the Figma frame for that variant.

**Acceptance Scenarios**:

1. **Given** the Brand Button story in Storybook, **When** a developer selects `size=md`, `type=primary`, `color=purple`, `state=default`, `icon-only=false`, **Then** the rendered button matches the Figma `md/Primary/Default/icon=False` frame in background, border, text color, padding, font size, font weight, text case, and corner radius (8px).
2. **Given** any cell of the 4×3×3 size×type×color matrix, **When** the user hovers, focuses (via keyboard), disables, or sets `isPending`, **Then** the rendered button matches the matching Figma state frame for that cell.
3. **Given** `icon-only=true` with `iconName="arrow-right"`, **When** the button renders at each of the 4 sizes, **Then** the button is a square with the size-specific icon-only footprint (no text rendered, accessible name supplied via `ariaLabel`).
4. **Given** an icon-with-text button at `iconPosition="left"` or `iconPosition="right"`, **When** it renders, **Then** the icon sits on the chosen side with the size-specific gap between icon and label, and the size-specific icon size.
5. **Given** the corner radius is referenced via a single token, **When** that token's value is updated in one place (the shared style file identified in the plan), **Then** every Brand Button instance — across types, colors, sizes, and icon configurations — picks up the new radius without per-component edits.
6. **Given** the button font, **When** any Brand Button renders, **Then** the label uses Space Grotesk with the size-specific font size, weight, line height, letter-spacing, and text case from Figma.

---

### User Story 2 — Existing Contentful Button Instances Render in the New Style Automatically (Priority: P1)

A content author has hundreds of existing code.org pages where Button components are composed inside Experience entries (with stored Design-tab values for color/type plus stored Content-tab values for text/href/isLinkExternal/ariaLabel/iconLeftName). They publish nothing new. After this feature merges, every existing Button on every existing code.org Experience re-renders with the new Brand Button visuals, and no author has to open Studio, re-pick fields, or re-publish anything. Old stored values map to the new Component Definition defaults for missing variables.

**Why this priority**: The user explicitly called this out: "We may need to consider mapping them in a way to where we don't need to update the existing buttons within each experience, and we should be able to avoid needing to retain anything as legacy." Without zero-touch migration, the rebrand creates hundreds of cleanup tickets across the marketing team. This is co-P1 with Story 1.

**Independent Test**: With no edits to any existing Contentful entry, deploy the new build to preview and walk through a representative set of code.org pages (homepage, hour-of-code, professional-learning, a teacher landing, an ad landing). Confirm every previously-existing button on those pages renders with the new Brand Button visuals, at the correct mapped size and type, in the correct color, with any author-set left icon still present, and with no console errors.

**Acceptance Scenarios**:

1. **Given** an existing Experience entry containing a Button instance with stored values `{color: "purple", type: "primary", text: "Get Started", href: "/learn"}`, **When** the page renders post-deploy, **Then** the Button renders as a Brand Button `Primary` (Default color) at the new default size (`m`), with text "Get Started", linking to `/learn`.
2. **Given** an existing Button with stored `{color: "white", type: "secondary"}` and no other style values set, **When** the page renders, **Then** the Button renders as a Brand Button `Secondary White` at the default size `m`.
3. **Given** any existing Button whose stored `color` is one of `purple` / `black` / `white` and whose `type` is `primary` / `secondary`, **When** the page renders, **Then** the visual maps directly to the matching new Brand Button cell with no Studio intervention.
4. **Given** an existing Button's stored `iconLeftName` is a Font Awesome icon name (including a brands-family icon like `github`), **When** the page renders, **Then** the icon renders on the left using the existing brand-family detection (`fontAwesomeV6BrandIconsMap`), at the new size-appropriate icon size.
5. **Given** an existing Button with stored `isLinkExternal: true`, **When** the page renders, **Then** the link still opens in a new tab with `rel="noopener noreferrer"` and the external-link icon appears on the right (matching today's behavior, modulo FR-019's author-right-icon precedence rule).

---

### User Story 3 — Content Author Picks Size, Tertiary Type, Icon Position, and Icon-Only in Contentful (Priority: P2)

A content author opens an existing or new page in Contentful Studio, drags a Button (or selects an existing one), and picks from the expanded option set: **Size** (S / M / L / XL), **Type** (Primary / Secondary / **Tertiary**), **Color** (Default-Purple / Black / White), an optional Font Awesome icon name, **Icon Position** (Left / Right) when an icon is present, and an **Icon Only** boolean that hides the label entirely (for icon-only square buttons). The label, link URL, external-link flag, and aria-label remain authorable as today.

**Why this priority**: This is the new author-facing capability surface — the reason the rebrand expands beyond a re-skin. It depends on Story 1 (the underlying primitive) but is independent of Story 2 (existing entries get reasonable defaults even without authors touching them).

**Independent Test**: In Contentful Studio's experience editor for the code.org tenant, drag a Button into a Section, set Size to `XL`, Type to `Tertiary`, Color to `Black`, Icon Name to `arrow-right`, Icon Position to `Right`, Icon Only to `false`, and confirm the rendered button matches the Figma `xl/Tertiary Black/Default/icon=False with right-icon` frame. Toggle Icon Only to `true`, leave Icon Name set, blank the Text field, and confirm the button renders as a square XL icon-only Tertiary Black button.

**Acceptance Scenarios**:

1. **Given** the Button component definition for code.org, **When** an author opens the Style group in Studio, **Then** Size offers `Small`, `Medium`, `Large`, `Extra Large`; Type offers `Primary`, `Secondary`, `Tertiary`; Color offers `Default` (purple), `Black`, `White`.
2. **Given** the Style group, **When** an author opens it, **Then** Icon Name is a text input, Icon Position offers `Left` / `Right` (default `Left`), and Icon Only is a Boolean (default `false`).
3. **Given** `Icon Only = true` and an Icon Name is set, **When** the page renders, **Then** the Button renders as a square (size-specific footprint), the label text is not rendered, and the Aria Label field is required for accessibility (Studio surfaces a hint; missing label does not block publish but is flagged in the spec's accessibility validation).
4. **Given** `Icon Only = true` and Icon Name is empty, **When** the page renders, **Then** the Button renders nothing (or a console warning in development) — an icon-only button with no icon is treated as an authoring error consistent with the existing `checkButtonPropsForErrors` pattern.
5. **Given** `Icon Position = Right` with a non-empty Icon Name and `Icon Only = false`, **When** the page renders, **Then** the icon sits on the right of the label with the size-specific gap.
6. **Given** an external link (`isLinkExternal = true`) and an author-set right icon, **When** the page renders, **Then** the author's right icon takes precedence over the auto-injected external-link icon (or the external-link icon is suppressed) — the spec MUST pick one behavior; see FR-019.

---

### User Story 4 — Direct In-Code Button Consumers Pick Up the New Visuals Automatically (Priority: P2)

A page-level React component in `apps/marketing` (corporate-site forms, carousels, modals, snapshots) that today imports `Button` or `LinkButton` from `@code-dot-org/component-library/button` re-renders in the new Brand Button visuals after this feature merges, with at most a one-line per-call-site change (mapping the old `size` prop value to the new size scale, if the size scale renames). No consumer needs to switch packages or rewrite props.

**Why this priority**: This is the "no legacy retained" promise applied to the codebase side. The user said the team is willing to accept a single-pass codebase sweep to update size prop values, but is not willing to maintain two parallel Button implementations.

**Independent Test**: After the design-system primitive is updated, run the repo's full TypeScript check and the existing Storybook visual-diff (storybook-eyes). Every existing direct-code consumer of `Button` / `LinkButton` either compiles unchanged (if the size prop scale stayed as-is) or compiles after the sweep PR maps old size values to new (e.g. `xs` → `s`, `s` → `m`, etc., per the mapping defined in FR-005). Visual diffs show the new Brand Button styling everywhere consumers render.

**Acceptance Scenarios**:

1. **Given** the post-merge codebase, **When** `grep -rn "from '@code-dot-org/component-library/button'"` is run, **Then** every consumer found compiles and type-checks against the updated `Button` / `LinkButton` API.
2. **Given** the design-system Storybook (`apps/design-system-storybook`), **When** it builds, **Then** every existing Button / LinkButton / GenericButton story renders without error in the new visual style, and visual diffs are accepted in the storybook-eyes dashboard.
3. **Given** the marketing Storybook (`apps/marketing-storybook`), **When** it builds, **Then** every story that composes a Button (Card collections, Action Block, Carousels, etc.) renders the new Brand Button styling without per-story prop changes beyond the size-scale mapping.
4. **Given** the `gray` and `destructive` color values currently exported from `packages/component-library/src/button/types.ts`, **When** this feature merges, **Then** `gray` is removed (no remaining call sites — verified by grep) and `destructive` is preserved (still typed, still styled — its appearance may diverge from Brand Buttons until a follow-up spec).

---

---

### User Story 5 — Render Brand Text Links in `color` / `black` / `white` Hierarchies with State + Size Coverage (Priority: P1)

A developer or designer opens the design-system Storybook (or page preview) and steps through the new Text Link variant matrix: 3 Hierarchies (`color`/purple, `black`, `white`) × 3 sizes (`s`/`m`/`l`) × 5 states (Default / Hover / Focused / Disabled / Loading). The rendered output matches the Figma `Brand Buttons` component set's Link Hierarchies exactly — same hex values, same per-state behavior (including the **asymmetric Hover rule**: `color` Hover shifts the text from purple to hover-purple with no underline; `black` and `white` Hover add an underline without changing the text color).

**Why this priority**: Text Link is the second primitive in scope and is consumed inline within paragraphs across the marketing site. Without correct visuals across the matrix, body-copy callouts and CTAs read wrong everywhere. Co-P1 with Story 1 (Button matrix).

**Independent Test**: In `apps/design-system-storybook` (or via the `Link` component's Storybook story file added by this feature), step through `hierarchy=color/black/white`, `size=s/m/l`, `state=default/hover/focused/disabled/loading`. Compare each cell against the Figma frame for that variant (see `figma-tokens.md` Brand Link table).

**Acceptance Scenarios**:

1. **Given** the Text Link story, **When** the developer selects `hierarchy=color`, `size=m`, `state=default`, **Then** the rendered link uses Space Grotesk Bold (700), 14px, `21.7px` line-height, uppercase, text color `#4C42CF`, no underline, zero padding.
2. **Given** `hierarchy=color`, **When** the user hovers, **Then** text color shifts to `#382EA5` and **no underline appears** (per Figma Link color Hover rule).
3. **Given** `hierarchy=black`, **When** the user hovers, **Then** text color stays `#000000` and **an underline appears** (per Figma Link black Hover rule).
4. **Given** `hierarchy=white`, **When** the user hovers, **Then** text color stays `#FFFFFF` and **an underline appears** (per Figma Link white Hover rule).
5. **Given** any Hierarchy at `state=focused`, **When** the link receives keyboard focus, **Then** the same Focus Blue (`#0A84FF`) `2px` outer ring with `4px` gap and `10px` outer radius applied to Buttons appears around the link.
6. **Given** any Hierarchy at `state=loading` (driven by an `isPending`-style prop or boolean), **When** the link renders, **Then** a 20px spinner appears beside the label in the cell's text color; the label remains visible (text-transform drops uppercase to match Figma's Loading style).
7. **Given** the size sweep, **When** an author picks `s`, **Then** the label is **not** uppercased (matches `Button 14 Space`); `m` and `l` ARE uppercased.

---

### User Story 6 — Existing Text Link Instances Auto-Render with the New Brand Hierarchy (Priority: P1)

A content author has dozens of existing code.org pages where Text Link components are composed inside Experience entries with stored Design-tab `color` values picked from the current 22-color brand palette (`color="primary"`, `color="white"`, `color="default"`, plus a few other brand-color values). They publish nothing new. After this feature merges, every existing Text Link on every existing code.org Experience re-renders with the new Brand Link visuals, and no author has to open Studio, re-pick fields, or re-publish anything. Note: the `link` Contentful content type itself (used by authors to create reusable Link entries that get bound into Buttons/Text Links) is **not touched** by this feature — Link entries continue to validate and read identically.

**Why this priority**: The exact same zero-touch migration promise that motivates Story 2 (Buttons) applies here. Co-P1 with Story 2.

**Independent Test**: With no edits to any existing `link` entry, deploy the new build to preview and walk a representative set of code.org pages that contain Text Link entries. Confirm every previously-existing link renders with the new Brand Link visuals at the correctly-mapped Hierarchy and size, and that the contrast-switch behavior still flips the appropriate Hierarchies on dark Sections.

**Acceptance Scenarios**:

1. **Given** an existing Text Link composed in an Experience entry with stored values `{color: "primary", size: "m", isStrong: false}`, **When** the page renders, **Then** the link renders as a `Link color` (purple) Hierarchy at size `m`, with the contrast switch ON (renders purple on light Sections; flips to white on dark Sections).
2. **Given** an existing Text Link with stored `{color: "default", size: "s"}`, **When** the page renders, **Then** the link renders as a `Link black` Hierarchy at size `s`, with the contrast switch ON (renders black on light Sections; flips to white on dark Sections).
3. **Given** an existing Text Link with stored `{color: "white"}`, **When** the page renders, **Then** the link renders as a `Link white` Hierarchy with the contrast switch OFF (always white).
4. **Given** an existing Text Link with any other brand-color value (e.g. `bluePrimary`), **When** the page renders, **Then** the link renders as the `Link color` Hierarchy fallback (purple) with the contrast switch ON. (Per clarification: no real instances were built with the other 19 values, so this is a defensive fallback rather than a routine path.)
5. **Given** an existing Text Link with stored `size="xs"`, **When** the page renders, **Then** the link renders at the new `s` size (`xs` removed from the code.org Component Definition's enum; existing stored values auto-map at render time).
6. **Given** an existing Text Link with stored `iconPosition="right"` and an `icon` value, **When** the page renders, **Then** the icon renders on the right of the label per the unchanged `iconPosition` semantics (Text Link keeps the existing single-`icon` + `iconPosition` shape; not refactored to dual name fields).

---

### Edge Cases

- **`type=secondary` × `color=purple` deprecation warning today**: The current `GenericButton.checkButtonPropsForErrors` logs `Warning: Secondary Purple color is now deprecated`. The new Brand Buttons spec **re-introduces** Secondary Purple as a first-class variant (`Secondary` cell in the Default color column). The deprecation warning MUST be removed.
- **`color=gray` restriction today**: The current `checkButtonPropsForErrors` throws when `color === 'gray' && type === 'primary'`. Since `gray` is being removed entirely (FR-014), this validation block goes away with it. No new restrictions are added — the new color × type matrix is fully populated (no gaps).
- **Empty button text + `Icon Only = false`**: Currently throws via `checkButtonPropsForErrors`. New behavior MUST match: a non-icon-only button with no text remains an authoring error.
- **`Icon Only = true` + non-empty text**: Currently throws. New behavior MUST match: the spec preserves the rule that icon-only mode is mutually exclusive with text.
- **External link + right-icon collision**: Today `iconRight={isLinkExternal ? externalLinkIconProps : undefined}` in `ButtonLegacy.tsx` — the external-link icon always wins because there was no author-set right icon field. With the new Icon Position field exposing right icons, the spec MUST decide and FR-019 documents the choice (recommended: author-set right icon takes precedence; external-link affordance is communicated via `target="_blank"` and `aria-label` only when an author right icon is present).
- **Default size when migrating existing Contentful entries**: Existing `button` entries have no `size` field today (`ButtonLegacy.tsx` hard-codes `size="m"`). Post-migration, entries with no `size` value MUST receive the new size that visually matches today's `m` (see FR-013 — likely the new `Medium`, but Figma comparison required).
- **Focus ring color across colors**: The current implementation uses `--borders-brand-teal-primary` for the focus ring across all button colors. New Brand Buttons may keep one focus color across all variants, or per-color rings; the spec assumes a single focus ring color across all variants unless the per-state token grid (supplied by user in /clarify) specifies per-color rings.
- **Loading state semantics**: Today `isPending` swaps in a spinner per content (text alone → spinner-only; left icon → spinner replaces left icon; right icon → spinner replaces right icon; both icons → left becomes spinner, right stays). New Brand Buttons MUST keep this behavior unless the Figma loading state implies otherwise (per-state token grid will confirm).
- **Tertiary buttons have no background/border by default**: Today's `button-tertiary` rules render with transparent background and no border in the default state. New Brand Buttons MAY differ — the user-supplied per-state token grid is authoritative.
- **Server rendering**: Buttons are server-rendered today and MUST remain so. No new client-only boundary, no hydration concern, no browser-only dependency introduced.
- **CSforAll tenant**: The CSforAll Contentful registration (`apps/marketing/src/contentful/registration/csforall/index.ts`) MUST continue to register `ButtonMuiContentfulComponentDefinition` unchanged, and its rendered output MUST be byte-identical before and after this feature merges. Verification: csforall preview pages show no visual diff in storybook-eyes after merge.
- **Destructive variant**: Out of scope. The `destructive` color value stays in `ButtonColor` type union; its visual styling stays as today; a follow-up spec aligns it with the separate Figma `Destructive Button` component set.
- **Text Link `s` size text-transform**: The Figma Brand Link spec drops `text-transform: uppercase` for the `s` size (matches the Button `s` rule). The `m` and `l` sizes ARE uppercased. SCSS must apply uppercase conditionally on `size !== 's'` (matches the Button rule).
- **Text Link Loading state on `s` size**: Like Buttons, the Loading state drops uppercase regardless of size. Combined with the `s` rule above, the simpler implementation is "uppercase only when `size !== 's' && state !== 'loading'`."
- **Text Link `isStrong` field (existing)**: Today's `link` Contentful schema has an `isStrong` Boolean that toggles `font-weight` between 500 and 600. Per Figma, Brand Links are ALWAYS Bold 700 across every size. The `isStrong` field becomes a render-time no-op (always Bold). It MAY be kept in the schema for backward compatibility (existing entries that set it true or false render identically) or removed via a human-applied schema delete; FR-030 records the decision.
- **Text Link `iconPosition` field (existing)**: Today's `link` Contentful schema has `iconPosition` (`left`/`right`) plus a single `icon` Text field. This pattern is **preserved as-is** for Text Link (R11's decision to use dual name fields on Buttons does NOT extend to Text Link — the Brand Link spec does not include a "both icons" case, so a single-name + position is sufficient and clearer in Studio).
- **Text Link contrast switch behavior**: Per clarification, the `color` and `black` Hierarchies route their text color through the contrast switch (`useSectionBackground` + `resolveTextColorForBackground` from spec 006) — they flip to white-equivalent on dark Sections. The `white` Hierarchy does NOT route through the switch — it always renders white regardless of Section background. This matches the existing Text Link's per-color flip behavior.
- **Asymmetric Link Hover behavior**: Per Figma, the `Link color` Hover **changes text color** (purple → hover-purple) with **no underline**. The `Link black` and `Link white` Hovers **add an underline** while keeping the text color unchanged. The SCSS implementation MUST branch the Hover rule by Hierarchy; it is NOT a uniform "underline on hover" rule.
- **Privacy / SEO**: No personal data, no third-party network calls, no metadata, structured data, sitemap, or canonical impact.
- **Storybook coverage**: Brand Button stories MUST cover at minimum: a 4-size sweep at default Primary; a 3×3 type×color matrix at the default size; the 5 states (Default/Hover/Focus/Disabled/Loading) at one representative cell; icon-only at each size; icon-with-text with left and right icon positions; a `useAsLink` (LinkButton) story; and an external-link story.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The shared `Button` and `LinkButton` exports from `@code-dot-org/component-library/button` MUST render the new Brand Button visuals on the code.org tenant. The same package exports MUST be used — no parallel `BrandButton` component is introduced, and no per-tenant fork of the button primitive is created.
- **FR-002**: The Button MUST expose a Type prop with exactly three values: `primary`, `secondary`, `tertiary`. Defaults to `primary`.
- **FR-003**: The Button MUST expose a Color prop with exactly three Brand-Button values for the code.org rendering path: `purple` (default), `black`, `white`. The `gray` color value MUST be removed from the `ButtonColor` type union and from the CSS module. The `destructive` color value MUST be preserved in the type union and in the CSS module (its visual treatment may differ from Brand Buttons until a follow-up spec).
- **FR-004**: The Button MUST expose a Size prop with exactly four values matching the Figma Brand Buttons axis: `s` (Small), `m` (Medium), `l` (Large), `xl` (Extra Large). Defaults to the value identified in FR-013.
- **FR-005**: The current `xs` size value MUST be removed from the size scale. Any in-code call site using `size="xs"` MUST be migrated (in the same PR or a small precursor) to `size="s"`. A grep MUST confirm zero remaining `size="xs"` Button usages before merge.
- **FR-006**: The Button MUST expose an `iconLeft` / `iconRight` / `icon` (icon-only) trio of props, preserving the existing API shape (`FontAwesomeV6IconProps`). Authors of in-code call sites pass `FontAwesomeV6IconProps` objects directly; Contentful authors pass an icon name string + position enum and the icon object is constructed by the Contentful wrapper.
- **FR-007**: The Button MUST expose an `isIconOnly` boolean prop. When `true`, the Button renders as a square (size-specific footprint) with only the `icon` prop rendered. Mutually exclusive with `text`: setting both MUST throw the existing `checkButtonPropsForErrors` error.
- **FR-008**: The Button MUST render five visually-distinct states per type×color×size cell: `default`, `hover`, `focus`, `disabled` (`disabled` attribute OR `aria-disabled="true"`), and `loading` (`isPending=true`). The per-state background / border / text-color treatment for every type×color cell MUST be sourced from the per-state token grid supplied by the design owner during `/speckit.clarify`. (The user has stated they will supply these; this spec MUST NOT invent token values.)
- **FR-009**: All Button labels MUST render in **Space Grotesk** (the existing repo font; no new font dependency). Font size, font weight, line height, letter spacing, and text case (uppercase / sentence-case / etc.) MUST be determined by the Size prop per the Figma Brand Buttons frames. The exact per-size typography values MUST be sourced from the Figma file during `/speckit.plan` research.
- **FR-010**: All Button instances MUST use a single, shared corner-radius token (default value `8px`) defined in **one place** in the repo (likely a CSS variable in `packages/component-library-styles` or an SCSS variable referenced by `genericButton.module.scss`). Updating that one token MUST update every Brand Button instance across types, colors, sizes, and icon configurations. The token name MUST be sufficiently button-specific (e.g. `--button-radius`, not just `--radius-md`) so future radius changes to other components do not bleed into Buttons by accident.
- **FR-011**: The Button MUST NOT participate in the contrast-switch system introduced by spec 006 (`SectionBackgroundContext`, `resolveTextColorForBackground`, `resolvedCssVarForBrandColor`). Button colors are author-chosen and rendered as-authored regardless of enclosing Section background. Rationale: confirmed by the user; manual color updates when section backgrounds change are acceptable.
- **FR-012**: The code.org Button Component Definition (today: `ButtonLegacyContentfulComponentDefinition`, exported component id `button` from `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacyContentfulDefinition.ts`) MUST be updated in place. The exported `id: 'button'` MUST NOT change. **Clarification**: this is a Contentful **Experiences** Component Definition (code-side), NOT a Contentful content type. There is no `button` content type in Contentful. Existing Button instances live inside Experience entries as composed component config; they continue to validate against the updated Component Definition and re-render in the new Brand visuals without entry-side edits.
- **FR-013**: The `ButtonLegacyContentfulComponentDefinition.variables` object MUST be expanded — entirely as a code edit — to add the following Design-tab options (`group: 'style'`), each with a default chosen so existing Button instances render unchanged in visual intent: `size` (Text, default `m`, validation enum `s` / `m` / `l` / `xl`), `type` (Text, validation enum expanded to include `tertiary` — existing `primary`/`secondary` values continue to validate), `color` (Text, unchanged enum `purple` / `black` / `white`), `iconLeftName` (Text — preserved as today), `iconRightName` (Text, new, default empty), `isIconOnly` (Boolean, new, default `false`). **No Content-tab change** — the bindable Content-tab fields (`text`, `href`, `isLinkExternal`, `ariaLabel`) continue to bind to Link content-type entries or to manual values as today; this binding contract is unchanged.
- **FR-014**: Existing Button instances composed in Experience entries MUST NOT require any author re-editing for the new visuals to apply. Because the Component Definition fields land code-side with sensible defaults, every existing Experience entry's stored Button config continues to validate; missing values default per FR-013. Zero re-publish required.
- **FR-015**: The `apps/marketing/src/contentful/registration/csforall/` registration MUST continue to register `ButtonMuiContentfulComponentDefinition` (id `button-mui`) for the CSforAll tenant, and MUST NOT register the updated code.org Button definition. CSforAll's rendered button output MUST be byte-identical before and after this feature merges.
- **FR-016**: The Button MUST stay on the existing component stack (`@code-dot-org/component-library`, MUI-compatible styling via SCSS modules + CSS variables). No new styling library is introduced. The Brand Button styling MUST live in `packages/component-library/src/button/genericButton.module.scss` (or a sibling SCSS module file in the same directory) so that the design-system Storybook picks up the new styles automatically.
- **FR-017**: The Button MUST remain a server-rendered React component. No `"use client"` directive, no browser-only dependency, no client-only boundary. The component MUST continue to forward refs to the underlying `<button>` or `<a>` element via `forwardRef`, preserving the existing public API.
- **FR-018**: Accessibility: focus state MUST be visible via a keyboard `:focus-visible` outline (color, width, offset per the per-state token grid). Disabled buttons MUST set both `disabled` (when `<button>`) and `aria-disabled="true"`. Icon-only buttons MUST require an `ariaLabel` for the accessible name; missing label MUST NOT block render but MUST emit a development-mode warning consistent with the existing `checkButtonPropsForErrors` pattern.
- **FR-019**: When an external link (`isLinkExternal = true` in Contentful, or `useAsLink && target === "_blank"` in code) is combined with an author-set right icon, the **author-set right icon MUST take precedence**. The external-link affordance MUST be communicated via the existing `rel="noopener noreferrer"` and `target="_blank"` attributes plus an `aria-label` suffix (e.g. "opens in new tab") when an `ariaLabel` is set. Rationale: the new Icon Position field gives authors explicit control; auto-injection of the external-link icon would override their choice.
- **FR-020**: The Button MUST ship with Storybook coverage in the design-system Storybook exercising at minimum: (a) the 4-size sweep at Primary Default; (b) the 3 type × 3 color matrix at the default size in the Default state; (c) the 5 states (Default/Hover/Focus/Disabled/Loading) on one representative cell; (d) icon-only at each of the 4 sizes; (e) icon-with-text at left and right positions; (f) a `useAsLink=true` (LinkButton) story exercising href, target, download, and analyticsCallback props; (g) an external-link story per FR-019.
- **FR-021**: The Button MUST ship with updated unit tests in `packages/component-library/src/button/__tests__/`. Tests MUST exercise: the 4 sizes, the 3 types, the 3 Brand-Button colors, the 5 states, `isIconOnly` + `icon` happy-path, `isIconOnly` + `text` error, left and right icon positions, `useAsLink` href/target/onClick semantics, and the deprecation warning is **removed** for `type=secondary + color=purple` (its absence is part of the test). The existing test for `color=gray + type=primary` throwing MUST be removed alongside the gray color value.
- **FR-022**: Visual regression coverage: the existing storybook-eyes baseline MUST be re-accepted post-merge for every Button-related story in both the design-system Storybook and the marketing Storybook. The CI gate (see memory `project_storybook_eyes_baseline_gate`) MUST be flipped through baseline acceptance in the Applitools dashboard, not through code changes.
- **FR-023**: No new Contentful writes MUST be required from application code for this feature. **No Contentful Studio schema work is required** — the Button's "schema" is a code-side Component Definition (FR-013), and the Text Link rebrand is also code-side (FR-027..FR-031). Existing Contentful content types (`link`) are not touched. No `ctf_get_content_type` re-read step is required because no Contentful state change occurs.
- **FR-024**: SEO is unaffected — no page-level metadata, canonical behavior, structured data, indexing behavior, or sitemap changes.
- **FR-025**: Privacy is unaffected — no personal data, Student Records, third-party data sharing, or analytics events are introduced or altered. Existing `analyticsCallback` prop on LinkButton is preserved unchanged.
- **FR-026**: The CSS module file (`genericButton.module.scss`) MUST be re-organized so that the new Brand Button styling is the primary path and any retained `destructive` styling is clearly segregated (e.g. via a top-of-file comment block) so future readers do not mistake destructive's divergence for a bug.

### Text Link Functional Requirements

- **FR-027**: The code.org Text Link Component Definition (today: `LinkContentfulComponentDefinition`, exported component id `link` from `apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts`) MUST be updated in place. The exported `id: 'link'` MUST NOT change. **Clarification**: the `link` content type IN Contentful (used by authors to create reusable Link entries that get bound into Buttons and Text Links) is **not modified**. This feature edits the code-side Component Definition's `variables` object only.
- **FR-028**: The code.org Component Definition's `color` field MUST be narrowed from the 22-option universal CodeAI palette (`brandTextColorOptions('purplePrimary')`) to a 3-option enum: `color` (Default — purple, contrast switch ON), `black` (contrast switch ON), `white` (contrast switch OFF). Narrowing is **per-tenant** (R13): the csforall tenant's Component Definition continues to expose the 22-color enum unchanged. The field may be renamed to `hierarchy` in the Studio Design-tab label for clarity; the variable id may stay `color` to keep stored values readable.
- **FR-029**: Existing Text Link instances MUST auto-map at render time per these rules: stored `color="primary"` (legacy alias for `purplePrimary`) → `color` Hierarchy; stored `color="default"` (legacy black-with-switch) → `black` Hierarchy; stored `color="white"` → `white` Hierarchy; any other previous brand-color value → `color` Hierarchy (fallback). No author work required. The mapping is encoded in `apps/marketing/src/components/contentful/link/Link.tsx` and exercised by unit tests.
- **FR-030**: The code.org Component Definition's `size` field MUST be narrowed from `[xs, s, m, l]` to `[s, m, l]`. Existing Text Link instances with stored `size="xs"` MUST auto-map to `s` at render time. The csforall tenant's Component Definition continues to expose `[xs, s, m, l]` unchanged. No Contentful Studio change required.
- **FR-031**: The Text Link's `isStrong` Design-tab Boolean MUST be kept in the Component Definition (both tenants) for backward compatibility but rendered as a no-op on code.org (Brand Links always Bold 700 per Figma). On csforall it continues to honor `isStrong` as today. **No Contentful Studio change required** — this is purely a code-side render-behavior decision.
- **FR-032**: The Text Link's `color` and `black` Hierarchies MUST route their text color through the contrast switch (`useSectionBackground` + `resolveTextColorForBackground` from spec 006). The `white` Hierarchy MUST NOT route through the switch (always renders `#FFFFFF`). The exact "flipped-to" color on dark Sections for `color` and `black` MUST match the existing `resolveLinkColor` behavior — typically a white-equivalent token from the brand palette.
- **FR-033**: The Text Link MUST implement the Figma asymmetric Hover rule (per `figma-tokens.md` Brand Link section): `color` Hover changes text color (`#4C42CF` → `#382EA5`) with no underline; `black` and `white` Hover keep their text color and add a `text-decoration: underline` (solid, `from-font`). The SCSS module MUST branch the Hover rule by Hierarchy.
- **FR-034**: The Text Link's Focus state MUST share the Brand Button Focus Blue (`#0A84FF`) `2px` outer ring, `4px` inner gap, outer-radius `10px` treatment. The single `--button-focus-ring` CSS variable (FR-010 + the new variable family) serves both Buttons and Text Link.
- **FR-035**: The Text Link's Loading state MUST render a 20px spinner alongside the label in the cell's text color; the label MUST remain visible (matches Figma's "label replaced with `Submitting...`" pattern). Loading-state typography MUST drop `text-transform: uppercase` regardless of size. Loading is exposed via an `isPending` prop on the React component (matching the Button API) and via a new optional Boolean field on the Contentful schema (Plan picks the field name; default `false`).
- **FR-036**: The Brand Link `xl` size MUST NOT exist (Figma does not define an `xl` Link variant; per clarification Q2, Text Link tops out at `l`).
- **FR-037**: The Text Link MUST NOT expose an icon-only mode (per clarification Q3). Authors who want an icon-only clickable element use the Button with `isIconOnly=true`. The existing `icon` + `iconPosition` Contentful fields are preserved and continue to render an icon **adjacent to** a visible label.
- **FR-038**: The per-state token grid for Buttons + Text Link MUST land as new CSS custom properties in `packages/component-library-styles/primitiveColors.scss` (or a new sibling file `buttonColors.scss` — plan picks). The exact hex values are taken from `specs/008-brand-buttons/figma-tokens.md` (final per the user). The SCSS modules `genericButton.module.scss` and the Text Link styles MUST consume these CSS variables — no placeholder fallbacks to the universal brand-color manifest, no literal hex values in the SCSS modules.
- **FR-039**: The Text Link MUST stay on the existing MUI-based component stack (`@mui/material/Link` is fine to keep as the underlying anchor primitive) and MUST remain server-rendered.
- **FR-040**: The Text Link MUST ship with Storybook coverage in `apps/marketing-storybook` exercising at minimum: (a) the 3-hierarchy × 3-size matrix at Default state; (b) the 5 states (Default/Hover/Focused/Disabled/Loading) on one representative cell (`color` at `m`); (c) the asymmetric Hover behavior on `color` vs `black` (verifying no underline appears on `color`); (d) a contrast-switch story showing `color` and `black` Hierarchies flipping color inside a dark Section, and `white` not flipping inside a dark Section; (e) an external-link story (preserved `isLinkExternal` behavior — external icon on right, opens new tab); (f) a left-icon and right-icon story.
- **FR-041**: The Text Link MUST ship with updated unit tests in `packages/component-library/src/link/__tests__/` and `apps/marketing/src/components/contentful/link/__tests__/` exercising the auto-mapping rules (FR-029), the size auto-mapping (FR-030), the asymmetric Hover behavior (FR-033), the contrast-switch behavior per Hierarchy (FR-032), and the Loading state (FR-035).

### Brand Button + Brand Link Variant Matrix (Reference)

The full code.org Brand matrix has **two primitives**, both sourced from the same Figma component set (`Aw6YXqpx6QFlNMXqCKk60e` node `7:3976`):

**Brand Buttons** — 3 types × 3 colors × 4 sizes × 5 states × 2 icon-only modes = **360 visual variants**. The 9 Type × Color cells:

| Type      | Default (Purple) | Black           | White           |
| --------- | ---------------- | --------------- | --------------- |
| Primary   | Primary          | Primary Black   | Primary White   |
| Secondary | Secondary        | Secondary Black | Secondary White |
| Tertiary  | Tertiary         | Tertiary Black  | Tertiary White  |

Each cell has 5 states (Default / Hover / Focus / Disabled / Loading) × 4 sizes (`s`/`m`/`l`/`xl`) × 2 icon-only modes.

**Brand Links** — 3 hierarchies × 3 sizes × 5 states = **45 visual variants** (Text Link has no icon-only mode and no `xl` size per Figma). The 3 Hierarchies:

| Hierarchy | Behavior on light Section | Behavior on dark Section  | Contrast switch |
| --------- | ------------------------- | ------------------------- | --------------- |
| color     | Purple text (`#4C42CF`)   | Flips to white-equivalent | ON              |
| black     | Black text (`#000000`)    | Flips to white-equivalent | ON              |
| white     | White text (`#FFFFFF`)    | Stays white               | OFF             |

Together: **405 visual variants** across the two primitives.

The exact per-state hex tokens for every cell are recorded in **`specs/008-brand-buttons/figma-tokens.md`**. These are final per the user's clarification — the SCSS module lands the exact values, no placeholder fallbacks.

The destructive Brand Button (Figma `Destructive Button` component set) is **out of scope** for this feature.

## Integration Points _(mandatory when external systems or cross-workspace changes are involved)_

### Systems and Contracts

- **Upstream Inputs**:
  - Existing Experience entries containing composed Button component instances (Component Definition `ButtonLegacyContentfulComponentDefinition`, exported component id `button` — code-side). The Component Definition's `variables` object is being expanded (FR-013) — purely a code change. **There is no `button` content type in Contentful**; Button instances live as composed config inside Experience entries.
  - Existing Experience entries containing composed Text Link component instances (Component Definition `LinkContentfulComponentDefinition`, exported component id `link` — code-side). The Component Definition's `color`/`size` variable enums are being narrowed per tenant (FR-028..FR-030) — code change only.
  - The `link` Contentful content type (used by authors to create reusable Link entries that bind into Buttons and Text Links) is **not touched**. Link entries continue to validate and read identically.
  - The shared icon primitive `FontAwesomeV6Icon` from `packages/component-library/src/fontAwesomeV6Icon/` (unchanged).
  - The brand-icon detection map `fontAwesomeV6BrandIconsMap` in `apps/marketing/src/components/common/constants.ts` (unchanged).
  - The shared `useSectionBackground` + `resolveTextColorForBackground` plumbing from spec 006 (used by Text Link `color` and `black` Hierarchies for contrast switching).
  - The Figma `Brand Buttons` component set (`Aw6YXqpx6QFlNMXqCKk60e` / node `7:3976`) — the source of truth for per-size typography, padding, gap, icon size, icon-only footprint, corner-radius, and the full per-state color grid. Final tokens recorded in `specs/008-brand-buttons/figma-tokens.md`.
- **Downstream Effects**:
  - Every existing code.org Contentful `button` entry re-renders in the new visual style (zero per-entry edits required).
  - Every existing code.org Contentful `link` entry re-renders in the new Brand Link visual style with its `color` value auto-mapped to a Hierarchy (zero per-entry edits required).
  - Every direct in-code consumer of `Button` / `LinkButton` from `@code-dot-org/component-library/button` re-renders in the new visual style (size prop scale renames may require a one-time sweep).
  - Storybook visual diffs across every Button-adjacent AND Text-Link-adjacent story; storybook-eyes baseline re-acceptance required for both primitives.
  - CSS variable / token namespace gains the new `--button-*` color family + `--button-focus-ring` + `--button-border-radius`; no existing tokens are renamed.
- **Runtime Surfaces**:
  - `packages/component-library/src/button/{Button.tsx, LinkButton.tsx, GenericButton.tsx, types.ts, genericButton.module.scss, __tests__/*, stories/*}` — all updated in place.
  - `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/{ButtonLegacy.tsx, ButtonLegacyContentfulDefinition.ts}` — schema expanded (FR-013); component file may be renamed but the Contentful `id` MUST remain `button` (FR-012).
  - `apps/marketing/src/components/contentful/link/{Link.tsx, LinkContentfulDefinition.ts, __tests__/*}` — re-skinned + schema narrowed (FR-027..FR-037).
  - `apps/marketing/src/contentful/registration/code.org/index.ts` — import paths may update if files are renamed; registration entry order otherwise unchanged.
  - `apps/marketing/src/contentful/registration/csforall/index.ts` — UNCHANGED.
  - `apps/design-system-storybook/` and `apps/marketing-storybook/` — Button-related AND Text-Link-related stories updated to reflect the new matrices.
  - Direct in-code call sites under `apps/marketing/src/components/contentful/corporateSite/...` (AdoptionMap, AFE flows, YourSchool form, etc.) — props swept for size-scale rename if applicable.
  - The `packages/component-library-styles` (or equivalent shared style package) — new `--button-*` CSS variable family + `$button-border-radius` SCSS variable added.
- **Tenant / Hostname Paths**:
  - `http://code.org.marketing-sites.localhost:3001` — new Brand Button styling applied to all existing and new Buttons.
  - `http://preview-code.org.marketing-sites.localhost:3001` — same.
  - `http://csforall.marketing-sites.localhost:3001` — UNCHANGED (still renders via `ButtonMuiContentfulComponentDefinition`).
  - `http://preview-csforall.marketing-sites.localhost:3001` — UNCHANGED.

### Data Flow Notes

- Contentful entry of content-type `button` → tenant-specific registration → `ButtonLegacy` wrapper (renamed/rebadged per FR-012) → `LinkButton` from `@code-dot-org/component-library/button` → updated `genericButton.module.scss` → static HTML containing the rendered Brand Button.
- No new caching, revalidation, middleware, or request-path behavior is introduced. Existing cache headers and revalidation windows remain unchanged.
- Contentful changes for this feature are: (1) a human-applied content-type schema expansion (new fields per FR-013, expanded `type` enum), confirmed via Contentful MCP re-read before `/speckit.plan` declares research complete; (2) zero entry-side changes — existing entries continue to validate.
- No analytics, redirect, third-party script, or SEO/metadata behavior changes.
- The contrast-switch system introduced by spec 006 is **not** wired to Buttons — Buttons render with author-chosen colors regardless of enclosing Section background (FR-011).

### Key Entities

- **Button (Component Definition + composed instance)**: The Contentful Experiences component whose `variables` are hard-coded in `ButtonLegacyContentfulComponentDefinition.ts`. Composed instances live inside Experience entries. Carries Design-tab values (type, color, size, iconLeftName, iconRightName, isIconOnly) and Content-tab values (text, href, isLinkExternal, ariaLabel — bindable to Link content-type entries).
- **Text Link (Component Definition + composed instance)**: The Contentful Experiences component whose `variables` are in `LinkContentfulDefinition.ts`. Composed instances live inside Experience entries. Carries Design-tab values (hierarchy/`color`, size, isStrong, icon, iconPosition) and Content-tab values (children, href, isLinkExternal, ariaLabel — bindable to Link content-type entries).
- **Link (Contentful content type — NOT modified)**: The Contentful content type authors use to create reusable link entries with shared text + href + isLinkExternal. Buttons and Text Links bind to Link entry fields via the Content tab. This content type is not touched by the feature.
- **`Button` / `LinkButton` (design-system component)**: The shared React primitive in `@code-dot-org/component-library/button` that renders any Brand Button on either tenant; on code.org it renders the new Brand Button visuals, on CSforAll it renders today's MUI-based styling via the separate `ButtonMuiContentfulComponentDefinition` path. Its public API (props: type, color, size, iconLeft, iconRight, icon, isIconOnly, isPending, useAsLink, href, target, download, onClick, value, name, forceHover, ariaLabel, className, id, ref) is preserved with only size-scale and color-enum changes.
- **`Link` / Text Link (Contentful component)**: The code.org Contentful Text Link at `apps/marketing/src/components/contentful/link/Link.tsx` (id `link`). Its render-time API surfaces the 3 Brand Hierarchies and 3 sizes; the Contentful schema fields may keep their existing names (e.g. `color`, `size`) with narrowed enums.
- **Brand Token Grid (Figma-final)**: The full per-cell token matrix (background / border / text + per-size dimensions + Focus Blue + per-Hierarchy Hover rules) for both primitives, sourced from Figma and recorded in `specs/008-brand-buttons/figma-tokens.md`. Authoritative — the SCSS lands these values verbatim as new CSS custom properties.
- **Brand Color Manifest (existing)**: The 22-token universal CodeAI palette from spec 006 (`BRAND_COLORS` in `apps/marketing/src/components/common/colors.ts`). Not consumed by the new Brand Button / Text Link CSS — those use the Figma-final tokens. The existing manifest stays in place for Heading / Paragraph / Icon / other components.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of the 360-variant matrix renders without console error in the design-system Storybook (4 sizes × 9 type×color cells × 5 states × 2 icon-only modes), verifiable by stepping through the Brand Button story controls.
- **SC-002**: Zero existing code.org Contentful `button` entries require re-publishing for the new visuals to apply; verified by deploying to preview and walking the homepage, hour-of-code, professional-learning, and one teacher landing page without touching Contentful and observing the new styling on every previously-existing button.
- **SC-003**: Zero CSforAll preview pages show a visual diff in storybook-eyes attributable to this feature; verified by the storybook-eyes baseline review post-merge.
- **SC-004**: The repository contains zero references to a `gray` Button color after this feature merges, verified by `grep -rn "color.*gray\|gray.*type" packages/component-library/src/button apps/marketing/src/components apps/design-system-storybook apps/marketing-storybook`.
- **SC-005**: The repository contains zero `size="xs"` Button usages after this feature merges, verified by `grep -rn 'size="xs"\|size: .xs.' apps/ packages/`.
- **SC-006**: Updating the single `--button-radius` token (or its SCSS equivalent) from `8px` to any other value in one file changes the corner radius on every Brand Button instance across the design-system Storybook and marketing previews, with no per-component edit required.
- **SC-007**: A content author can change an existing Button entry's Size from `Medium` to `Extra Large` and its Type from `Primary` to `Tertiary` in Contentful Studio in under 30 seconds without leaving the page, and the rendered Button reflects the change on the next preview load.
- **SC-008**: A content author can convert an existing text Button entry to an icon-only Button by setting `Icon Only = true`, blanking the Text field, and setting an `Icon Name` and `Aria Label` — all within Studio, in under 60 seconds.
- **SC-009**: The new Brand Button stories pass storybook-eyes visual-diff acceptance once the design owner approves the baseline.
- **SC-010**: Bundle impact bounded: the design-system package's gzipped bundle size for the `button` module grows by no more than 10% relative to pre-feature baseline, verifiable by the existing bundle-size CI check (or by a one-shot `du`/bundle-analyzer run if no CI check exists).
- **SC-011**: 100% of the 45-variant Text Link matrix renders without console error in the design-system Storybook (3 hierarchies × 3 sizes × 5 states), verifiable by stepping through the Text Link story controls.
- **SC-012**: Zero existing code.org Contentful `link` entries require re-publishing for the new visuals to apply; verified by deploying to preview and walking a representative set of pages with Text Link entries without touching Contentful and observing the new Brand Link styling.
- **SC-013**: A `color="primary"` Text Link entry placed inside a `purplePrimary` Section renders in white (contrast switch flips the `color` Hierarchy), verifiable by visual inspection in preview.
- **SC-014**: A `color="white"` Text Link entry placed inside a `purplePrimary` Section renders in white WITHOUT flipping (contrast switch is OFF for the `white` Hierarchy), verifiable by visual inspection in preview.
- **SC-015**: The asymmetric Hover behavior is correctly implemented: hovering a `color` Hierarchy link changes text color and shows NO underline; hovering a `black` or `white` Hierarchy link keeps text color and shows AN underline. Verifiable by Storybook story with hover state.
- **SC-016**: The hex values in `packages/component-library-styles/primitiveColors.scss` (or sibling file) for the new `--button-*` CSS variables match `specs/008-brand-buttons/figma-tokens.md` 1:1. Verifiable by grep + diff.

## Assumptions

- The existing `Button` / `LinkButton` / `GenericButton` exports from `@code-dot-org/component-library/button` are the right insertion point for the new Brand Button styling — a parallel `BrandButton` component is rejected as a worse outcome (two button implementations, drift risk, ambiguous import path for consumers).
- The existing `Link` component at `apps/marketing/src/components/contentful/link/Link.tsx` (Contentful id `link`) is the right insertion point for the new Brand Text Link styling — re-skinned in place; no parallel `BrandTextLink` component is introduced.
- The per-state token grid for both Buttons and Text Link is **final** and recorded in `specs/008-brand-buttons/figma-tokens.md`, extracted from Figma during `/speckit.clarify`. The SCSS module lands these exact hex values as new `--button-*` CSS custom properties (no placeholder fallbacks to the universal brand-color manifest).
- The Figma `Brand Buttons` component set (node `7:3976`) is the authoritative source for per-size typography (font size / weight / line-height / letter-spacing / text-case), padding, icon-with-text gap, icon size, and icon-only square footprint — all extracted into `figma-tokens.md`.
- Space Grotesk is already loaded site-wide; no new font dependency or loading change is introduced.
- The corner-radius value `8px` is the design owner's current intent; the token is designed to be flexible so the value can change without per-component edits later.
- CSforAll is being deprecated. Not touching its button registration is acceptable and matches the pattern used by recent component additions (spec 007 Icon Component does the same).
- The existing `destructive` Button color is retained because in-repo grep shows direct in-code consumers (admin / dialog flows in `packages/component-library/src/destructiveDialog/` and similar). A follow-up spec aligns destructive with the separate Figma `Destructive Button` component set.
- The existing `gray` Button color is removed because grep shows it is referenced only within `packages/component-library/src/button/` itself (CSS rules + the deprecation-warning helper) and not by any external consumer. Plan/research step MUST re-verify this assumption before merging.
- The Contentful component id `button` is preserved across this feature (FR-012); renaming the underlying file (e.g. `buttonLegacy/` → `button/`) is acceptable as long as the exported component definition's `id` field stays `button`.
- A single one-time codebase sweep to rename `size="xs"` → `size="s"` at any remaining direct-code call sites is acceptable to the team and does not require a parallel-version migration path.
- No new privacy, SEO, sitemap, redirect, caching, or analytics surface is touched.
- Existing cache headers and revalidation windows remain unchanged.
- The Link Hierarchies in the Figma `Brand Buttons` file (Link White / Link black / Link color) are **in scope** for this feature (per clarification) — handled by updating the existing Text Link component in place.
- The Destructive Brand Button (separate Figma component set) is explicitly out of scope and will be handled in a follow-up spec.
- Contrast switching is intentionally **OFF for Buttons** (FR-011) and **selectively ON for Text Link** (FR-032: ON for `color` and `black` Hierarchies, OFF for `white`). This per-primitive split reflects the different visual roles: Buttons are large prominent elements where author choice should be respected; Text Links are inline and need to adapt to varied Section backgrounds the way Heading/Paragraph do.
- The Text Link `color` 22→3 narrowing is auto-mapped at render time (FR-029) — no Contentful Studio work required. The code.org Component Definition's `validations.in` for `color` is narrowed to 3 Hierarchies; csforall's Component Definition keeps the full 22-color enum. Both definitions point to the same exported component id `link`; per-tenant registration files import the appropriate factory.
- **No Contentful Studio schema changes are required for this feature.** All "schema" updates are code edits to Component Definition `variables` objects under `apps/marketing/src/components/contentful/{...}/`. Contentful content types (`link` and others) are not touched. No `ctf_get_content_type` re-read step exists in the workflow.
