---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Every task list MUST include
the validation work required by the specification and constitution. If a test or
review surface is not needed, state why it is omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Marketing app**: `apps/marketing/src/`, `apps/marketing/tests/`
- **Marketing Storybook**: `apps/marketing-storybook/stories/`
- **Design system Storybook**: `apps/design-system-storybook/`
- **Shared packages**: `packages/component-library/`,
  `packages/component-library-styles/`, `packages/fonts/`,
  `packages/lint-config/`
- Paths shown below assume this monorepo layout - adjust based on plan.md
  structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Identify the affected workspaces under `apps/*` and `packages/*`
- [ ] T002 [P] Review whether any new or changed feature data should be modeled in Contentful, prefer reuse or extension of an existing content type, and document the decision before code changes begin
- [ ] T003 [P] Initialize Contentful MCP and capture the relevant space/environment context if Contentful schema or content is in scope
- [ ] T004 [P] Decide whether Contentful work is read-only analysis or requires a human-confirmed write path, and document the re-read step if writes are needed
- [ ] T005 [P] Review whether touched marketing UI should be implemented directly with MUI, whether any legacy design-system dependency must remain temporarily, and whether a contained low-risk MUI migration should happen before code changes begin
- [ ] T006 Confirm local runtime, hostname, and preview/draft implications
- [ ] T007 [P] Identify required Storybook, page-preview, and CI review surfaces
- [ ] T008 [P] Identify affected runtime flows, integration points, and cache or infrastructure sync points
- [ ] T009 [P] Identify availability, performance, security, privacy-policy, and SSR guardrails that must remain unchanged

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T010 Establish base TypeScript types, content models, or shared interfaces required by all stories
- [ ] T011 [P] Set up required route, provider, or middleware scaffolding in `apps/marketing/src/`
- [ ] T012 [P] Set up required package exports, shared styles, or MUI/theme scaffolding in `packages/*`
- [ ] T013 Configure error handling, logging, and observability hooks
- [ ] T014 Configure required environment variables, feature flags, or local setup updates
- [ ] T015 [P] Establish required observability, analytics, privacy, consent, FERPA/student-data, or security guardrails
- [ ] T016 [P] Add required server-rendering, Contentful registration, cache, or infrastructure contract scaffolding

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests or review fixtures FIRST, ensure they fail or expose
> the missing behavior before implementation**

- [ ] T017 [P] [US1] Storybook story, fixture, or preview coverage for [component/flow]
- [ ] T018 [P] [US1] Jest or route-handler test for [behavior] in `apps/marketing/src/**/__tests__/[name].test.ts`
- [ ] T019 [P] [US1] Integration or Playwright coverage for [user journey] in `apps/marketing/tests/[name].spec.ts`

### Implementation for User Story 1

- [ ] T020 [P] [US1] Add or update shared types/models in `apps/marketing/src/types/` or `packages/*`
- [ ] T021 [P] [US1] Add or update component implementation in `apps/marketing/src/components/` or `packages/component-library/src/`
- [ ] T022 [US1] Implement runtime behavior in `apps/marketing/src/app/`, `apps/marketing/src/contentful/`, or `apps/marketing/src/providers/`
- [ ] T023 [US1] Add validation, fallback, and error handling
- [ ] T024 [US1] Add logging, metrics, analytics, or privacy-safe instrumentation for user story 1
- [ ] T025 [US1] Update SSR/client boundaries, Contentful registration, cache, infrastructure sync points, and Storybook CI coverage if required
- [ ] T026 [US1] Review any new or changed user story 1 data for Contentful modeling, prefer reuse or extension of existing content types, and document any need for a new content type
- [ ] T027 [US1] Prefer direct MUI implementation for user story 1 UI work, keep legacy design-system usage only when migration has not happened yet, and migrate touched legacy components when the MUI swap is limited in scope and low risk
- [ ] T028 [US1] Confirm privacy-policy alignment, data minimization, redacted/synthetic fixtures, and MCP-confirmed Contentful model details for user story 1 if applicable
- [ ] T029 [US1] If Contentful writes are needed, show the exact proposed schema/content changes for human confirmation and re-read the final Contentful state

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T030 [P] [US2] Storybook story, fixture, or preview coverage for [component/flow]
- [ ] T031 [P] [US2] Jest or route-handler test for [behavior] in `apps/marketing/src/**/__tests__/[name].test.ts`
- [ ] T032 [P] [US2] Integration or Playwright coverage for [user journey] in `apps/marketing/tests/[name].spec.ts`

### Implementation for User Story 2

- [ ] T033 [P] [US2] Add or update shared types/models in `apps/marketing/src/types/` or `packages/*`
- [ ] T034 [US2] Implement feature behavior in `apps/marketing/src/app/`, `apps/marketing/src/contentful/`, `apps/marketing-storybook/`, or `packages/*`
- [ ] T035 [US2] Update runtime contracts, registrations, or providers as needed
- [ ] T036 [US2] Review any new or changed user story 2 data for Contentful modeling, prefer reuse or extension of existing content types, and document any need for a new content type
- [ ] T037 [US2] Prefer direct MUI implementation for user story 2 UI work, keep legacy design-system usage only when migration has not happened yet, and migrate touched legacy components when the MUI swap is limited in scope and low risk
- [ ] T038 [US2] Integrate with User Story 1 components or routes if needed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T039 [P] [US3] Storybook story, fixture, or preview coverage for [component/flow]
- [ ] T040 [P] [US3] Jest or route-handler test for [behavior] in `apps/marketing/src/**/__tests__/[name].test.ts`
- [ ] T041 [P] [US3] Integration or Playwright coverage for [user journey] in `apps/marketing/tests/[name].spec.ts`

### Implementation for User Story 3

- [ ] T042 [P] [US3] Add or update shared types/models in `apps/marketing/src/types/` or `packages/*`
- [ ] T043 [US3] Implement feature behavior in `apps/marketing/src/app/`, `apps/marketing/src/contentful/`, `apps/marketing-storybook/`, or `packages/*`
- [ ] T044 [US3] Review any new or changed user story 3 data for Contentful modeling, prefer reuse or extension of existing content types, and document any need for a new content type
- [ ] T045 [US3] Prefer direct MUI implementation for user story 3 UI work, keep legacy design-system usage only when migration has not happened yet, and migrate touched legacy components when the MUI swap is limited in scope and low risk
- [ ] T046 [US3] Integrate final user-facing behavior and runtime contracts

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests in `apps/marketing/src/**/__tests__/` or `packages/*/__tests__/`
- [ ] TXXX Security hardening
- [ ] TXXX [P] Accessibility, Storybook, or visual review follow-up
- [ ] TXXX [P] Observability and analytics validation
- [ ] TXXX [P] Security and privacy review follow-up
- [ ] TXXX [P] Cache, redirect, or infrastructure-sync validation
- [ ] TXXX [P] Availability and performance regression validation
- [ ] TXXX [P] SSR and hydration regression validation
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Required tests, stories, fixtures, or preview coverage MUST be created and
  show the missing behavior before implementation
- Shared types, definitions, or package contracts before feature wiring
- Component and Storybook work before route or page integration
- Contentful definitions and registrations before editor-dependent validation
- Core implementation before integration and cross-story wiring
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Independent implementation slices within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Jest or route-handler test for [behavior] in apps/marketing/src/**/__tests__/[name].test.ts"
Task: "Integration or Playwright test for [user journey] in apps/marketing/tests/[name].spec.ts"

# Launch all implementation slices for User Story 1 together:
Task: "Add shared types in apps/marketing/src/types/[name].ts"
Task: "Add Storybook coverage in apps/marketing-storybook/stories/[name].story.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify required validation surfaces fail or expose the missing behavior before
  implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
