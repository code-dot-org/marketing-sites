# Feature Specification: Interactive Gap Analysis Map

**Feature Branch**: `002-gap-analysis-map`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Interactive Gap Analysis Map — interactive, map-based data visualization tool for geographical gaps in educational metrics"

## Overview

This feature introduces an interactive, map-based data visualization component that allows advocacy visitors to explore state-by-state disparities between educational access and participation in AI + Computer Science programs. Unlike the current implementation at `https://advocacy.code.org/stateofaics/` — which provides a simple dropdown-based document download interface with no visual map — this new component presents the underlying data as an explorable geographic surface.

The component is designed to be embedded on a Code.org advocacy page and serves as a compelling, high-information companion to the existing static report downloads.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore State Metrics via Map (Priority: P1)

A policy advocate, educator, or journalist lands on the page and wants to quickly survey which states are leading or lagging in AI + CS education access and participation. They scan the color-coded map to get a visual overview of nationwide policy progress, then hover over individual states to preview specific metrics in real time.

**Why this priority**: This is the core value of the component — transforming a static download page into an explorable data surface. Without this, no other feature adds value.

**Independent Test**: A user can hover over any state on the map and see the state's name, policy tier, access percentage, participation percentage, and calculated gap — without clicking or downloading anything.

**Acceptance Scenarios**:

1. **Given** the user loads the page, **When** the map is fully rendered, **Then** all 50 states plus Washington DC are visible and color-coded by their policy tier (e.g., Foundation Level, Building Momentum, Policy Leader / Graduation Mandate)
2. **Given** the user hovers over a state, **When** the cursor is within the state boundary, **Then** the floating data panel becomes visible and displays that state's name, policy tier badge, access metric (%), participation metric (%), and the calculated gap metric (%)
3. **Given** the user hovers over a state, **When** the cursor leaves the state boundary without clicking, **Then** the data panel hides and the map returns to its default discovery state
4. **Given** the user is hovering a state, **When** they move to a different state, **Then** the data panel updates seamlessly to reflect the newly hovered state

---

### User Story 2 - Lock a State for Deep-Dive (Priority: P2)

A user has identified a state of interest via hover and wants to read the data panel in detail or click one of the download links within it. They click the state to "lock" the panel in place, preventing it from closing while their cursor moves within the panel to click links.

**Why this priority**: Without the lock mechanic, users cannot safely interact with action links inside the panel — any movement off the state would collapse the panel, making downloads inaccessible.

**Independent Test**: A user can click a state, move the cursor off the state onto the data panel, and the panel remains fully visible and interactive with all links clickable.

**Acceptance Scenarios**:

1. **Given** the user clicks a state, **When** the click registers, **Then** the data panel locks in place with a visual indicator (e.g., highlighted border), the state on the map receives a distinct locked highlight style, and the panel remains visible even when the cursor leaves the state
2. **Given** the panel is locked, **When** the user clicks the "Download State Report" link, **Then** the link opens the state-specific Google Drive report URL in a new browser tab without closing the panel
3. **Given** the panel is locked, **When** the user clicks the "Download State Presentation" link, **Then** the link opens the state-specific Google Slides/Drive URL in a new browser tab without closing the panel
4. **Given** the panel is locked on State A, **When** the user clicks on State B, **Then** the panel unlocks from State A, locks on State B, updates all displayed data to State B's metrics and links, and State B receives the locked highlight

---

### User Story 3 - Reset to Discovery State (Priority: P3)

A user who has locked a state wants to dismiss the panel and return to browsing the map freely. They either click the close button on the panel or click anywhere on the background outside the map.

**Why this priority**: Without a clear reset path, users may feel trapped in a locked state, particularly on touch devices or when they've finished reviewing a state.

**Independent Test**: A user can fully reset the map to its initial default state with no panel visible using at least two distinct interaction paths.

**Acceptance Scenarios**:

1. **Given** the panel is locked, **When** the user clicks the close (×) button on the data panel, **Then** the panel closes, the locked highlight is removed from the state, and the map returns to its default discovery state
2. **Given** the panel is locked, **When** the user clicks outside the map boundary, **Then** the panel closes and the map returns to its default discovery state
3. **Given** no state is locked and no state is hovered, **When** the map is in its default state, **Then** a default prompt message is visible in the panel area (e.g., "Hover or click a state to view data")

---

### User Story 4 - Access Data Without a Map (Priority: P4)

A user on a small screen or using assistive technology cannot or does not interact with the SVG map. They should still be able to access the same state data and download resources through a fallback interface.

**Why this priority**: Accessibility and mobile users represent a significant portion of advocacy audiences. The map interaction model does not translate to small touchscreens or keyboard-only navigation without additional support.

**Independent Test**: The component renders a fully functional non-map interface on viewport widths below 768px that exposes equivalent state selection and download functionality.

**Acceptance Scenarios**:

1. **Given** the user's viewport is below 768px wide, **When** the page loads, **Then** a state-selection interface (e.g., dropdown or list) is presented that allows selecting any state and accessing its download links
2. **Given** the user is navigating by keyboard, **When** they interact with the component, **Then** all states are reachable via keyboard, state names and metrics are announced correctly by screen readers, and download links are activatable without a mouse

---

### Edge Cases

- What happens when a state has no data (no access or participation metrics available)? The panel should render gracefully with a "Data not available" placeholder rather than showing 0% or a broken layout.
- What happens when a download link URL is absent for a state? The corresponding download button should be hidden or visibly disabled rather than pointing to a broken or empty `#` anchor.
- How does the map behave on touch devices where hover events do not fire? The first tap should lock the panel (no hover preview phase); a second tap on the same state or a tap on the background should dismiss it.
- What is the fallback behavior if the external data source (JSON file or CMS) is unavailable or returns an error? The component should render in a gracefully degraded state with an error message rather than silently failing or breaking the page.
- Does the feature collect, expose, transform, or transmit personal data, Student Records, or school-directed data? No — all displayed metrics are aggregate public-policy statistics at the state level; no user-identifying data is involved.
- How is the SVG map handled if it fails to load or render in a browser? The component should degrade to the fallback state-selection interface used for small viewports.
- Which parts of the feature remain server-rendered? The initial map render (states with tier-based fill colors) is server-rendered. The hover-tracking, panel visibility state, and lock behavior are client-only and require an isolated hydration boundary that is explicitly justified in the implementation plan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The component MUST render an interactive choropleth map of all 50 US states and Washington DC as the primary interactive surface on desktop viewports.
- **FR-002**: Each state on the map MUST be visually color-coded according to its assigned policy progress tier, with at least three distinct visual tiers (e.g., Foundation Level, Building Momentum, Policy Leader / Graduation Mandate Passed).
- **FR-003**: The component MUST display a floating data panel showing, for the currently hovered or locked state: state name, policy tier badge, access metric (% schools offering the program), participation metric (% students enrolled), and the calculated gap metric (access % minus participation %).
- **FR-004**: The gap metric MUST be calculated dynamically from the access and participation values at render time; it MUST NOT be stored or hardcoded as a separate field in the data layer.
- **FR-005**: Users MUST be able to hover over a state to preview its metrics in the data panel without requiring a click.
- **FR-006**: Users MUST be able to click a state to lock the data panel, preventing dismissal when the cursor leaves the state boundary.
- **FR-007**: The locked data panel MUST display state-specific download links for at least two asset types: a State Report (PDF via Google Drive) and a State Presentation Deck (Google Slides / PDF).
- **FR-008**: The locked data panel MUST include a visible close/dismiss control that returns the map to its default discovery state.
- **FR-009**: Clicking outside the map area MUST dismiss the locked panel and return the map to its default state.
- **FR-010**: Download links in the locked panel MUST open in a new browser tab and MUST NOT dismiss the locked panel or interrupt the user's session on the page.
- **FR-011**: The underlying state data (metrics, tier labels, and download URLs) MUST be architecturally separated from the rendering logic, structured as a discrete, updatable data layer (e.g., a co-located JSON file) that can be modified without touching UI component code.
- **FR-012**: The component MUST be responsive: on viewports below 768px wide, the interactive map MUST be replaced or supplemented by an accessible state-selection interface (e.g., dropdown) exposing the same download links.
- **FR-013**: The component MUST meet WCAG 2.1 AA accessibility requirements, including: keyboard navigability of state selection, sufficient color contrast ratios for tier fill colors and data panel text against the dark background, and screen-reader-compatible state name and metric labeling.
- **FR-014**: The component MUST NOT introduce any collection of personal data, Student Records, or school-directed data; all displayed metrics are aggregate statistics.
- **FR-015**: The component MUST be embeddable as a standalone unit within an existing page without requiring a new route or Contentful schema change for v1; static JSON data ingestion MUST be supported without a CMS dependency.
- **FR-016**: The component belongs in `apps/marketing` as a page-specific feature given its data specificity and advocacy context. Broadly reusable presentational sub-components (e.g., a generic choropleth map shell or a floating data card) MAY be extracted to `packages/component-library` if they have genuine cross-feature utility. The MUI-based component stack MUST be preserved.
- **FR-017**: The component MUST define validation surfaces including: a Storybook story for visual review, unit tests for data-layer logic (tier assignment, gap calculation, URL resolution), and interaction tests for the hover/lock/dismiss model.
- **FR-018**: The initial map render (state shapes with tier-based fill colors) MUST be server-rendered. The hover-tracking, panel visibility, and lock/unlock state MUST be isolated within a client-only hydration boundary, explicitly justified in the plan.
- **FR-019**: The component MUST have no negative SEO impact: existing page-level metadata, canonical URL, indexing behavior, and sitemap coverage MUST remain unchanged; the component is a client-side enhancement, not a route change.
- **FR-020**: The visual design MUST use a dark-mode aesthetic (consistent with the PoC reference) using the MUI-based design token system where applicable. A standalone dark theme for this component is acceptable if the page context is an isolated dark-background embed.
- **FR-021**: No Contentful schema changes are required for v1. If a future phase moves data to Contentful, the specification MUST identify what was confirmed via Contentful MCP vs. inferred, and any write operations MUST require a human confirmation step followed by a re-read of the resulting state.

## Integration Points *(mandatory when external systems or cross-workspace changes are involved)*

### Systems and Contracts

- **Upstream Inputs**: State data JSON file (per-state: access %, participation %, tier label, report URL, presentation URL) — co-located as a static file in v1; potentially Contentful-sourced in a future phase
- **Downstream Effects**: No new cache tags, analytics events, redirects, or SEO metadata changes introduced; existing page-level metadata is unaffected
- **Runtime Surfaces**: `apps/marketing` page embedding the component; Storybook story in `apps/marketing-storybook` for visual review; client-only hydration boundary for interaction state
- **External Asset Links**: All state report and presentation download links point to Google Drive / Google Slides URLs managed externally by the advocacy team; the component routes clicks to these URLs only
- **Tenant / Hostname Paths**: `http://marketing.marketing-sites.localhost:3001` (development); production Code.org advocacy subdomain

### Data Flow Notes

- On initial render (server): The component renders the static map with tier-based fill colors and the default prompt state; no user-interaction state is set server-side.
- On client hydration: Event listeners for hover and click are attached; the data panel becomes interactive.
- On state hover: The data panel updates in-memory from the pre-loaded data object — no network request is made at interaction time.
- On download link click: The browser opens a new tab to the Google Drive URL; no server request or state change is triggered by the component.
- Failure mode: If the data layer cannot be loaded at build/render time, the component renders a gracefully degraded state with a "Data currently unavailable" message; it MUST NOT throw a fatal error that breaks the host page.
- No Contentful content types or entries are required for v1; static JSON is authoritative.
- No personal data, student records, or consent-gated data is involved; no consent boundary or FERPA guardrail applies.
- SEO metadata, canonical URL, structured data, and sitemap behavior are unchanged by this component.

### Key Entities

- **StateDataRecord**: Represents a single US state or DC; key attributes: state abbreviation (identifier), full display name, policy tier (categorical), access percentage (number 0–100), participation percentage (number 0–100), report download URL (string or null), presentation download URL (string or null). The gap is always derived, never stored.
- **PolicyTier**: A categorical value with at least three levels (e.g., "foundation", "building", "leader") that maps to a distinct fill color on the map and a human-readable badge label in the data panel; determines visual hierarchy at a glance
- **GapMetric**: A derived display value (access % minus participation %) computed from StateDataRecord fields at render time; represents the "implementation gap" between institutional availability and actual student uptake

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from landing on the page to reading a specific state's access %, participation %, and gap metric in under 5 seconds of interaction on a standard desktop browser
- **SC-002**: A user can click a state, move the cursor to the data panel, and successfully activate a download link without the panel dismissing — verified across Chrome, Firefox, Safari, and Edge on desktop
- **SC-003**: All 51 geographies (50 states + DC) are selectable and display correct metrics and working download links when data is present for that state
- **SC-004**: The component passes WCAG 2.1 AA color contrast requirements for all tier fill colors, badge labels, metric values, and body text in the data panel against the dark background
- **SC-005**: On a 375px viewport width (representative small mobile), the component renders a functional state-selection fallback that provides access to the same download links as the desktop map
- **SC-006**: The state data (metrics and download URLs) can be updated by modifying a single JSON data file with no changes required to any component rendering code
- **SC-007**: The component's initial server-rendered HTML includes the map in its default colored state, with no visible layout shift or blank map area on first contentful paint

## Assumptions

- The component will be embedded on an existing Code.org advocacy page within `apps/marketing`; no new route is being created.
- The current dropdown-based download interface at `https://advocacy.code.org/stateofaics/` is a separate LeadPages-hosted implementation; this new component is a replacement or companion feature built within the marketing-sites monorepo and does not require modifying the LeadPages site.
- Download assets (state reports and presentations) will continue to be hosted externally on Google Drive / Google Slides; the component is responsible only for linking to these URLs, not hosting them.
- The SVG map asset (US states SVG) used in the PoC is either already available in the codebase, obtainable from a permissively licensed public source, or will be confirmed during the planning phase.
- The dark-mode aesthetic is intentional for the advocacy embed context and does not need to match the existing light-mode Code.org marketing brand; the component is a self-contained dark-themed widget.
- Touch behavior (first tap = lock, second tap on same state or background = dismiss) is assumed for v1 mobile interaction; detailed touch testing requirements will be confirmed during planning.
- No new Contentful content types are required for v1; the data layer will use a static JSON file. Contentful integration is deferred to a future phase.
- The tier classification logic (which states qualify for which tier) will be confirmed as authoritative with the advocacy data team during planning before being encoded in the data layer; the PoC's heuristic logic is a reference only.
- Existing server-rendered behavior of the host page remains intact; the component introduces a justified client-only hydration boundary limited to its interaction logic.
- No new Student Records, personal data collection, or third-party data sharing is introduced by this feature.
- Shared component-library changes are preferred over app-only forks for any genuinely reusable presentational primitives, unless explicitly justified otherwise during planning.
