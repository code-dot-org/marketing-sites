# Tasks: Interactive Gap Analysis Map

**Input**: Design documents from `/specs/003-gap-analysis-map/`
**Prerequisites**: [plan.md](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/plan.md), [spec.md](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/spec.md), [research.md](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/research.md), [data-model.md](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/data-model.md), [quickstart.md](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/quickstart.md), [state-gap-data.schema.json](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/contracts/state-gap-data.schema.json)

**Tests**: Required by the specification and constitution. This task list includes Jest coverage for interaction and data validation, Storybook coverage in marketing Storybook, and optional focused Playwright only if the embedded advocacy page needs end-to-end protection during implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the concrete marketing-app integration surface, add feature scaffolding, and lock the non-negotiable cache/SSR/accessibility constraints before implementation.

- [x] T001 Confirm the catch-all Experience route and component-registration integration approach in `apps/marketing/src/app/[brand]/[locale]/[[...paths]]/page.tsx` and `apps/marketing/src/contentful/registration/index.ts`
- [x] T002 [P] Create the feature directory scaffold in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/index.ts`, `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`, and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/`
- [x] T003 [P] Create the Storybook scaffold in `apps/marketing-storybook/stories/StateGapMap.story.tsx` and `apps/marketing-storybook/stories/__mocks__/stateGapMapData.ts`
- [ ] T004 [P] Document the no-Contentful-schema decision and synthetic-fixture requirement in `specs/003-gap-analysis-map/plan.md` and `specs/003-gap-analysis-map/quickstart.md` if implementation details evolve
- [ ] T005 [P] Record the validation commands and CI surfaces for this feature in `specs/003-gap-analysis-map/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared data, geometry, registration, and test scaffolding required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create the repo-managed data contract in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/data.ts`
- [x] T007 [P] Create the feature types and derived-value helpers in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/types.ts` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/utils.ts`
- [x] T008 [P] Create the static geometry and inset metadata in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/geometry.ts`
- [x] T009 [P] Create theme token mapping for tier colors and inherited `data-theme` support in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/theme.ts`
- [x] T010 [P] Add dataset/schema validation tests in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/stateGapMap.data.test.ts`
- [x] T011 Add the Contentful component definition in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapContentfulDefinition.ts`
- [x] T012 Register the new component for the Code.org runtime in `apps/marketing/src/contentful/registration/code.org/index.ts`
- [x] T013 [P] Add a smoke registration test for the new component in `apps/marketing/src/contentful/registration/__tests__/index.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Preview a State by Hovering (Priority: P1) 🎯 MVP

**Goal**: Let visitors hover across the US map and instantly preview a state's tier, access, participation, and gap in a floating panel.

**Independent Test**: Load the integrated page or Storybook story, hover several states, and confirm the map highlight and panel content update correctly without clicking.

### Tests for User Story 1

- [x] T014 [P] [US1] Add default and hover-preview Storybook coverage in `apps/marketing-storybook/stories/StateGapMap.story.tsx`
- [x] T015 [P] [US1] Add interaction tests for hover preview, active highlighting, and derived gap display in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMap.test.tsx`
- [x] T016 [P] [US1] Add accessibility assertions for state labeling and panel announcement in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMapRenderer.test.tsx`

### Implementation for User Story 1

- [x] T017 [P] [US1] Implement the client component boundary and conventional entry structure in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/index.ts`
- [x] T018 [P] [US1] Implement the package-backed geographic renderer plus hover hit areas in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx`
- [x] T019 [P] [US1] Implement the floating preview panel shell in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapPanel.tsx`
- [x] T020 [US1] Wire hover state management, derived metric display, and default empty-state behavior in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`
- [x] T021 [US1] Add neutral unavailable-state handling for incomplete records in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapPanel.tsx`
- [x] T022 [US1] Add synthetic Storybook fixture data that matches the schema contract in `apps/marketing-storybook/stories/__mocks__/stateGapMapData.ts`

**Checkpoint**: User Story 1 should be functional and independently testable

---

## Phase 4: User Story 2 - Lock a State and Use Its Downloads (Priority: P2)

**Goal**: Let visitors click a state to pin the panel and use the state-specific report and presentation links.

**Independent Test**: Hover a state, click it, move away, and confirm the panel stays pinned with valid state-specific download actions while unavailable actions stay hidden.

### Tests for User Story 2

- [x] T023 [P] [US2] Add locked-state and download-action Storybook coverage in `apps/marketing-storybook/stories/StateGapMap.story.tsx`
- [x] T024 [P] [US2] Add Jest coverage for click-to-lock, lock transfer, and hidden invalid links in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMap.test.tsx` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMapPanel.test.tsx`

### Implementation for User Story 2

- [x] T025 [P] [US2] Implement locked-selection state transitions in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`
- [x] T026 [P] [US2] Implement state-specific action rendering and external-link behavior in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapPanel.tsx`
- [x] T027 [US2] Ensure hover no longer overrides a locked state and allow click-to-transfer lock in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`
- [x] T028 [US2] Add link-validity guards and CTA suppression for incomplete assets in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/utils.ts` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapPanel.tsx`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Clear the Selection and Resume Exploring (Priority: P3)

**Goal**: Let visitors clear a locked state from either the panel close control or an outside click and immediately return to open exploration.

**Independent Test**: Lock a state, dismiss it via the close control and via outside click, then verify hover-based preview resumes normally.

### Tests for User Story 3

- [x] T029 [P] [US3] Add reset-behavior Storybook coverage in `apps/marketing-storybook/stories/StateGapMap.story.tsx`
- [x] T030 [P] [US3] Add Jest coverage for close-button reset, outside-click reset, and resumed hover behavior in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMap.test.tsx`

### Implementation for User Story 3

- [x] T031 [P] [US3] Implement the close control and locked-panel dismiss behavior in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapPanel.tsx`
- [x] T032 [P] [US3] Implement outside-click detection and reset behavior with React/MUI click-away composition in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`
- [x] T033 [US3] Restore default preview behavior after reset, including keyboard and touch activation parity, in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`

**Checkpoint**: User Stories 1 through 3 should be independently functional

---

## Phase 6: User Story 4 - Understand the National Picture at a Glance (Priority: P4)

**Goal**: Present the full tiered national map clearly on initial load, including usable East Coast small states, Alaska/Hawaii insets, and theme-aware visual treatment.

**Independent Test**: Load the component without interacting and confirm every geography renders with the correct tier treatment, small states remain selectable, Alaska/Hawaii appear in West Coast insets, and the component stays legible on transparent/light and inherited dark themes.

### Tests for User Story 4

- [x] T034 [P] [US4] Add at-a-glance, small-state, inset, and theme-variation stories in `apps/marketing-storybook/stories/StateGapMap.story.tsx`
- [x] T035 [P] [US4] Add Jest coverage for tier styling, East Coast hit areas, and Alaska/Hawaii inset rendering in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMapRenderer.test.tsx`

### Implementation for User Story 4

- [x] T036 [P] [US4] Implement tier-based default fills and theme-inheriting visual tokens in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/theme.ts`
- [x] T037 [P] [US4] Implement East Coast small-state visibility and enlarged selectable hit areas in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/geometry.ts`
- [x] T038 [P] [US4] Implement Alaska and Hawaii West Coast inset placement in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/geometry.ts`
- [x] T039 [US4] Add any at-a-glance legend or tier explanation needed for non-interactive comprehension in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapLegend.tsx` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Complete page integration, regression coverage, and release-quality validation across all stories

- [ ] T040 Integrate the new component into the targeted advocacy-facing page composition in `apps/marketing/src/app/[brand]/[locale]/[[...paths]]/page.tsx`
- [x] T041 [P] Add any page-composition glue needed for the new component in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/index.ts` and `apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx`
- [ ] T042 [P] Add a focused page-level Playwright regression only if the embedded experience needs end-to-end protection in `apps/marketing/tests/e2e/state-gap-map.spec.ts`
- [x] T043 [P] Run and fix focused marketing tests in `apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/` and `apps/marketing/tests/e2e/state-gap-map.spec.ts`
- [x] T044 [P] Run and fix Storybook review coverage in `apps/marketing-storybook/stories/StateGapMap.story.tsx`
- [ ] T045 [P] Validate quickstart scenarios and update any implementation-specific steps in `specs/003-gap-analysis-map/quickstart.md`
- [ ] T046 [P] Verify cache, SEO, preview/draft, privacy, and SSR behavior remain unchanged in `apps/marketing/src/app/[brand]/[locale]/[[...paths]]/page.tsx`, `apps/marketing/src/app/sitemap.xml/route.ts`, and `apps/marketing/src/app/robots.txt/route.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies, can start immediately
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: US1**: Depends on Phase 2
- **Phase 4: US2**: Depends on Phase 2 and builds on US1 component behavior
- **Phase 5: US3**: Depends on Phase 2 and builds on US2 locked-state behavior
- **Phase 6: US4**: Depends on Phase 2 and can proceed alongside US2/US3 if staffing allows
- **Phase 7: Polish**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependency on later stories
- **User Story 2 (P2)**: Depends on US1 because locking extends the base hover-preview interaction and panel shell
- **User Story 3 (P3)**: Depends on US2 because reset behavior operates on locked state
- **User Story 4 (P4)**: Depends on Foundational and shares the core renderer with US1, but can be implemented once the base package/data plumbing exists

### Within Each User Story

- Storybook and Jest coverage should be created before or alongside implementation so missing behavior is explicit
- Data/types/helpers should precede component wiring
- Renderer/package changes should precede panel or route integration when both are touched
- Component registration and page composition should be in place before final page-level verification

### Parallel Opportunities

- Phase 1 tasks marked `[P]` can run in parallel
- In Phase 2, data, geometry, theme, and registration-test scaffolding can run in parallel after the component folder exists
- In US1, the package-backed renderer, panel shell, and test/story files can be worked on in parallel
- In US4, theme tokens, small-state hit areas, and Alaska/Hawaii inset work can be split across separate files and done in parallel
- Polish validation tasks can run in parallel once implementation is complete

---

## Parallel Example: User Story 1

```bash
# Launch coverage work for User Story 1 together:
Task: "Add default and hover-preview Storybook coverage in apps/marketing-storybook/stories/StateGapMap.story.tsx"
Task: "Add interaction tests for hover preview, active highlighting, and derived gap display in apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMap.test.tsx"
Task: "Add accessibility assertions for state labeling and panel announcement in apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMapRenderer.test.tsx"

# Launch independent implementation slices for User Story 1 together:
Task: "Implement the package-backed geographic renderer plus hover hit areas in apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx"
Task: "Implement the floating preview panel shell in apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapPanel.tsx"
Task: "Implement the client component boundary and conventional entry structure in apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMap.tsx and apps/marketing/src/components/contentful/corporateSite/stateGapMap/index.ts"
```

---

## Parallel Example: User Story 4

```bash
# Launch visual-review coverage together:
Task: "Add at-a-glance, small-state, inset, and theme-variation stories in apps/marketing-storybook/stories/StateGapMap.story.tsx"
Task: "Add Jest coverage for tier styling, East Coast hit areas, and Alaska/Hawaii inset rendering in apps/marketing/src/components/contentful/corporateSite/stateGapMap/__tests__/StateGapMapRenderer.test.tsx"

# Launch geometry/theming slices together:
Task: "Implement tier-based default fills and theme-inheriting visual tokens in apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx and apps/marketing/src/components/contentful/corporateSite/stateGapMap/theme.ts"
Task: "Implement East Coast small-state visibility and enlarged selectable hit areas in apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx and apps/marketing/src/components/contentful/corporateSite/stateGapMap/geometry.ts"
Task: "Implement Alaska and Hawaii West Coast inset placement in apps/marketing/src/components/contentful/corporateSite/stateGapMap/StateGapMapRenderer.tsx and apps/marketing/src/components/contentful/corporateSite/stateGapMap/geometry.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate hover preview, accessibility labels, and missing-data fallback independently before adding lock behavior

### Incremental Delivery

1. Deliver the shared dataset, geometry, and registration scaffold first
2. Ship hover preview as the first usable map experience
3. Add click-to-lock and state-specific download actions
4. Add reset behavior for the full interaction loop
5. Finish with at-a-glance tier rendering, East Coast small-state targeting, Alaska/Hawaii insets, theme inheritance, and final page-level validation
