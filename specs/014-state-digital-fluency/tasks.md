# Tasks: State of Digital Fluency report pages

**Input**: Design documents in `/specs/014-state-digital-fluency/`: plan.md, spec.md, research.md, data-model.md, contracts/report-data.schema.md and quickstart.md.

**Tests**: These are required. Spec FR-017 names Jest, Storybook `play` tests, a contrast test, Playwright with axe, and a side-by-side check.

**Prototype reference**: `AOwen-Code/codeai-digital-sciences-report` at HEAD `497afed` (private). Read it with `gh`, read only. Pages: `index.html`, `ranking.html`, `states/state.html`, `reports/report.html`, `methodology.html`.

**Upstream**: spec 013 (Infrastructure, PR #223) owns the pipeline, the sheet trigger and every write to `reportData`. Nothing in this task list writes `reportData`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on unfinished tasks).
- **[Story]**: US1–US4 from spec.md.
- Path shorthands:
  - `M/` = `apps/marketing/`
  - `SB/` = `apps/marketing-storybook/`
  - `MOD/` = `apps/marketing/src/modules/stateOfDigitalFluency/`
  - `DD/` = `apps/marketing/src/components/dataDisplay/`
  - `ROUTE/` = `apps/marketing/src/app/[brand]/[locale]/state-of-digital-fluency/`

---

## Phase 1: Setup

- [x] T001 Add dependencies to `M/package.json` and run `yarn install`. Use the newest version of each that's at least two weeks old.
  - Dependencies: `@mui/x-charts@8.29.3`, `zod@^3.25.76`.
  - DevDeps: `us-atlas@3.0.1`, `topojson-client`, `topojson-simplify` and `d3-geo`, plus their `@types/*` packages.
- [x] T002 [P] Create `MOD/paths.ts` with `REPORT_BASE_PATH = '/state-of-digital-fluency'`, the only place the path is defined, plus the helpers `overviewPath`, `rankingsPath`, `statePath(slug)`, `printPath(slug)` and `methodologyPath`. Each takes an optional locale.
- [x] T003 [P] Create `MOD/constants.ts` with:
  - `REPORT_ENTRY_ID = 'state-of-digital-fluency'`
  - `POLICY_KEYS` and `POLICY_GROUPS`:
    - System Levers: plan_guidance, standards, sea_position, data_reporting
    - Student Experiences: diploma_req, counts_grad, require_offer
    - Teacher Supports: pd_funding, credentialing, preservice
  - The policy and tier display labels from `state.html`
  - `JURISDICTIONS`: the 51 entries of `{postal, name, slug}`, where the slug is the lowercase postal code
  - The band and tier colours from research R4
- [x] T004 [P] Create the synthetic fixture `MOD/__tests__/fixtures/reportData.json`. It must match data-model.md and use made-up values, including:

  - an unscored state (blank participation)
  - "Not reported" fields
  - a state with a third gender category
  - multi-line narratives with `•` bullets
  - `trendsAvailable` with only access set to true

  Re-export it for stories from `SB/stories/__mocks__/stateOfDigitalFluency.ts`.

- [ ] T005 **Manual, Dee:** confirm the Contentful publish webhook covers `reportData` entries and sends `entryId` (Settings → Webhooks). Record the result in research R5.

---

## Phase 2: Foundational

- [x] T006 Create `MOD/types.ts` with the `ReportData` types from data-model.md. Types only, no runtime imports.
- [x] T007 [P] Create `MOD/reportShape.ts`, a Zod structural check covering only:

  - `meta`, `national` and `states[]` are objects
  - each state has string `postal` and `name`
  - `.passthrough()`, with every other field optional

  Tests in `MOD/__tests__/reportShape.test.ts`:

  - the fixture passes
  - a missing `states`, a non-object `national`, or a state without `postal` fails
  - extra or unknown fields pass

- [x] T008 [P] Once spec 013's payload schema (`pipelines/digital-fluency/schema/*.json`) is on `main`: add `MOD/__tests__/payloadSchemaParity.test.ts`, which validates the fixture against that schema with `ajv`. Ajv is already in the dependency tree; check that it's declared, and add it as a devDep if not. Until then, mark the test as skipped with a reason.

---

## Phase 3: User Story 1 - Visitor explores the report (P1) 🎯 MVP

**Goal**: the overview, rankings and 51 state pages on Code.org: server-rendered, accessible, gated until published.

**Independent test**: on the preview host with a draft entry, the pages match the prototype's sections. Other brands return 404. The public pages return 404 without an entry.

### Components: spike, tests and stories

- [x] T009 [US1] **Spike:** check MUI X Charts 8.29.3 in a scratch story:

  - it renders SVG on the server at a fixed size
  - `skipAnimation` follows reduced motion
  - keyboard and screen-reader behaviour
  - theme colours
  - how much it adds to the bundle

  Record the result in research R3. If it fails, switch to visx and update plan.md.

- [x] T010 [P] [US1] Write `M/scripts/generateUsStatePaths.ts`:

  1. Load `us-atlas/states-albers-10m.json` and simplify it with `topojson-simplify`, keeping small states legible.
  2. Convert each state to a path `d` string with `d3-geo` `geoPath()` (no projection), keyed by postal code via a FIPS-to-postal table.
  3. Write `DD/map/usStatePaths.ts` containing `{viewBox: '0 0 975 610', paths, dcCallout: {cx, cy, r}}` under a "generated, do not edit" header.

  Run it and commit the output.

- [x] T011 [P] [US1] `SB/stories/Stat.story.tsx`: Stat and StatGroup, showing a value out of a max, a percentage, a delta, "Not reported" and the print size. Add a `play` test for the accessible text.
- [x] T012 [P] [US1] `SB/stories/Chart.story.tsx`:
  - Stories:
    - ranked bars (51) with a highlighted state and a dashed national marker
    - bars by year, with gaps hatched "N/A" and national ticks
    - a pie with an optional "other" slice and a minimum visible slice
    - interactive and static versions, print size, and "Not reported"
  - `play` test: toggle the legend with the keyboard, and check the table equivalent is present.
- [x] T013 [P] [US1] `SB/stories/Scale.story.tsx`: 10 policies in three groups, each with a five-segment tier bar and a pill, plus "Not reported". Add a `play` test for list semantics.
- [x] T014 [P] [US1] `SB/stories/ReportMap.story.tsx`: bands and a "Not reported" pattern on fixture data. The `play` test should:
  - tab to a state and check its aria-label
  - check the active-state callback fires
  - press Enter to follow the link
  - check the DC callout can be focused
- [x] T015 [P] [US1] `SB/stories/DataTable.story.tsx`: caption, number alignment, "Not reported" and a highlighted row. Add a `play` test for header scopes.
- [x] T016 [P] [US1] `DD/__tests__/contrast.test.ts`: check each band and tier fill against its label colour, and each text token against the background. Text must reach 4.5:1 and graphics 3:1.

### Components: implementation (direct MUI, generic)

- [x] T017 [P] [US1] `DD/stat/Stat.tsx` and `StatGroup.tsx` (server components). Props: `{label, value, max?, unit?, delta?, emptyLabel, size}`.
- [x] T018 [P] [US1] `DD/table/DataTable.tsx` (server component):
  - an MUI Table with a caption, `scope` headers, `highlightKey` and `emptyLabel`
  - a visually hidden variant, used as the equivalent of every chart and of the map
- [x] T019 [P] [US1] `DD/scale/Scale.tsx` (server component): grouped items, each with a segmented level bar and a pill. Colours come from props.
- [x] T020 [US1] `DD/chart/` (client components wrapping `@mui/x-charts`): `RankedBars`, `YearBars` and `Pie`.

  - A fixed aspect ratio, so nothing shifts as it loads.
  - `interactive` turns the tooltip and highlight on.
  - `skipAnimation` when the reader prefers reduced motion.
  - The national marker is drawn as a reference line.
  - Always render the `DataTable` equivalent.

  Depends on T009.

- [x] T021 [US1] `DD/map/`, depending on T010:
  - `UsMap.tsx` (server component): the SVG with every state as a `role="link"` path with an aria-label, plus the DC callout, the legend and a "Not reported" pattern.
  - `UsMapInteractive.tsx` (client island): hover, focus and selected states, the tooltip, and `onActiveChange(code | null)`.
  - CSS transitions, off under reduced motion, and a fixed `viewBox`.

### Data access and routes: tests

- [x] T022 [P] [US1] `MOD/__tests__/getReport.test.ts`. Check that it:
  - uses `getEntries({'sys.id[in]': 'state-of-digital-fluency', limit: 1})` and never `getEntry`
  - picks the preview or delivery API from `draftMode()`
  - returns null when the client is missing, there are no items, or the fetch fails
  - throws and logs on a shape failure
- [x] T023 [P] [US1] `MOD/__tests__/readReport.test.ts`. Check that:
  - unknown fields are ignored
  - missing or null fields come out as "Not reported"
  - `trendsAvailable` hides change figures
  - text stays plain, with line breaks kept
  - each view model includes only its page's fields
- [x] T024 [P] [US1] `ROUTE/__tests__/routes.test.tsx`, with `notFound` mocked to throw. Cover:
  - the brand gate on CSforAll and Hour of AI
  - the launch gate: a null `getReport` gives 404
  - an unknown `[state]` gives 404
  - `generateMetadata` for the overview, rankings and one state: title, description and a self-canonical with the locale
  - the draft warnings notice, which appears only in draft mode
- [x] T025 [P] [US1] Extend `M/src/app/sitemap.xml/__tests__/route.test.ts`:
  - report URLs in every locale appear only when the Code.org report exists
  - they never appear for other brands
  - a report fetch error doesn't fail the sitemap

### Data access and routes: implementation

- [x] T026 [US1] `MOD/getReport.ts`: `import 'server-only'`, use `getContentfulClient` from `M/src/contentful/client`, and behave as described in T022.
- [x] T027 [US1] `MOD/readReport.ts`: `toOverviewModel`, `toRankingsModel` and `toStateModel(postal)`.
- [x] T028 [US1] `MOD/metadata.ts`, following `M/src/modules/activityCatalog/hourOfAi/metadata.ts`:
  - use `getProductionCanonicalRootDomain(brand)` with the locale and `getIcons(brand)`
  - printable pages get `robots: {index: false, follow: true}`
- [x] T029 [US1] `MOD/sections/DraftWarnings.tsx`: an MUI Alert listing the entry's `warnings`, shown only in draft mode. Accept either strings or `{row, column, message}` objects, since spec 013 sets the shape.
- [x] T030 [US1] `MOD/sections/overview/`, matching `index.html`:

  1. A header with "Data as of".
  2. A strip of six stats: average score; the number of states scoring 81–100, 51–80 and 0–50; average high school access; and average high school participation.
  3. A map card with its legend and a "How the score works" link.
  4. An info card for the hovered state.
  5. A gender card that switches to the hovered state and resets on leave.

  One client island, `OverviewMapPanel.tsx`, holds the map and both cards, and receives only their fields.

- [x] T031 [US1] `MOD/sections/rankings/`, matching `ranking.html`:

  - the score card: formula text, tier legend, and ranked bars, with unscored states last as "Not reported"
  - Access and Participation lists, with unreported states last
  - every row links to its state page
  - MUI Tabs switch between the lists; all panels render on the server

  The tabs are a small client island.

- [x] T032 [US1] `MOD/sections/state/`, matching `state.html`, in this order:

  1. Navigation.
  2. Header with "Ranked #n nationwide".
  3. Score hero with the five component stats and the change tag, when available.
  4. Policies: the Scale, then the intent and recommendation narratives.
  5. Access card: bars by year with national ticks, the change, and the narrative.
  6. Participation card: a large stat, the national average, the narrative, a gender pie (three slices when "other" is reported), the national gender line, and the senior cohort, if present. With no participation data, show "Participation data not yet available".
  7. "Where <State> Ranks Nationally": three ranked bar charts with the state highlighted and the national marker.
  8. Previous and next state, by rank.
  9. Footer with "Data as of" and "Last updated".

  Narratives use `white-space: pre-line`.

- [x] T033 [US1] Add `page.tsx`, `rankings/page.tsx` and `[state]/page.tsx` under `ROUTE/`. Each one:
  - exports `revalidate = 900`, with the CloudFront note copied from the Experience route
  - has `generateStaticParams` return `[]`
  - returns `notFound()` unless the brand is `Brand.CODE_DOT_ORG`
  - returns `notFound()` when `getReport()` is null
  - has a `generateMetadata` that calls `MOD/metadata.ts`
  - renders `<main>` with the section and `DraftWarnings`
- [x] T034 [US1] Edit `M/src/app/sitemap.xml/route.ts`: for Code.org, call `getReport()` inside try/catch. When it returns data, write the overview, rankings and every `/state-of-digital-fluency/{slug}` with `writeSitemapEntry`.
- [x] T035 [US1] `M/tests/e2e/stateOfDigitalFluency.spec.ts`, following `tests/e2e/cache.spec.ts`:

  - public overview: either 404, or 200 with `STALE_WHILE_REVALIDATE_FIFTEEN_MINUTES` and `stale-if-error`
  - preview: `private, no-store`
  - `@axe-core/playwright` scans of the overview, rankings and one state page find no violations

  Skip when the test environment has no entry.

**Checkpoint**: the report can be browsed on the fixture. The public pages stay dark until the first publish.

---

## Phase 4: User Story 2 - Visitor prints a state report (P2)

**Goal**: an 8-page US Letter report per state, matching `report.html`.

**Independent test**: printing several states to PDF gives 8 pages each, with no clipping, and the state name and "Data as of" on every page.

- [x] T036 [P] [US2] `ROUTE/__tests__/printRoute.test.tsx`: brand gate, launch gate, 404 for an unknown state, noindex, and eight `section[data-print-page]` elements.
- [x] T037 [US2] `MOD/sections/print/PrintLayout.tsx` plus `print.module.scss`:
  - letter pages: 8.5in by 11in, 0.35in margins, `break-after: page`
  - `@media print` hides the site header, footer and print navigation
  - each page header shows the state name and "Data as of"
  - components use `size="print"` and `interactive={false}`
- [x] T038 [US2] `MOD/sections/print/pages/`, matching `report.html`:
  1. Profile: score hero, policies Scale with intent and recommendation, access bars, participation and gender pie. No senior cohort.
  2. Score ranking, with a summary panel and the tier thresholds.
  3. Access ranking.
  4. Participation ranking.
  5. Score deep dive. Keep the prototype's copy unchanged (open item 3). Include the change line when available, all four narratives, and "A Call to Action".
  6. National overview: the cover, and "AI Policy Landscape" counts of states at developing or above for standards, pd_funding, diploma_req and plan_guidance.
  7. National trends: national access bars, participation, the national gender pie in the correct colours, "Why This Matters", and the four static highlight cards (LA, NC, WV, TN) with their copy from `report.html`.
  8. Compact national rankings, with this state highlighted.
- [x] T039 [US2] `ROUTE/[state]/report/page.tsx`: the same gates and `revalidate` as T033, with the printable metadata. Link to it from the state page's navigation as "View full printable report".

---

## Phase 5: User Story 3 - Visitor reads the methodology (P3)

**Goal**: `/state-of-digital-fluency/methodology` serves a Studio Experience with the prototype's copy.

**Independent test**: the preview draft's copy matches `methodology.html`.

- [x] T040 [US3] `ROUTE/methodology/page.tsx`:
  - reuse the Experience page's `generateMetadata` and default render from `M/src/app/[brand]/[locale]/[[...paths]]/page.tsx`, with `paths = ['state-of-digital-fluency', 'methodology']`
  - export `revalidate = 900`
  - if those exports can't be reused directly, pull out a shared helper with no change in behaviour
- [x] T041 [P] [US3] `ROUTE/__tests__/methodologyRoute.test.tsx`:
  - the page resolves the fixed slug
  - it returns 404 when the Experience doesn't exist
  - `[state]` doesn't catch `methodology`
- [x] T042 [US3] **Contentful (Dee approved the draft on 2026-11-09):** build the methodology Experience as a **draft** in Code.org master with the `codeai-page-build` skill.
  - Slug: `state-of-digital-fluency/methodology`.
  - Copy from `methodology.html`, unchanged.
  - Past-report links only if open item 2 is decided that way.
  - Re-read it through MCP. Dee publishes it.
  - Done 2026-11-11: entry `35uj6fs1yyWdeEElPw1ETp` (draft v5). The Word download links unpublished asset `3SjSlvqThqQ3ih8inKtPM6`; publish both with the report.

---

## Phase 6: User Story 4 - Launch and retire the prototype (P3)

**Goal**: dark until the first publish, a side-by-side review on preview, launch, and retirement of the prototype.

- [ ] T043 [US4] **Manual, after spec 013 delivers preview:** review the preview pages side by side with the prototype for 5 states. Pick ones with complete data, blank participation, and a third gender category. Any difference must trace to a documented pipeline rule.
- [ ] T044 [US4] **Launch, Dee's call:** the Policy team runs "Publish to Production". Check that the public pages return 200, the sitemap lists them, and the cache headers are correct.
- [ ] T045 [US4] **Manual, Policy team and Infrastructure:** remove the old menu items, revoke the old GitHub token, retire the Netlify site, and archive the prototype repo.

---

## Phase 7: Polish

- [ ] T046 [P] Accept the Eyes baselines for the new stories in Applitools.
- [x] T047 [P] Run `yarn lint:fix` and prettier from each touched workspace directory, then `yarn lint` and `yarn test`.
- [ ] T048 Run `yarn workspace @code-dot-org/marketing-storybook test:ui:ci`. Report the new stories separately from unrelated suites.
- [x] T049 Run `yarn release:dryrun`.
- [ ] T050 [P] Update the working plan artifact (https://claude.ai/artifact/LFyh2WYZTLLQieP6RXPsQJ) and the research open items with any decisions made during the build.

---

## Dependencies

- Setup (T001–T005), then Foundational (T006–T008), then US1.
- US1 runs on the fixture alone. Live data needs spec 013.
- US2 needs US1's components, `readReport` and the gates.
- US3 is independent; T042 is already approved.
- US4 needs US1–US3 and spec 013's preview and publish.

## Parallel examples

- After T008: stories and tests T010–T016 run in parallel, and so do components T017–T019.
- Data and route tests T022–T025 run in parallel, followed by T026–T029.
- US3 (T040–T042) can run alongside US1.

## Implementation strategy

1. **MVP is US1 on the fixture.** It shows the full report without waiting for the pipeline.
2. Add **US2** (print) and **US3** (methodology).
3. Switch to live preview data when spec 013 delivers, then do **US4**.

Commit at each checkpoint.
