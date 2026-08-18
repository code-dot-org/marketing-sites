# Feature Specification: Activity Catalog Migration to Code.org Brand

**Feature Branch**: `011-activity-catalog-codeorg-migration`
**Created**: 2026-08-18
**Status**: Draft
**Input**: User description: "we need to migrate the activity catalog from csforall to code.org. the catalog page is fully coded, there is no contentful experience entry for it; this is done for performance reasons and we will continue using it this way. we'll get this up on aiday.org with sandbox first, then test everything there, then a later project will be bringing it over to production."

## Clarifications

### Session 2026-08-18

- Q: What URL structure does the migrated catalog use? → A: On the Code.org brand, the Hour of AI catalog lives at `/hour-of-ai/activities` and the Hour of Code catalog at `/hour-of-code/activities` (locale-prefixed, e.g. `/en-US/hour-of-ai/activities`).
- Q: Does the URL change apply to CSforAll too? → A: Code.org brand only. csforall.org keeps its existing `/activities/{hour-of-ai,hour-of-code}` URLs unchanged until retirement; no redirects are needed on either brand (the new paths never existed on Code.org, and CSforAll's paths don't move).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Browse the activity catalog on the Code.org brand (Priority: P1)

A visitor to the Code.org-branded site (aiday.org during the sandbox testing phase) opens the activities catalog page and can browse the full list of activities with hero, facet filtering, and results grid — the same functionality that exists today on CSforAll, presented in Code.org branding.

**Why this priority**: This is the migration itself; without the page rendering under the Code.org brand there is no feature.

**Independent Test**: Load the activities catalog route on the Code.org brand locally (`http://code.marketing-sites.localhost:3001/en-US/hour-of-ai/activities`) and on aiday.org after deploy; the page renders server-side with activities from the Code.org Contentful space (sandbox environment).

**Acceptance Scenarios**:

1. **Given** the Code.org brand host, **When** a visitor requests the activity catalog route, **Then** the page renders with hero, facet bar/drawer, activity results, and footer, using Code.org brand theming, header, and footer.
2. **Given** the Code.org brand host, **When** the page loads, **Then** activity data is served from the Code.org Contentful space (sandbox environment during the testing phase), not the CSforAll space.
3. **Given** the CSforAll brand host, **When** a visitor requests the activity catalog route, **Then** the existing CSforAll catalog continues to work unchanged (CSforAll is retiring but must not break during this project).

---

### User Story 2 - Filter and search activities (Priority: P2)

A visitor on the Code.org catalog filters activities by the available facets (and search where applicable); the URL reflects the selection so filtered views are shareable, matching current CSforAll behavior.

**Why this priority**: Faceted filtering is the core interaction of the catalog; a migrated page without working filters is not testable as "everything works" on aiday.org.

**Independent Test**: On the Code.org brand, apply each facet and confirm the result set narrows appropriately and that clearing filters restores the full set.

**Acceptance Scenarios**:

1. **Given** the catalog page on the Code.org brand, **When** a visitor selects facets, **Then** the visible activities update to match and the state is reflected in the URL/query where the current implementation does so.
2. **Given** a filtered state with zero matches, **When** the results are empty, **Then** the existing empty-state behavior renders correctly under the Code.org brand.

---

### User Story 3 - Catalog is discoverable and SEO-correct on the new brand (Priority: P3)

Search engines and internal links can find the Code.org catalog page: metadata, canonical URLs, and the sitemap reflect the Code.org-brand catalog route correctly for the aiday.org testing phase.

**Why this priority**: Required for launch-readiness verification on aiday.org, but the page is functional without it.

**Acceptance Scenarios**:

1. **Given** the Code.org brand, **When** the sitemap is generated, **Then** it includes `/hour-of-ai/activities` and `/hour-of-code/activities` without breaking existing sitemap behavior (CSforAll sitemap entries stay on the old paths).
2. **Given** the catalog page on the Code.org brand, **When** rendered, **Then** page metadata (title, description, canonical) is correct for the Code.org host.

---

### Edge Cases

- Unknown catalog paths: on the Code.org brand only the two static catalog routes exist — any other `/x/activities` path resolves through the Experience catch-all and 404s unless an Experience page matches; on CSforAll an invalid `[activityType]` segment continues to hit the catalog route's not-found behavior. A valid catalog with zero published activities renders the existing empty state.
- Activity content exists in the CSforAll space but has not been ported to the Code.org space → the page must render gracefully with whatever content exists; content porting completeness is verified before aiday.org sign-off.
- Contentful is slow or unavailable → existing cached/SSR behavior (SWR/SIE freshness model) must be preserved; the catalog must not introduce new availability risk.
- CSforAll brand must remain fully functional during and after this change (separate space, old content model — CSFORALL-COMPAT code paths stay intact).
- Locale handling: the route includes a locale segment; non-default locales must behave the same as the current CSforAll implementation does (no regression, no new localization scope).
- Preview/draft flows must keep their existing non-cacheable protections.
- No personal data, Student Records, or new third-party data flows are involved — the catalog is read-only public content.
- The page remains server-rendered by default; client-side boundaries remain limited to the existing interactive filtering surfaces.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The activity catalog page MUST be served under the Code.org brand (aiday.org host during the sandbox testing phase) as a fully coded route with **no Contentful experience entry**, matching the current architecture; this is intentional for performance and MUST NOT be converted to an Experience page. On the Code.org brand the catalogs live at `/{locale}/hour-of-ai/activities` and `/{locale}/hour-of-code/activities`; the CSforAll brand keeps its existing `/{locale}/activities/{activityType}` URLs unchanged, and no redirects are introduced on either brand.
- **FR-002**: Activity data for the Code.org brand MUST come from the Code.org Contentful space; the sandbox environment is the source during the aiday.org testing phase.
- **FR-003**: The catalog MUST present Code.org brand theming (header, footer, fonts, design tokens) rather than CSforAll branding. The activity catalog retains its documented exemption from the `codeai-` radius token scheme unless the spec review says otherwise.
- **FR-004**: Faceted filtering, search, and empty states MUST function identically to the current CSforAll implementation.
- **FR-005**: The CSforAll-brand catalog MUST continue to function unchanged from its own space/content model until CSforAll is retired.
- **FR-006**: Affected surfaces: `apps/marketing` route/page, activity catalog components, activity data module, sitemap route, and any brand switchboards (middleware/brand config). Shared design-system packages are not expected to change; any change there must be justified.
- **FR-007**: Validation surfaces: existing Jest suites for the catalog components and data module MUST pass and be extended for brand-specific behavior; marketing-storybook coverage for the catalog components MUST continue to pass; manual verification on local Code.org host and on aiday.org.
- **FR-008**: Accessibility (WCAG AA), localization behavior, and tenant isolation MUST be preserved; no analytics or third-party integrations are added.
- **FR-009**: Runtime integration points: brand-aware routing/middleware, Contentful fetch layer (space/environment selection per brand), caching/revalidation for the catalog route, and sitemap generation MUST all be accounted for.
- **FR-010**: Existing cache/SWR/SIE behavior for the catalog route MUST be preserved or improved; no new uncached hot paths.
- **FR-011**: No new React components are expected; any newly touched components stay in the marketing layer and remain MUI-based per current implementation.
- **FR-012**: The page MUST remain server-rendered; the only client boundaries are the existing facet interaction components.
- **FR-013**: No privacy-policy impact: catalog content is public curriculum/activity marketing content; no personal data is collected, displayed, or shared.
- **FR-014**: The Contentful content model for activities in the Code.org space MUST be confirmed via Contentful MCP (or CDA read) during research; discrepancies between the CSforAll (old model) shape and the Code.org space shape MUST be documented before implementation.
- **FR-015**: If activity content types or entries must be created/ported in the Code.org sandbox environment, the exact proposed changes MUST be presented to Dee for confirmation before any write, and resulting state re-read after application.
- **FR-016**: SEO: page metadata and canonical behavior MUST be correct for the Code.org host; the sitemap MUST handle the coded (non-Experience) catalog route for the Code.org brand deliberately — either included via the existing coded-route handling or explicitly excluded during the aiday.org phase, with the decision documented.

## Integration Points _(mandatory)_

### Systems and Contracts

- **Upstream Inputs**: Contentful activity entries (Code.org space, sandbox env), brand host mapping (aiday.org → Code.org brand), locale segment, activity-type route segment (`/{locale}/hour-of-ai/activities`, `/{locale}/hour-of-code/activities` on Code.org), facet query params.
- **Downstream Effects**: Sitemap entries, SEO metadata, cached HTML for catalog routes, search index (in-memory Orama database) built from Contentful data.
- **Runtime Surfaces**: Next.js app route for activities, activity data module, catalog React components, middleware/brand configuration, sitemap route handler.
- **Tenant / Hostname Paths**: `http://code.marketing-sites.localhost:3001` (local Code.org brand), aiday.org (sandbox-backed testing; resolves to the Code.org brand via the default-brand fallback), csforall.org unchanged.

### Data Flow Notes

- Request → brand resolution (host) → server-rendered catalog page → activity fetch from brand-appropriate Contentful space → Orama index/filtering → HTML.
- CSforAll continues reading from its own space with the old content model (CSFORALL-COMPAT); Code.org reads from the Code.org space.
- Contentful state confirmation: to be gathered in research via MCP/CDA read; anything not confirmed is labeled application-code inference.
- Any Contentful content/model writes in the Code.org sandbox environment are proposed → Dee-approved → applied → re-read.
- Production rollout (code.org proper, master environment) is explicitly **out of scope** — a later project.

### Key Entities

- **Activity**: A curriculum/marketing activity entry (title, description, imagery, facet attributes such as grade band, duration, topic, activity type) sourced from Contentful.
- **Facet**: A filterable attribute dimension over activities, driving the facet bar/drawer UI.
- **Activity Type (route segment)**: The path segment that scopes the catalog view — leading segment on the Code.org brand (`/hour-of-ai/activities`, `/hour-of-code/activities`), trailing segment on CSforAll (`/activities/{activityType}`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The activity catalog renders successfully on the Code.org brand locally and on aiday.org, with 100% of activities present in the Code.org sandbox space displayed.
- **SC-002**: All facet filters produce correct result sets on the Code.org brand (spot-checked against the CSforAll catalog for equivalent content).
- **SC-003**: Existing catalog Jest and Storybook suites pass; no regression in CSforAll catalog tests.
- **SC-004**: Catalog route responses on the Code.org brand carry the same cache/freshness headers as other public Code.org routes (SWR default, SIE backstop).
- **SC-005**: No Contentful experience entry exists for the catalog page on the Code.org brand; page performance (server render without experience-resolution overhead) is preserved.

## Assumptions

- aiday.org already serves the Code.org brand from the sandbox Contentful environment (established by the prior launch); this project only adds the catalog route to that surface.
- Activity content will exist in the Code.org space sandbox environment; whether it must be ported from the CSforAll space (and by whom) is a research question — content porting, if needed, is Dee-approved before any write.
- Production rollout (code.org, master environment) is a separate later project; nothing here may break current production behavior.
- CSforAll retirement is planned but out of scope; its catalog stays functional.
- No new shared design-system components are needed; the existing catalog components are reused with brand-appropriate theming.
- Existing server-rendered behavior and client boundaries (facet interactions) carry over unchanged.
- No new personal-data collection, third-party integrations, or analytics are introduced.
