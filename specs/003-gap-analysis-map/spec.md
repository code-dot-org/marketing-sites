# Feature Specification: Interactive Gap Analysis Map

**Feature Branch**: `003-gap-analysis-map`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Generate the product specifications and component architecture for an interactive, map-based data visualization tool designed to display geographical gaps in educational metrics."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preview a State by Hovering (Priority: P1)

A visitor viewing the State of AI + CS experience wants to move across the United States map and instantly see a selected state's policy tier, access rate, participation rate, and gap so they can understand disparities without using dropdowns or leaving the page.

**Why this priority**: This is the primary discovery flow and the core improvement over the current public experience, which relies on separate state selectors for report and presentation downloads plus a separate dashboard link for deeper data exploration.

**Independent Test**: Load the page, move the pointer across several states, and confirm the map highlight and floating panel update correctly for each hovered state without requiring a click.

**Acceptance Scenarios**:

1. **Given** the component is in its default state, **When** a visitor hovers over a state, **Then** that state highlights and the floating panel shows the hovered state's name, policy tier, access value, participation value, and gap value.
2. **Given** the visitor moves directly from one state to another, **When** the hovered state changes, **Then** the panel updates to the newly hovered state without needing to reset first.
3. **Given** the visitor leaves all interactive state regions without locking a state, **When** no state is active, **Then** the panel returns to its default discovery prompt or hidden preview state.

---

### User Story 2 - Lock a State and Use Its Downloads (Priority: P2)

A visitor who has found a state of interest wants to click that state so the panel stays open while they read the metrics and use the state-specific download links for the report and presentation deck.

**Why this priority**: The locked state is what makes the panel actionable. Without it, the visitor cannot reliably use links inside the panel.

**Independent Test**: Hover a state, click it, move the pointer away, and confirm the panel remains pinned with working state-specific links.

**Acceptance Scenarios**:

1. **Given** a state is being previewed, **When** the visitor clicks that state, **Then** the panel locks to that state and remains stable while the pointer moves elsewhere.
2. **Given** a state is locked, **When** the visitor interacts with the report or presentation link, **Then** the correct state-specific destination opens without clearing the locked selection.
3. **Given** a state is locked, **When** the visitor hovers over other states, **Then** the locked state's information remains visible until the lock is cleared.
4. **Given** a state does not have one of the configured downloads, **When** its panel is locked, **Then** only valid links are shown and missing downloads are not presented as broken actions.

---

### User Story 3 - Clear the Selection and Resume Exploring (Priority: P3)

A visitor who has locked a state wants a simple way to dismiss that selection and return to open-ended exploration.

**Why this priority**: Resetting the state is required to compare multiple geographies without confusion or getting stuck in a pinned view.

**Independent Test**: Lock a state, then clear it once with the panel close control and once by clicking outside the map area; in both cases confirm hover-based exploration resumes.

**Acceptance Scenarios**:

1. **Given** a state is locked, **When** the visitor uses the panel close control, **Then** the locked selection clears and the component returns to its default discovery behavior.
2. **Given** a state is locked, **When** the visitor clicks outside the map and panel, **Then** the locked selection clears and the component returns to its default discovery behavior.
3. **Given** no state is locked, **When** the visitor resumes hovering across the map, **Then** state previews work normally again.

---

### User Story 4 - Understand the National Picture at a Glance (Priority: P4)

A first-time visitor wants to understand which parts of the country are lagging, progressing, or leading before interacting with individual states.

**Why this priority**: The map must deliver value even before detailed exploration. The heatmap communicates the national pattern immediately.

**Independent Test**: Load the component and verify that the map communicates the three policy tiers visually, with each state using the correct tier treatment from the underlying data.

**Acceptance Scenarios**:

1. **Given** the component first loads, **When** the visitor sees the map, **Then** each state is already styled according to its assigned policy tier.
2. **Given** multiple states belong to different policy tiers, **When** the visitor compares them visually, **Then** the tier treatments are distinct enough to tell them apart in the default dark presentation.
3. **Given** the component is viewed on a smaller screen, **When** the layout adapts, **Then** the state tiering remains understandable and the panel content remains readable.
4. **Given** a visitor is exploring densely packed East Coast states, **When** they move between those geographies, **Then** each small state remains individually visible and selectable rather than collapsing into an unusable cluster.

### Edge Cases

- A state record may be present but incomplete; the experience must show the state in a neutral unavailable state rather than displaying misleading zeros or broken links.
- A state's participation value may exceed its access value; the displayed gap must still be accurate and understandable.
- A visitor may move quickly across many states; the component must always show the most recently hovered state unless another state is locked.
- A visitor may rapidly click different states; only one state may remain locked at a time.
- A visitor may use touch or keyboard instead of hover; the same core discovery and lock behavior must remain available without requiring a mouse.
- Small East Coast states may be difficult to target at default map scale; the experience must still make each in-scope geography individually perceivable and selectable.
- Alaska and Hawaii are geographically detached from the contiguous United States; the visualization must place them in a clear inset treatment near the West Coast rather than leaving them remote or omitted.
- The component may be embedded on a cacheable public page; interaction failures must not break the surrounding page or weaken the page's existing public-cache behavior.
- The data source may be unavailable during authoring or future CMS migration work; the live experience must fail gracefully and avoid exposing raw errors to visitors.
- The feature must not expose preview-only, draft-only, or non-public data on a public page.
- The feature must not collect, infer, or transmit personal data, Student Records, or school-directed data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The public State of AI + CS experience MUST provide a standalone, map-based United States visualization as the primary way to explore state-by-state disparities between institutional access and student participation.
- **FR-002**: The visualization MUST preserve the current public experience's state-specific download purpose by exposing state report and state presentation actions from the selected state's detail panel instead of requiring separate dropdown-based selectors.
- **FR-003**: Each geography in scope MUST display a categorical policy tier in the default map view so visitors can understand national policy progress before any interaction.
- **FR-004**: Hovering a geography MUST preview that geography's state name, policy tier, access metric, participation metric, and computed gap in a floating information panel.
- **FR-005**: Clicking a geography MUST lock the panel to that geography until the visitor explicitly clears the selection.
- **FR-006**: The locked state MUST remain stable while the visitor moves the pointer away from the map or interacts with actions inside the panel.
- **FR-007**: Visitors MUST be able to clear a locked selection both from an explicit panel control and by clicking outside the active map-and-panel region.
- **FR-008**: The displayed gap MUST always represent the difference between the configured access metric and participation metric for the selected geography.
- **FR-009**: The experience MUST hide unavailable downloads and MUST never present a broken state-specific action.
- **FR-010**: The underlying data for tiers, metrics, and state-specific links MUST remain separate from the presentation so content updates can be made without rewriting the interaction behavior.
- **FR-011**: The data contract MUST be organized so the same component can later be driven by a structured file or CMS-managed content instead of hardcoded state logic.
- **FR-012**: The component MUST support a transparent or light-background presentation by default and MUST inherit the containing experience's `data-theme` light or dark mode when one is provided, while still meeting or exceeding WCAG AA contrast and interaction requirements.
- **FR-013**: The experience MUST support desktop, touch, and keyboard use so state discovery and locked-panel behavior remain available without relying on hover alone.
- **FR-014**: The feature MUST treat Washington, D.C. consistently with the current public experience's state selector inventory unless product direction changes in a later spec.
- **FR-014A**: The map treatment MUST ensure the small East Coast states remain visibly distinct and individually selectable in the primary interaction surface.
- **FR-014B**: Alaska and Hawaii MUST appear in a deliberate inset treatment positioned near the West Coast so they remain visible and selectable within the same map experience.
- **FR-015**: The specification and follow-on plan MUST treat [`apps/marketing`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing) as the runtime surface and [`apps/marketing-storybook`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing-storybook) as the required review surface for the feature; shared package changes should be used only if a reusable primitive is genuinely needed.
- **FR-016**: The feature MUST preserve the repository's SSR-first model by keeping the containing page and its data composition server-rendered while limiting client execution to the smallest interaction boundary required for the map.
- **FR-017**: The feature MUST preserve existing public-route cacheability and availability protections; it must not introduce a new uncached hot-path dependency for public visitors in order to render or interact with the map.
- **FR-018**: Preview and draft behavior MUST remain outside the public caching contract and the feature MUST not weaken redirect, revalidation, or other security protections on the containing page.
- **FR-019**: The feature MUST preserve existing SEO behavior for the containing page unless a later plan intentionally changes metadata, canonical behavior, indexing, structured data, or sitemap inclusion.
- **FR-020**: The feature MUST not introduce new collection of personal data, Student Records, school-directed data, or new third-party data egress beyond visitor-initiated navigation to already approved external state assets.
- **FR-021**: The feature MUST define review coverage through story-driven mocks, focused automated tests for the interaction model, and page-level verification sufficient to confirm accessibility, state selection behavior, and graceful handling of missing data.
- **FR-022**: If the feature later adopts Contentful-managed state data or editor-controlled link sets, the follow-on plan MUST confirm the relevant content model and entry assumptions through Contentful MCP before implementation and MUST require human confirmation for any Contentful writes.

## Integration Points *(mandatory when external systems or cross-workspace changes are involved)*

### Systems and Contracts

- **Upstream Inputs**: A structured set of public, aggregate state records containing a geography identifier, display name, policy tier label, access value, participation value, and optional report and presentation destinations.
- **Downstream Effects**: The selected state panel may route visitors to externally hosted state assets, such as the same public report and presentation destinations currently linked from `https://advocacy.code.org/stateofaics/`.
- **Runtime Surfaces**: The feature affects the public advocacy-facing marketing experience, its embedded interaction boundary, its Storybook review surface, and any focused automated tests that cover state selection and graceful fallback behavior.
- **Tenant / Hostname Paths**: Initial scope assumes the current public advocacy experience path at `https://advocacy.code.org/stateofaics/` and the equivalent `code` branded local runtime path in this repository.

### Data Flow Notes

- Current public baseline: as observed on April 1, 2026, the live State of AI + CS page provides separate "Download state report" and "Download state presentation" selectors plus a link to a broader data dashboard. The new feature should consolidate state discovery and state-specific downloads into a single map-led interaction model.
- The feature should prefer a prebuilt, cache-friendly state dataset that can be shipped with the page or otherwise made available without adding a fragile per-visitor dependency to the public request path.
- The locked panel is the only place where visitors should encounter state-specific download actions; visitors should not need to open a second tool just to identify a state and access its assets.
- The feature does not require new middleware, redirect logic, consent changes, or public-cache policy changes.
- No new SEO surface is required. The containing page should continue to use its existing metadata, canonical, indexing, and sitemap behavior unless later work explicitly changes that contract.
- No Contentful schema or entry assumption has been confirmed for v1 because the requested feature can be specified against a structured local dataset. If structured content is later moved into Contentful, that work requires separate MCP confirmation and human-approved schema changes.
- The feature deals only in aggregate public metrics and public asset destinations; it must not mix in personal data or non-public reporting.

### Key Entities *(include if feature involves data)*

- **State Metric Record**: A public, aggregate description of one geography's policy tier, access value, participation value, and state-specific asset destinations.
- **Policy Progress Tier**: The categorical status used to color the map and summarize where a state sits on the policy rubric.
- **Selection Panel State**: The current interaction mode of the panel: default, hover preview, or locked selection.
- **State Asset Link**: A public destination for a state report or presentation deck associated with the selected geography.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, a visitor can identify any hovered state's policy tier, access value, participation value, and gap from the panel within 5 seconds of moving to that state.
- **SC-002**: In scripted interaction testing, 100% of lock-and-interact scenarios keep the selected state's panel stable until the visitor explicitly clears it.
- **SC-003**: In content validation, 100% of in-scope geographies render the correct categorical tier from the configured dataset on initial load.
- **SC-004**: In link validation, 100% of configured state report and state presentation actions open the correct destination for the selected state, and 0 unavailable actions are shown.
- **SC-005**: In responsive review, the component remains understandable and operable on desktop and touch-sized layouts without losing access to the selected state's metrics or actions.
- **SC-006**: In interaction review, each small East Coast state can be individually selected and read without requiring a fallback dropdown or off-map workaround.
- **SC-007**: In visual review, Alaska and Hawaii remain visible and selectable through West Coast inset placement that keeps them within the primary map composition.
- **SC-008**: In theming review, the component remains legible and visually coherent on transparent, light, and inherited dark theme backgrounds without requiring a separate hardcoded dark-only treatment.
- **SC-009**: In accessibility review, keyboard users and assistive technology users can reach the state selection experience and perceive the selected state's core metrics and actions without relying on pointer hover alone.
- **SC-010**: Updating one or more states' metrics or download destinations can be completed by changing the structured state dataset only, with no required rewrite of the component's user interaction rules.

## Assumptions

- The first release targets the existing public advocacy experience referenced by the current `https://advocacy.code.org/stateofaics/` page.
- Initial scope assumes English-language content and the Code.org public advocacy host only; CSForAll is out of scope for this release unless a later spec expands brand coverage.
- Washington, D.C. remains part of the dataset because it is already included in the current public state download selectors.
- Alaska and Hawaii should be represented through a standard inset-style treatment near the West Coast rather than strict geographic placement.
- The visual container should not force a dark-only skin; it should work on transparent backgrounds or inherit the surrounding page theme.
- The per-state report and presentation destinations remain externally hosted public assets provided by content owners.
- The first release can be planned against a structured repo-managed dataset; CMS authoring is a future enhancement, not a v1 dependency.
- The feature introduces no new analytics requirement unless a later plan explicitly adds one.
- The containing page remains publicly cacheable under the existing SWR and SIE model, and the map's interactivity does not require a cache policy exception.
- The feature is informational and public; no authentication, personalization, or user-generated input is required.
- The map may be embedded within an existing page section rather than requiring a brand-new route, as long as the map remains a standalone, self-contained interaction surface on that page.
