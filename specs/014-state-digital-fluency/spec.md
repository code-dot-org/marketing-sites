# Feature Specification: State of Digital Fluency report pages

**Feature Branch**: `014-state-digital-fluency`
**Created**: 2026-11-09
**Status**: Draft
**Input**: User description: "State of Digital Fluency report rebuild — report pages at /state-of-digital-fluency on the Code.org brand, including five reusable display components (Stat, Chart, Scale, Map, Table) built with only the options the report uses. Parity with the Netlify prototype. Studio registration of components is out of scope (after launch). Source of truth: the approved working plan at https://claude.ai/artifact/LFyh2WYZTLLQieP6RXPsQJ."

## Context

The State of Digital Fluency is a public report that scores and ranks all 50 states and DC on digital sciences education. A prototype exists as an internal Netlify app (`AOwen-Code/codeai-digital-sciences-report`, reviewed read only). It's fed by the Policy team's Google Sheet.

The work is split across two specs:

- **Spec 013, `013-digital-fluency-data-pipeline`** (Infrastructure; branch `claude/quirky-wright-7lktbz`, PR #223), owns the data path:
  - the Python pipeline in GitHub Actions
  - the sheet trigger (a relay that can only start this workflow)
  - reading, validating and scoring the sheet
  - writing and publishing the Contentful entry
- **This spec (014)** owns everything the site does with that data:
  - report pages
  - the five display components
  - how the site reads the entry
  - SEO, sitemap and the launch gate
  - the methodology page
  - cutover

Decisions both specs follow (Dee, 2026-11-09):

- **Envelope**: the existing `reportData` content type. One entry, ID `state-of-digital-fluency`. No schema version.
- **Publishing**: the Policy team starts both "Publish to Preview" and "Publish to Production" from the sheet.
  - Preview writes a draft.
  - Production publishes that draft unchanged, without re-reading the sheet.
- **Reading**: strict on shape, tolerant on fields (FR-006).

Where the prototype's code and the methodology document disagree, the code wins. The two deliberate changes, owned by the pipeline, are:

- blank means not reported, never zero
- trends come from the sheet's year columns

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visitor explores the report (Priority: P1)

A visitor (policymaker, advocate, educator or journalist) opens `/state-of-digital-fluency`. They see:

- the national headline figures
- a state map coloured by score band
- the national gender split

They can then:

- hover, focus or tap a state to see its score, rank, access and participation
- follow a state to its page
- compare states on the rankings page by index score, high school access and high school participation

Each state page shows, in the prototype's order:

- the score and its five parts
- the 10 policy tiers
- access by year
- participation and gender
- narratives
- where the state ranks
- the "Data as of" and "Last updated" dates

**Why this priority**: This is the public product. It can be built and reviewed on fixture data before the pipeline delivers live data.

**Independent Test**: With a fixture or a published entry, visit the overview, rankings and several state pages. Compare sections and values with the prototype for the same data. Check keyboard use, the screen-reader tables, phone-width layout and other brands (404).

**Acceptance Scenarios**:

1. **Given** a published report, **When** a visitor opens the overview, **Then** they see the prototype's headline figures, map and gender card for the same data.
2. **Given** the map, **When** a visitor hovers over, focuses or taps a state, **Then** its name, score and band show in the info card, and the gender card switches to that state. Leaving resets both. Activating the state opens its page.
3. **Given** the rankings page, **When** a visitor switches between index score, access and participation, **Then** states are ordered as stored, with unreported states listed last as "Not reported".
4. **Given** a state page with a blank value, **Then** it shows "Not reported", never 0.
5. **Given** any chart or the map, **Then** an equivalent data table and full keyboard access are available.
6. **Given** a visitor who prefers reduced motion, **Then** nothing animates.

---

### User Story 2 - Visitor prints a state report (Priority: P2)

From a state page, a visitor opens the printable report and prints it, or saves it as a PDF from the browser. It follows the prototype's 8-page US Letter layout. Every page shows the state name and the "Data as of" date.

**Why this priority**: The Policy team uses printouts with legislators. The online pages carry the same information.

**Independent Test**: Print several states to PDF. Compare page count and sections with the prototype.

**Acceptance Scenarios**:

1. **Given** a state's printable report, **When** printed on US Letter, **Then** it produces 8 pages with the prototype's sections and no clipped content.
2. **Given** any printed page, **Then** it shows the state name and the "Data as of" date.

---

### User Story 3 - Visitor reads the methodology (Priority: P3)

A visitor opens `/state-of-digital-fluency/methodology`. It is a Studio page carrying the prototype's methodology copy, unchanged.

**Why this priority**: It's needed for credibility, but it's static copy.

**Independent Test**: Open the page on preview (draft) and compare the copy with the prototype's methodology page.

**Acceptance Scenarios**:

1. **Given** the methodology Studio page, **When** a visitor opens it, **Then** it shows the prototype's copy and links back to the report.

---

### User Story 4 - Launch and retire the prototype (Priority: P3)

The public pages stay dark until the first production publish. The Policy team reviews our preview pages side by side with the prototype. Their first "Publish to Production" is the launch. After that, the prototype is retired.

**Why this priority**: It's needed to finish, but it's a procedure on top of US1–US3 and the pipeline.

**Independent Test**: Before the first publish, public URLs return 404 and are missing from the sitemap. After it, they return 200 with public cache headers and appear in the sitemap.

**Acceptance Scenarios**:

1. **Given** no published entry, **Then** every public report URL returns 404 and none is in the sitemap. The preview host shows the draft.
2. **Given** the first publish, **Then** the pages return 200, are cached with SWR and SIE, and appear in the sitemap.
3. **Given** the side-by-side review, **Then** every displayed value matches the prototype, except where the documented pipeline rules differ.

---

### Edge Cases

- **No entry, or never published**: public pages return 404 and are left out of the sitemap. This is the launch gate.
- **Entry shape broken** (missing `states` or `national`, a state without `postal`, a wrong type at the top level):
  - The page doesn't render partial data.
  - During revalidation, the cache keeps serving the last good page (stale-if-error) and an error is logged for alerting.
  - On a first render with no cached page, the visitor sees the site's error page.
- **Individual fields missing or null**: shown as "Not reported". Fields the site doesn't display are ignored.
- **Contentful unavailable**: stale-if-error keeps serving the last good pages.
- **Draft warnings**: shown in a notice on preview pages only.
- **Extra categories** (for example a third gender category): shown on that state's pages only. National figures are whatever the pipeline stored.
- **Brands and locales**:
  - The report exists on the Code.org brand only. Other brands return 404.
  - Every supported locale serves the report, translated on the client like other pages (Dee, 2026-11-09).
- **Unknown state segment**: returns 404. The `methodology` segment is not treated as a state.
- **Privacy**: state-level aggregates only. No personal data, Student Records or new third-party data flows.
- **Rendering**:
  - Pages, charts and the map render on the server.
  - Browser code is limited to chart and map interactivity, rankings tabs and the overview's linked cards.

## Requirements _(mandatory)_

### Functional Requirements

**Pages**

- **FR-001**: The Code.org brand MUST serve these routes, matching the prototype's sections:

  - `/state-of-digital-fluency`: the overview
  - `/state-of-digital-fluency/rankings`
  - `/state-of-digital-fluency/[state]`: 51 pages
  - `/state-of-digital-fluency/[state]/report`: the printable report
  - `/state-of-digital-fluency/methodology`: a Studio page

  The base path MUST be defined in one place, since it may change before launch.

- **FR-002**: Pages MUST read only the `reportData` entry `state-of-digital-fluency`. They MUST fetch it by ID through the existing Contentful client, so the entry-ID webhook refreshes them, and use the standard 15-minute page cache with stale-while-revalidate and stale-if-error.
- **FR-003**: The preview host MUST show the draft entry, with its warnings visible only there.
- **FR-004**: Public pages MUST return 404 until the entry has been published (the launch gate).
- **FR-005**: The Report Archive page MUST NOT be built. Where the prototype's past-report links go is an open content question.

**Reading the data**

- **FR-006**: The site MUST check the entry's overall shape before rendering. If the shape is broken, it MUST throw, so the cache keeps the last good page and an error is logged. Within a valid shape, a missing or null field MUST show as "Not reported", and unknown fields MUST be ignored.
- **FR-007**: The site MUST NOT re-score or recompute national figures. It displays what the pipeline stored.
- **FR-008**: All text from the sheet MUST render as plain text, never as HTML, with line breaks kept.
- **FR-009**: Change figures MUST be hidden when the data marks them as unavailable.

**Components**

- **FR-010**: The report MUST be built from five general-purpose components with no report-specific knowledge:

  - Stat and Stat group
  - Chart: ranked bars with a highlight and a national marker, values by year, and a pie with an optional "other" slice
  - Scale: grouped tier scale
  - Map: a first-party SVG of the US states, coloured by band, with hover, focus and tap details, animation and links
  - Table

  A report adapter turns the data into their inputs.

- **FR-011**: Each component MUST offer only the options the report uses, plus:
  - static and interactive modes
  - a print size
  - a "Not reported" state
  - an equivalent data table
  - keyboard access
  - no animation under reduced motion
- **FR-012**: Components MUST be built with MUI, meet WCAG AA, have no layout shift between their states, and use the brand's colour and typography tokens.
- **FR-013**: Studio registration of the components is out of scope.

**SEO**

- **FR-014**: Each page MUST have a unique title and description, and a self-canonical that includes the locale.
- **FR-015**: The overview, rankings and state pages MUST be indexable and listed in the sitemap only while the entry is published. Printable pages MUST be noindex and left out of the sitemap. The methodology page is covered by the existing Experience sitemap.

**Repo conventions**

- **FR-016**: Affected surfaces:

  - `apps/marketing`: routes, the report module, components, sitemap
  - `apps/marketing-storybook`: stories

  There are no pipeline, workflow or Apps Script changes here; those belong to spec 013.

- **FR-017**: Validation:
  - Jest for data access, reading, routes and sitemap
  - Storybook `play` tests for the five components
  - a contrast unit test
  - one Playwright spec for cache headers, the launch gate and axe
  - the side-by-side check in US4
- **FR-018**: Contentful:
  - `reportData` is confirmed via MCP in `master` and exists in `development` (Dee).
  - The methodology page is a draft built with Dee's OK, then re-read via MCP.
  - The pipeline is the only writer of `reportData`.

### Key Entities

- **Report data entry**: the `reportData` entry `state-of-digital-fluency`, written by the pipeline. It holds `title`, `reportKey`, `dataAsOf`, `data` (JSON), `warnings` (JSON) and `sourceRun`. Its draft is the preview; its published version is live.
- **Report data** (`data`): metadata, national figures and 51 state records with stored scores and ranks. The site's needs are defined in [contracts/report-data.schema.md](./contracts/report-data.schema.md) and handed to spec 013.
- **View models**: per-page projections of the report data that pass only what each page and client island renders.

## Integration Points

### Systems and Contracts

- **Upstream inputs**:
  - the `reportData` entry from the spec 013 pipeline
  - the methodology Experience entry
- **Downstream effects**:
  - page metadata and canonicals
  - sitemap entries while published
  - no new analytics, third-party scripts or redirects
- **Runtime surfaces**:
  - routes under `apps/marketing/src/app/[brand]/[locale]/state-of-digital-fluency`
  - `sitemap.xml/route.ts`
  - `src/modules/stateOfDigitalFluency`
  - `src/components/dataDisplay`
  - marketing-storybook stories
- **Hosts**:
  - `http://code.marketing-sites.localhost:3001/en-US/state-of-digital-fluency`
  - `http://preview-code.marketing-sites.localhost:3001/en-US/state-of-digital-fluency`
  - in production, code.org and `preview-code.marketing-sites.code.org`

### Data Flow Notes

- **Flow**: the pipeline publishes the entry → the existing webhook calls `/api/revalidate`, which runs `revalidateTag(entryId)` → the page re-renders → CloudFront.
- **Cache fallback**: stale-if-error serves the last good page on a Contentful failure or a shape failure.
- **Confirmed via MCP**: `reportData` fields, in Code.org `master`. **Inferred from code**: entry-ID tag revalidation and `sys.id[in]` tagging.
- **To confirm (Dee)**: the publish webhook covers `reportData` entries.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every displayed value on the overview, rankings and all 51 state pages matches the stored data, and its placement matches the prototype.
- **SC-002**: After a production publish, the public pages show the new data within 20 minutes with no deploy.
- **SC-003**: The pages keep serving while Contentful is down or the entry's shape is broken.
- **SC-004**: All report pages pass automated WCAG AA checks with zero violations. Every chart and the map has a table equivalent and full keyboard operation.
- **SC-005**: The pages meet the site's performance budget, with no layout shift from charts or the map.
- **SC-006**: Every printable report is 8 US Letter pages with no clipping.
- **SC-007**: After launch, the Netlify site and the old menu are retired.

## Assumptions

- **Pipeline**: spec 013 delivers the pipeline, sheet trigger, validation and scoring. The data shape in [contracts/report-data.schema.md](./contracts/report-data.schema.md) is our request to it.
- **Launch gate**: pages ship dark, and the first production publish is the launch.
- **Path**: `/state-of-digital-fluency` on code.org for now.
- **Locale**: the report is authored in English, and every supported locale serves it.
- **Chart library**: MUI X Charts, subject to a spike, with visx as the fallback.
- **Map**: a first-party SVG generated from public US Census-based boundaries (Dee).
- **Privacy**: no personal data or new third-party sharing. Existing site analytics apply.
- **Out of scope**: the pipeline, the sheet trigger and Contentful writes of `reportData` (all spec 013), Studio registration, the Report Archive, generated PDFs, methodology changes and removal of the State Gap Map.
