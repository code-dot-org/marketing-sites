# Tasks: Activity Catalog Migration to Code.org Brand

**Input**: Design documents from `/specs/011-activity-catalog-codeorg-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — required by spec FR-007 and the constitution's Quality Gates (Jest for changed behavior; marketing-storybook CI stays green; Playwright omitted per plan: no cross-system cache/redirect/consent/security semantics change).

**Organization**: Tasks are grouped by user story. Contentful schema/content tasks follow the standing write policy: exact proposal → Dee applies/approves → re-read and verify. Target branch for merge is `sandbox` (aiday.org); production is a later project.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (browse on Code.org), US2 (filter/search with full content), US3 (SEO/sitemap)

## Phase 1: Setup

**Purpose**: Confirm the environment and baseline are what the plan assumes

- [x] T001 Confirm `apps/marketing/.env` targets Code.org space `90t6bu6vlf76`, env `sandbox`, and the dev server serves the Code.org brand at `http://code.marketing-sites.localhost:3001` (see quickstart.md)
- [x] T002 [P] Run the existing baseline suites green before changes: `yarn test src/modules/activityCatalog src/components/contentful/activityCatalog src/app/sitemap.xml` in `apps/marketing`
- [x] T003 [P] Re-verify current Contentful sandbox state via read-only CDA (no `activity` type, no `hour-of-ai`/`hour-of-code` tags) so the schema proposal in `contracts/contentful-activity-content-type.md` is still accurate

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared page extraction and the Contentful model both block every story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Extract the shared catalog page implementation (data fetch + Orama setup + hero/catalog/footer composition + metadata builder taking `brand`, `locale`, `activityType`) from `apps/marketing/src/app/[brand]/[locale]/activities/[activityType]/page.tsx` into `apps/marketing/src/modules/activityCatalog/page/activityCatalogPage.tsx` (server component; keep `'use client'` boundaries exactly where they are today)
- [x] T005 Re-point the existing CSforAll route `apps/marketing/src/app/[brand]/[locale]/activities/[activityType]/page.tsx` at the extracted implementation with behavior pinned to today's (CS_FOR_ALL gate, CSforAll canonical/icons, `curriculum` content type) and mark the route `CSFORALL-COMPAT`
- [x] T006 Add brand parameter to `getContentfulActivities` in `apps/marketing/src/modules/activityCatalog/contentful/getContentfulActivities.ts`: `CS_FOR_ALL → 'curriculum'` (CSFORALL-COMPAT comment), otherwise `'activity'`; tag filter unchanged
- [x] T007 [P] Jest: extraction is behavior-preserving — CSforAll route still renders, 404s on invalid activityType, queries `curriculum`, keeps csforall.org canonical; new/updated tests in `apps/marketing/src/modules/activityCatalog/contentful/__tests__/getContentfulActivities.test.ts` and a route test alongside the page
- [x] T008 Present the Contentful proposal to Dee exactly as written in `contracts/contentful-activity-content-type.md` §1–2 (new `activity` type + `hour-of-ai`/`hour-of-code` tags in Code.org `sandbox`), including the pre-check of field types/validations against the CSforAll space's `curriculum` type (source is code-inferred). **Dee applies; no agent schema writes**
- [x] T009 After Dee applies, re-read `sandbox` via CDA/MCP and diff the `activity` type + tags against the contract (§4 verification queries); record confirmed state in research.md

**Checkpoint**: Shared implementation proven behavior-preserving; `activity` model + tags exist in sandbox

---

## Phase 3: User Story 1 - Browse the activity catalog on the Code.org brand (Priority: P1) 🎯 MVP

**Goal**: aiday.org (Code.org brand) serves `/{locale}/hour-of-ai/activities` and `/{locale}/hour-of-code/activities` with Code.org theming, fed from the Code.org sandbox space; csforall.org unchanged

**Independent Test**: `http://code.marketing-sites.localhost:3001/en-US/hour-of-ai/activities` renders hero, results (pilot content), footer with Code.org header/theme; CSforAll suites still green

### Tests for User Story 1

- [x] T010 [P] [US1] Jest route tests for the new pages (gates: CODE_DOT_ORG renders, CS_FOR_ALL/HOC → notFound; metadata: Code.org icons + `https://code.org/{locale}/{activityType}/activities` canonical, including a non-default locale case) in `apps/marketing/src/app/[brand]/[locale]/hour-of-ai/activities/__tests__/page.test.tsx` and `.../hour-of-code/activities/__tests__/page.test.tsx` — write first, confirm they fail
- [x] T011 [P] [US1] Jest: `getContentfulActivities` selects `'activity'` for CODE_DOT_ORG in `apps/marketing/src/modules/activityCatalog/contentful/__tests__/getContentfulActivities.test.ts`

### Implementation for User Story 1

- [x] T012 [P] [US1] Create `apps/marketing/src/app/[brand]/[locale]/hour-of-ai/activities/page.tsx` — thin route: CODE_DOT_ORG-only gate, `activityType = 'hour-of-ai'`, delegates to the shared implementation; `revalidate = 3600` and empty `generateStaticParams` preserved
- [x] T013 [P] [US1] Create `apps/marketing/src/app/[brand]/[locale]/hour-of-code/activities/page.tsx` — same as T012 with `activityType = 'hour-of-code'`
- [x] T014 [US1] Brand-aware metadata in the shared implementation: `getIcons(brand)`, canonical = brand's production root domain + brand's path shape (Code.org: `/{locale}/{activityType}/activities`); title/description/keywords/OG unchanged
- [x] T015 [US1] Make `ActivitiesFooter` cross-catalog links brand-aware in `apps/marketing/src/components/contentful/activityCatalog/activitiesFooter.tsx` (`/{activityType}/activities` on Code.org, `/activities/{activityType}` on CSforAll); extend `apps/marketing/src/components/contentful/activityCatalog/__tests__/activitiesFooter.test.tsx`. Links only — leave styling untouched; the catalog's documented exemption from the `codeai-` radius token scheme stands (spec FR-003)
- [x] T016 [US1] Pilot content: propose 1 pilot `activity` entry (+ its `link` entries and image asset) ported from the CSforAll source per `contracts/contentful-activity-content-type.md` §3; Dee approves; write as draft; re-read and machine-verify field-by-field (watch U+00A0)
- [x] T017 [US1] Manual verification per quickstart.md: both new local URLs render with Code.org header/footer/theme; empty state correct before pilot publish, card correct after; also verify one non-default locale (e.g. `/es-ES/hour-of-ai/activities`) renders and its canonical carries the locale; CSforAll compat verified by T007 suite staying green

**Checkpoint**: MVP — catalog browsable on the Code.org brand with pilot content; CSforAll untouched

---

## Phase 4: User Story 2 - Filter and search activities (Priority: P2)

**Goal**: Full activity content in sandbox; all nine facets, search, URL round-trip, and empty states work on the Code.org brand equivalently to CSforAll

**Independent Test**: On `/en-US/hour-of-ai/activities`, each facet narrows results correctly, `?term=` search works, zero-match shows the existing empty state, and selections survive a page reload via URL

### Implementation for User Story 2

- [x] T018 [US2] Full content batch: enumerate all published CSforAll activities (both tags) from the CSforAll source Dee provides (export or read credentials), build the source→sandbox mapping incl. `link` entries/assets and tag assignments, and present the batch summary (counts per tag, asset list) for Dee's approval
- [x] T019 [US2] Execute the approved batch into Code.org `sandbox` as drafts; remap all cross-references to new sandbox ids; machine-verify every entry by re-read diff against the mapping; report count + diff results; Dee reviews/publishes
- [x] T020 [P] [US2] Jest: facet/search behavior with `activity`-shaped entries (facet extraction, empty-state, URL serialization round-trip) — extend `apps/marketing/src/components/contentful/activityCatalog/__tests__/activityCatalog.test.tsx` and `.../facetBar/__tests__/facetBar.test.tsx` fixtures if any fixture assumes CSforAll-space shapes (synthetic data only)
- [ ] T021 [US2] Manual verification: every facet in `FACET_CONFIG` populates and filters on the Code.org brand; spot-check result sets against the live CSforAll catalog for equivalent content; verify zero-match empty state and clear-filters recovery

**Checkpoint**: Catalog fully functional with complete content on the Code.org brand

---

## Phase 5: User Story 3 - Discoverability and SEO (Priority: P3)

**Goal**: Sitemap and page metadata are correct for the Code.org brand's new paths; CSforAll sitemap unchanged

**Independent Test**: `http://code.marketing-sites.localhost:3001/sitemap.xml` lists `/hour-of-ai/activities` and `/hour-of-code/activities`; page `<head>` shows Code.org favicons and `https://code.org/...` canonical

### Tests for User Story 3

- [x] T022 [P] [US3] Jest: sitemap emits the new paths for CODE_DOT_ORG, the old paths for CS_FOR_ALL, and neither for HOC in `apps/marketing/src/app/sitemap.xml/__tests__/route.test.ts` (create if absent) — write first, confirm it fails

### Implementation for User Story 3

- [x] T023 [US3] Extend `apps/marketing/src/app/sitemap.xml/route.ts`: emit `/hour-of-ai/activities` + `/hour-of-code/activities` for `Brand.CODE_DOT_ORG`; leave the CSforAll `/activities/{activityType}` emission and response headers untouched
- [x] T024 [US3] Manual SEO/cache verification per quickstart.md: sitemap entries, canonical, favicon set, and OG tags on both new local URLs; compare response `Cache-Control`/freshness headers of a new catalog route against an existing public Code.org route (must match the SWR/SIE pattern — SC-004); confirm draft/preview flow stays non-cacheable (no public `Cache-Control` in draft mode)

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T025 [P] Full regression: `yarn test` for `apps/marketing` (at minimum all activityCatalog, activities routes, and sitemap suites), typecheck, and lint
- [ ] T026 [P] Marketing-storybook CI path green (catalog components changed only in `activitiesFooter`; no new stories needed — components are pre-existing and visually unchanged; state this in the PR if no story is added)
- [x] T027 Run `yarn prettier` on all touched packages before every commit (husky pre-commit hook is non-executable in this repo)
- [x] T028 Update research.md with the final MCP/CDA-confirmed sandbox state (type, tags, entry counts) and mark which items moved from code-inferred to confirmed; include a one-line confirmation that no Contentful Experience entry exists for the catalog routes (SC-005)
- [ ] T029 Final quickstart.md walkthrough end-to-end on local; then, **with Dee's explicit OK**, open a PR to the `sandbox` branch (summary bullets only, no test-plan section, no AI attribution); Dee handles review/merge/deploy and the aiday.org checklist

**Deferred (recorded, not tasked here)**: relocating `ActivityCollection` out of `components/csforall/` (research.md D7); `carousel.slides` validation addition for activity carousels; all `master`-environment/production work (research.md D8).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none — start immediately; T002/T003 parallel
- **Foundational (Phase 2)**: T004 → T005 → T007; T006 parallel with T005; T008 → T009 (Dee's schema application gates T009, T016, T018–T019 but NOT the code tasks)
- **US1 (Phase 3)**: code tasks (T010–T015) need T004–T007 only; T016 needs T009; T017 last
- **US2 (Phase 4)**: T018–T019 need T009 (+ CSforAll source access from Dee); T020 needs T004–T006; T021 needs T019 + US1 routes
- **US3 (Phase 5)**: T022 → T023 → T024; independent of US2, needs US1 routes only
- **Polish (Phase 6)**: after desired stories complete; T029 strictly last and approval-gated

### Parallel Opportunities

- T002 ∥ T003; T007 ∥ T006; T010 ∥ T011; T012 ∥ T013; the Contentful track (T008–T009, T016, T018–T019) runs in parallel with the entire code track after Phase 2 code tasks — code is verifiable against an empty sandbox (empty-state render) before content lands
- US3 can proceed in parallel with US2 once US1's routes exist

---

## Implementation Strategy

**MVP first**: Phases 1–3 deliver a browsable Code.org catalog with pilot content — deployable to aiday.org for early smoke-testing while the full content batch (US2) is prepared. Each later story layers on without touching earlier behavior. The two blocking human gates are called out explicitly: schema application (T008) and batch approval (T018); everything code-side is sequenced so neither gate stalls development.
