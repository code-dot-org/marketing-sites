---
description: 'Task list for 007-icon-component'
---

# Tasks: Icon Component

**Input**: Design documents from `/specs/007-icon-component/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests + Storybook coverage are required (FR-020, FR-021). Visual baselines are accepted manually in the Applitools dashboard (storybook-eyes gate, see [[project_storybook_eyes_baseline_gate]]).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, or SETUP)

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] **T001** [SETUP] Confirm new directory layout under `apps/marketing/src/components/contentful/icon/` (`Icon.tsx`, `iconContentfulDefinition.ts`, `index.ts`, `__tests__/Icon.test.tsx`).
- [ ] **T002** [SETUP] Document that the new `icon` Contentful content type MUST be human-applied via Studio (see `contracts/contentful-icon-content-type.md`) and confirmed via Contentful MCP before merge.

---

## Phase 2: US1 — Render a Branded Icon Inline (P1)

Goal: bare icon at default values renders correctly with universal brand-color glyph color, brand-family detection, and configurable size.

- [ ] **T003** [US1] Create `apps/marketing/src/components/contentful/icon/Icon.tsx` implementing the contract in `contracts/icon-component-props.md`. Includes:
  - `IconProps` type with `iconName`, `color?`, `backgroundFill?`, `backgroundShape?`, `backgroundColor?`, `iconSize?`, `className?`.
  - Defaults: `color='purplePrimary'`, `backgroundFill='none'`, `backgroundShape='circle'`, `backgroundColor='#f6f6f6'`, `iconSize=32`.
  - Glyph color resolution: `backgroundFill === 'none' ? resolvedCssVarForBrandColor(color, enclosingBg) : cssVarForBrandColor(color)`.
  - Brand-family detection: `fontAwesomeV6BrandIconsMap.has(iconName) ? 'brands' : undefined`, `iconStyle='solid'`.
  - `backgroundFill === 'none'` branch returns `<span className={className}>{glyph}</span>` (no wrapper styling).
- [ ] **T004** [US1] Create `apps/marketing/src/components/contentful/icon/iconContentfulDefinition.ts` exposing `IconContentfulComponentDefinition` with id `icon`, name `Icon`, category `03: Content Building Blocks`, all six fields grouped under `style` (Design tab) — no fields in the Content tab. `color` validations use `brandColorOptionsWithDefault('purplePrimary')` (no legacy filter).
- [ ] **T005** [US1] Create `apps/marketing/src/components/contentful/icon/index.ts` exporting `Icon` (default) and `IconContentfulComponentDefinition` (named) — mirror the Divider/Heading pattern.
- [ ] **T006** [US1] Register Icon on the **code.org** tenant only by adding the import + `{component: Icon, definition: IconContentfulComponentDefinition}` to `apps/marketing/src/contentful/registration/code.org/index.ts`. Leave csforall registration untouched.
- [ ] **T007** [P] [US1] Add unit tests in `apps/marketing/src/components/contentful/icon/__tests__/Icon.test.tsx` covering: default render emits an `<i>` with `fa-solid fa-lightbulb`; `color` prop applies the matching CSS variable; `iconSize` applies; a brand-family icon name (`github`) gets `fa-brands`; `backgroundFill='none'` emits no wrapper styles.
- [ ] **T008** [P] [US1] Add Storybook story `apps/marketing-storybook/stories/Icon.story.tsx` with configurations (a) bare default, (b) brand-family icon name, (c) custom `iconSize`, (d) custom `color` (FR-020 a–d).

---

## Phase 3: US2 — Filled Background (P2)

Goal: filled circle and rounded square render with `#f6f6f6` default and selectable brand color.

- [ ] **T009** [US2] Extend `Icon.tsx` to draw the filled wrapper when `backgroundFill === 'filled'`: `<Box>` with `sx` setting `display: inline-flex`, centered, `width: iconSize * 1.75`, `height: iconSize * 1.75`, `borderRadius: backgroundShape === 'circle' ? '50%' : '25%'`, `backgroundColor: resolveBackground(backgroundColor)`. Include `OUTLINE_WIDTH`/`SHAPE_RATIO`/`SQUARE_RADIUS` constants.
- [ ] **T010** [US2] Extend `iconContentfulDefinition.ts` `backgroundColor` validations to be `[{value: '#f6f6f6', displayName: 'Light Grey (default)'}, ...brand options]`. Confirm `#f6f6f6` is NOT added to the shared `BRAND_COLORS` manifest.
- [ ] **T011** [P] [US2] Add unit tests: `backgroundFill='filled'`, `backgroundShape='circle'` emits wrapper with `border-radius: 50%` and the default `#f6f6f6` background; `backgroundFill='filled'`, `backgroundShape='square'` emits `border-radius: 25%`; passing a brand `backgroundColor` resolves to the matching `cssVarForBrandColor`.
- [ ] **T012** [P] [US2] Extend Storybook story with configurations (e) filled circle with default light-grey, (f) filled square with a brand `backgroundColor`.

---

## Phase 4: US3 — Outline Background (P3)

Goal: outline ring around the icon in circle or rounded square, reusing `backgroundColor` as stroke.

- [ ] **T013** [US3] Extend `Icon.tsx` `outline` branch: same wrapper dimensions and `borderRadius` as filled, but `backgroundColor: 'transparent'` and `border: 2px solid ${resolvedBgColor}`.
- [ ] **T014** [P] [US3] Add unit tests: `backgroundFill='outline'` emits transparent background + 2px solid border in the resolved background color; outer dimensions identical between `filled` and `outline` for the same `iconSize` (SC-007).
- [ ] **T015** [P] [US3] Extend Storybook story with configurations (g) outline circle, (h) outline square.

---

## Phase 5: Conditional contrast switch verification

Goal: confirm the FR-007 conditional behavior — the user's central change request.

- [ ] **T016** [P] [US1] Add unit test: when `backgroundFill='none'` and the test renders the Icon inside a `SectionBackground` provider with `'purplePrimary'`, a `'purplePrimary'` icon resolves to `cssVarForBrandColor('white')` (contrast switch fires).
- [ ] **T017** [P] [US2] Add unit test: when `backgroundFill='filled'` and the test renders the same Icon inside the same `'purplePrimary'` Section provider, the icon resolves to `cssVarForBrandColor('purplePrimary')` (contrast switch suppressed — user's example).

---

## Phase 6: Quality gates

- [ ] **T018** Run `yarn prettier` on touched files (per `[[feedback_run_prettier_before_commit]]`).
- [ ] **T019** Run `yarn lint` on `apps/marketing`.
- [ ] **T020** Run `yarn typecheck` on `apps/marketing`.
- [ ] **T021** Run unit tests for `apps/marketing` covering the new Icon test file.
- [ ] **T022** Build the marketing Storybook (`yarn storybook` or `yarn build-storybook` for `apps/marketing-storybook`) and confirm the new Icon story renders without console errors.

---

## Phase 7: Out-of-code-merge prerequisites

- [ ] **T023** [BLOCKING-MERGE] Human creates the `icon` content type in Contentful Studio matching `contracts/contentful-icon-content-type.md`, then re-reads via Contentful MCP and records confirmation in the PR description.
- [ ] **T024** [BLOCKING-MERGE] Accept new Storybook visual baselines in the Applitools dashboard for the new Icon story (storybook-eyes gate).

---

## Dependencies

- T003 → T004 → T005 → T006 (file → definition → barrel → registration).
- T007, T008 depend on T003.
- T009 depends on T003; T011, T012 depend on T009.
- T013 depends on T009.
- T016, T017 depend on T003 + T009.
- T018–T022 are end-of-phase quality gates; they depend on all preceding implementation tasks.
- T023, T024 are merge prerequisites, run after code is ready.
