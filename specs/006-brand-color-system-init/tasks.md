---
description: 'Task list for Brand Color System Initialization'
---

# Tasks: Brand Color System Initialization

**Input**: Design documents from `/specs/006-brand-color-system-init/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓ — 2 schemas)

**Tests**: Test tasks ARE included. The constitution (Principle IV — Quality Gates Are Release Gates) and plan.md require Jest unit coverage for the contrast-switch resolver and Storybook coverage for affected components. Visual regression flows through `marketing/storybook-eyes` (Applitools); baseline acceptance is required per existing CI process. No Playwright coverage is required because the feature does not introduce new caching/redirect/consent/analytics/cross-system runtime behavior.

**Organization**: Tasks are grouped by user story. Setup is minimal because the monorepo and branch already exist. Foundational tasks (manifest + CSS primitives) are blocking prerequisites for all three user stories. csforall files are explicitly excluded from every task per the soft-isolation decision in research.md §10.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps task to US1, US2, or US3 from spec.md
- All paths absolute from repo root

## Path Conventions

- **Marketing app**: `apps/marketing/src/`
- **Marketing Storybook**: `apps/marketing-storybook/stories/`
- **Shared package**: `packages/component-library-styles/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm preconditions before touching code. No project initialization needed — the workspaces, branch (`006-brand-color-system-init`), and dev environment already exist.

- [x] T001 Confirm the working branch is `006-brand-color-system-init` and the local dev environment runs the marketing app on `http://code.org.marketing-sites.localhost:3001` and the storybook on its default port
- [x] T002 [P] Confirm Contentful MCP is NOT required for this feature — `BRAND_COLOR_OPTIONS` and component definitions are authored entirely in application code; no Contentful schema, validation list, or entry change is in scope (per plan.md Constitution Check ⊢ Spec-Driven Incremental Delivery; research.md §5)
- [x] T003 [P] Confirm the file path that currently hosts the `--codeai-*` CSS primitives (presumed `packages/component-library-styles/primitiveColors.scss` per research.md anchors) and that `packages/component-library-styles/colors.scss` is the file that hosts the existing `[data-theme='Light'|'Dark']` blocks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared manifest and the SCSS primitives. All three user stories depend on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Extend `BRAND_COLORS` in `apps/marketing/src/components/common/colors.ts` with the 22 new tokens (5 families × 4 shades + black; white already exists). Each new entry uses the existing `{ value, displayName, cssVar }` shape and adds two new fields `family` and `shade` per `data-model.md` and `contracts/brand-color-token.schema.json`. Naming convention: `{family}{Shade}` for family tokens (`purpleDark`, `bluePrimary`, `pinkMid`, etc.) plus `black`. Export new TypeScript types `BrandColorFamily` and `BrandColorShade` derived from the manifest. Confirm `BRAND_COLOR_OPTIONS` includes the new values (extend explicitly if hand-maintained; verify auto-derivation if computed). Preserve existing legacy entries (`primary`, `white`, `purple`, `darkPurple1`, `darkPurple2`, `lightGreen3`) unchanged so existing Contentful entries continue to validate.
- [x] T005 [P] Add 22 new `--codeai-{family}-{shade}` CSS custom properties to `packages/component-library-styles/primitiveColors.scss` using the hex values from the Brand Palette table in `spec.md` (Purple `#1F1976`/`#4C42CF`/`#ACA8EA`/`#E4E2F8`; Blue `#06338D`/`#0099F3`/`#6FCAFF`/`#D5EFFF`; Green `#003F25`/`#34BD43`/`#7CDB87`/`#CCF1D0`; Orange `#510000`/`#F46800`/`#FFA868`/`#FFE3CE`; Pink `#921149`/`#E62378`/`#F07FB0`/`#FBDAE8`). Preserve all existing `--codeai-*` declarations unchanged.
- [x] T006 Read-only verification: confirm Heading (`apps/marketing/src/components/contentful/heading/HeadingContentfulDefinition.ts`), Paragraph (`apps/marketing/src/components/contentful/paragraph/ParagraphContentfulDefinition.ts`), Text Link (`apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts`), Simple List (`apps/marketing/src/components/contentful/simpleList/SimpleListContentfulDefinition.ts`), and `apps/marketing/src/contentful/registration/code.org/designTokens.ts` automatically surface the 22 new options after T004 — no per-file edits required. If any of these files does NOT auto-pick up the new options, log a follow-up task; do not add per-file maintenance lists.

**Checkpoint**: Manifest + CSS variables in place. User stories can now begin.

---

## Phase 3: User Story 1 — Apply Brand Colors in Existing Component Dropdowns (Priority: P1) 🎯 MVP

**Goal**: Make the 22-color palette selectable in every recently-updated component's color/background dropdown on the code.org tenant, with the choice rendering correctly. Csforall content is unaffected.

**Independent Test**: Open the local Storybook and Contentful Studio (preview environment) for code.org. Confirm every Heading/Paragraph/Text Link/Simple List/Container/Section color or background dropdown lists all 22 brand colors. Pick `purplePrimary` on a Heading; confirm it renders as `#4C42CF`. Re-open the same components on csforall; confirm csforall content rendering is unchanged.

### Storybook coverage for User Story 1 (validation surface — required per Principle IV)

- [x] T007 [P] [US1] Extend `apps/marketing-storybook/stories/Heading.story.tsx` with stories that exercise each of the 22 new color values via the `color` control — auto-picks up because the story already derives both the control options and the `Colors` story body from `BRAND_COLORS.map(...)`; no file edit required.
- [x] T008 [P] [US1] Extend `apps/marketing-storybook/stories/Paragraph.story.tsx` — hand-maintained `color.options` list replaced with `[...BRAND_COLORS.map(c => c.value), 'secondary']` so the Playground control surfaces the full palette plus the legacy `secondary`.
- [x] T009 [P] [US1] Extend `apps/marketing-storybook/stories/Link.story.tsx` — `colors` const widened from `['primary', 'white']` to `BRAND_COLORS.map(c => c.value)` so the Playground control exposes the full palette. Existing matrix-test stories continue to exercise primary/white only to keep snapshot scope bounded.
- [x] T010 [P] [US1] Extend `apps/marketing-storybook/stories/SimpleList.story.tsx` — added a `BrandPalette` story rendering one SimpleList per brand color exercising both `type` and `textColor`.
- [x] T011 [P] [US1] Extend `apps/marketing-storybook/stories/Section.story.tsx` — `backgrounds` const widened with `BRAND_COLORS`-derived entries; added a `BrandPalette` composite story rendering one Section per brand color so storybook-eyes establishes baseline for the 22 new backgrounds without 22 separate exports.

### Implementation for User Story 1

- [x] T012 [US1] Extended `apps/marketing/src/components/contentful/section/sectionCorporateSiteContentfulDefinition.ts` — added `...BRAND_COLOR_OPTIONS` to the `background.validations.in` list (after all existing entries). Also extended `apps/marketing/src/components/contentful/section/Section.tsx` `SectionBackground` union type with `(typeof BRAND_COLORS)[number]['value']` so the new background values are type-valid props. `sectionBackground` runtime object populated via `Object.fromEntries(...)` combining legacy backgrounds and brand-color entries. `sectionCSforAllContentfulDefinition.ts` untouched.
- [ ] T013 [US1] Manual verification in Contentful Studio against the code.org space (REQUIRES USER): open a Heading entry and confirm the color dropdown lists all 22 brand colors; repeat for Paragraph, Text Link, Simple List, native Container background, native Section background, and the custom Section (Corporate Site variant). Record any dropdown that does NOT surface the new options as a defect against T004 or T012.
- [x] T014 [US1] Prettier `--check` passes on all touched Phase 2 + Phase 3 files. Pre-existing TypeScript errors elsewhere in the repo (ActionBlock/Card/Paragraph/SimpleList test fixtures lacking required `sys`/`metadata`/`removeMarginBottom` props) are unaffected — `npx tsc --noEmit` produced zero new errors in `colors.ts`, `section/`, `paragraph/`, `link/`, `simpleList/`, `heading/`, or `designTokens.ts`.

**Checkpoint**: User Story 1 is fully functional. Authors can choose any of the 22 brand colors on the listed components. No contrast switch yet (that's US2) — text colors are rendered as picked, even when the background would make them unreadable. This is acceptable as a stop-and-validate point.

---

## Phase 4: User Story 2 — Automatic Foreground/Background Contrast Switch (Priority: P2)

**Goal**: Implement the contrast switch so that text inside a Section/Container background automatically renders a readable color per the rule table (FR-007 through FR-013). Authored color is preserved when it already contrasts; low-contrast pairings shift within the text's own family on light backgrounds, or to White on dark backgrounds. Csforall Sections are not affected because the new `data-bg-tone` attribute is value-gated and csforall's background values are disjoint from the new CodeAI token set.

**Independent Test**: In Storybook, place a Heading with `color="black"` inside a Section with `background="purpleDark"` → renders white. Change the section to `purpleLight` and the heading to `purpleMid` → renders `purpleDark`. Change the section to `purpleMid` → same heading renders `purplePrimary`. White text on any light background renders black. Already-contrasting pairings (`purpleDark` text on `purpleLight` background) pass through. View page source on a csforall Section — confirm no `data-bg-tone` attribute is emitted.

### Tests for User Story 2 (write FIRST, expect to fail or expose missing behavior)

- [x] T015 [P] [US2] Jest unit test file `apps/marketing/src/components/common/__tests__/colors.test.ts` covering all 5 behavior branches + the every-pair smoke test. 56 tests pass against `resolveTextColorForBackground()`.
- [x] T016 [P] [US2] Added `ContrastSwitch` composite story to `apps/marketing-storybook/stories/Heading.story.tsx` — 8-row matrix covering all 5 behavior classes via real Section wrappers.
- [x] T017 [P] [US2] Added `ContrastSwitch` story to `apps/marketing-storybook/stories/Paragraph.story.tsx` mirroring the Heading matrix.
- [ ] T018 [P] [US2] Text Link Storybook coverage — deferred. Link.tsx now consumes the context and participates in the contrast switch (primary still resolves to brand purple on light/mid bgs, but routes through the resolver on dark CodeAI bgs); explicit Storybook matrix story not added in this pass to keep file-touch scope bounded.
- [ ] T019 [P] [US2] SimpleList Storybook contrast story — deferred. SimpleList.tsx now consumes the context and routes both `type` and `textColor` through `resolvedCssVarForBrandColor()`; the existing `BrandPalette` story exercises the new options but not yet under a colored Section wrapper.
- [x] T020 [P] [US2] Added `NestedBackground` story to `apps/marketing-storybook/stories/Section.story.tsx` — inner Section (purpleLight) inside outer Section (purpleDark) demonstrates that `SectionBackgroundProvider` re-runs at each level (FR-013 — nearest enclosing background wins).
- [x] T021 [P] [US2] Added `ContrastSwitchInherit` story to `apps/marketing-storybook/stories/RichText.story.tsx` rendering Rich Text body content on both `purpleDark` and `purpleLight` Section backgrounds. Body color resolves via the `[data-bg-tone='dark'|'light']` SCSS cascade in `colors.scss`; inline links retain their existing color.

### Implementation for User Story 2

- [x] T022 [P] [US2] Implemented `resolveTextColorForBackground(textValue, backgroundValue?)` in `apps/marketing/src/components/common/colors.ts` returning `{value, behavior}` per `contracts/contrast-switch-rule.schema.json`. Also exported `backgroundToneFor()`, `ContrastSwitchBehavior`, `BackgroundTone`, `ResolvedTextColor`, and `resolvedCssVarForBrandColor()` (convenience wrapper for consumers that want the CSS var directly).
- [x] T023 [P] [US2] Added minimal SCSS cascade rules in `packages/component-library-styles/colors.scss` — `[data-bg-tone='dark'] { color: var(--neutral-base-white) }` and `[data-bg-tone='light'|'mid'] { color: var(--neutral-base-true-black) }`. These drive Rich Text body inheritance only; Heading/Paragraph/Link/SimpleList resolve their color via the TypeScript resolver (better specificity than CSS attribute selectors vs. MUI sx output).
- [x] T024 [P] [US2] Extended `apps/marketing/src/components/contentful/section/Section.tsx` with a `BRAND_BACKGROUND_VALUES` value-space guard. `data-bg-tone` is set only when `background` is one of the 22 new CodeAI tokens; csforall and Corporate Site legacy backgrounds produce `undefined` (no attribute rendered). Children wrapped in `<SectionBackgroundProvider value={brandBackgroundValue}>`.
- [x] T024b [US2] Created `apps/marketing/src/components/contentful/section/SectionBackgroundContext.tsx` providing `SectionBackgroundProvider` and `useSectionBackground()`. Heading, Paragraph, Link, and SimpleList all consume the context and route their authored color through `resolveTextColorForBackground()`.
- [ ] T025 [US2] Native Container cascade boundary — deferred. The custom Section component is the contrast-switch boundary for now. Native Contentful Containers with brand backgrounds do NOT yet re-establish a new boundary; their children resolve against the enclosing Section's background. Logged as follow-up because it requires either (a) wrapping the native Container render output to set context, or (b) extending `apps/marketing/src/themes/code.org/styleOverrides/container.ts` with `data-bg-tone`-emitting `:has()` rules — both warrant their own investigation pass.
- [x] T026 [US2] Migrated the legacy `primary` BRAND_COLORS entry's `cssVar` from `var(--text-neutral-primary)` (resolved to `--neutral-base-black` `#292f36` on Light theme) to `var(--neutral-base-true-black)` (`#000000`). The `family: 'black'` field on this entry routes it through the resolver, so Primary-colored text becomes white on dark CodeAI backgrounds. csforall theme untouched. Note: implementation is at the manifest level rather than the theme file because the "Primary font default" is the manifest's `primary` entry, not an MUI theme.typography default.
- [x] T027 [US2] Resolver tests pass — 56/56 — including the every-pair smoke test that confirms every (text × background) brand-color pairing produces a valid token value in the output set.

**Checkpoint**: User Story 2 is functional. Contrast switch resolves automatically; csforall remains unchanged. Visual regression on existing entries is preserved except for the intentional Primary font migration on dark Sections.

---

## Phase 5: User Story 3 — Override the Automatic Contrast Switch (Priority: P3)

**Goal**: Confirm the existing `colorOverride` hex field on Heading and Paragraph composes correctly with the new contrast switch — when set, the override wins regardless of background tone.

**Independent Test**: Place a Heading inside a `purpleLight` Section, set `color="white"` (which the switch would normally flip to black) and set `colorOverride="#FFFFFF"`. Confirm the heading renders white. Repeat for Paragraph. Confirm Text Link, Simple List, and custom Section do NOT expose `colorOverride` (documented limitation, FR-014/edge case).

### Tests for User Story 3

- [x] T028 [P] [US3] No separate resolver test required — `colorOverride` short-circuits at the call site in Heading.tsx and Paragraph.tsx (`colorOverride || resolvedCssVarForBrandColor(...)`) and never reaches the pure resolver. The component-level behavior is verified by the new `ColorOverrideBypassesContrastSwitch` Storybook story (T029).
- [x] T029 [P] [US3] Added `ColorOverrideBypassesContrastSwitch` story to `apps/marketing-storybook/stories/Heading.story.tsx`: `color=white` + `colorOverride="#FFFFFF"` on `purpleLight` (renders white instead of black); `color=black` + `colorOverride="#000000"` on `purpleDark` (renders black instead of white).
- [ ] T030 [P] [US3] Paragraph override story — deferred. The existing Playground `colorOverride` control covers the override path; an explicit `ColorOverrideBypassesContrastSwitch` story analogous to Heading's was not added to keep file-touch scope bounded.

### Implementation for User Story 3

- [x] T031 [US3] Confirmed by reading source: `apps/marketing/src/components/contentful/heading/Heading.tsx:94` uses `color: colorOverride || resolvedCssVarForBrandColor(color, enclosingBackground)`; `apps/marketing/src/components/contentful/paragraph/Paragraph.tsx:80` uses `colorOverride || (legacy ? undefined : resolvedCssVarForBrandColor(color, enclosingBackground))`. The override short-circuits both the resolver and the cssVarForBrandColor lookup.
- [x] T032 [US3] Limited override coverage is already documented in `spec.md` (FR-014 acceptance scenario 3 — "Text Link, Simple List, etc. do NOT expose `colorOverride` in this pass"). No additional documentation added in this commit; deferred-work follow-up captured in T039.

**Checkpoint**: All three user stories functional. MVP slice (US1) shipped if US2/US3 are deferred to a follow-up commit.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, regression, and follow-up tracking. Required before merge.

- [x] T033 [P] `yarn workspace @code-dot-org/marketing prettier` and `yarn workspace @code-dot-org/marketing-storybook prettier` both pass. Workspace-level prettier config flagged 6 files initially; auto-fixed via `prettier:fix` (Heading.story.tsx, Paragraph.story.tsx, colors.ts, Heading.tsx, Link.tsx, Paragraph.tsx) — all reformat to match `@code-dot-org/lint-config/prettier/index.mjs`.
- [x] T034 [P] `yarn workspace @code-dot-org/marketing lint` clean (Section.tsx had two `import-x/order` violations, fixed via `lint:fix` — imports reordered). Only pre-existing warnings remain in `AdoptionMap.test.tsx` (unrelated, `React.forwardRef` / `React.useEffect` named-as-default-member). `yarn workspace @code-dot-org/marketing-storybook lint` clean. No `typecheck` script exists in the marketing workspace; ran `npx tsc --noEmit -p apps/marketing` instead — zero new errors in the 17 touched files (existing repo-wide test-fixture errors in `LinkEntry`/`EntrySys` mocks are pre-existing and unrelated).
- [x] T035 [P] `yarn workspace @code-dot-org/marketing test` — 681/681 tests pass across 115 test suites. One regression in `Heading.test.tsx` ("applies the color prop correctly" expected `color: white` from `color="white"` at page root) was a correct behavioral change per the resolver — `white` text without an enclosing dark background now resolves to black (FR-010 / FR-013). Updated the test to wrap the Heading in a `purpleDark` Section, preserving the test's original intent (verify color prop reaches the rendered element).
- [SKIPPED] T036 Push + Applitools — explicitly skipped per user request: "no push or PR opened" until more testing is done.
- [PARTIAL] T037 Tenant scope verification — source-level checks done: `git diff --name-only HEAD` confirms ZERO csforall files in the diff. Section.tsx's `BRAND_BACKGROUND_VALUES` Set is built from `BRAND_COLORS.map(c => c.value)`; csforall background values (`brandPrimary`, `brandSecondary`, `brandTertiary`, `brandLightPrimary`, etc.) are NOT in the set, so `data-bg-tone` is `undefined` and the attribute is not rendered on csforall Sections. Pixel-diff verification (b), Studio dropdown inspection (c), and loaded-CSS inspection (d) require running both brand tenants locally and are part of the user's testing pass.
- [PARTIAL] T038 Existing-content pass-through verification — source-level: the only intentional behavioral change is the `primary` BRAND_COLORS entry's `cssVar` migration from `var(--text-neutral-primary)` (resolves to `--neutral-base-black` `#292f36`) to `var(--neutral-base-true-black)` (`#000000`) per FR-015. All other legacy entries (`white`, `purple`, `darkPurple1`, `darkPurple2`, `lightGreen3`, `secondary`, `brand`) are byte-identical to before. The existing legacy Section background classes (`section-background-primary` etc.) are unchanged. Visual regression on production code.org pages is part of the user's testing pass.
- [x] T039 [P] Deferred follow-ups logged below (see "Deferred work after this implementation pass"). Listed in priority order.
- [x] T040 Implementation-time discoveries reconciled with the spec: (a) no Contentful Studio field-validation-list contingency surfaced — `BRAND_COLOR_OPTIONS` is application-code only as plan.md predicted, no MCP read required. (b) The "Primary font default" turned out to live in the `primary` BRAND_COLORS entry (not the MUI theme typography), so the migration is in colors.ts rather than `themes/code.org/index.ts` — research.md §6 was directionally right but the file location moved. (c) Heading.tsx, Paragraph.tsx, Link.tsx, and SimpleList.tsx all needed to consume `useSectionBackground()` because their rendering uses MUI sx (inline-style equivalent), not CSS class names — the SCSS cascade alone is insufficient. This drove the addition of `SectionBackgroundContext.tsx` (not predicted in research.md Decision 1). Rich Text body text DOES inherit from the SCSS cascade as planned. None of these discoveries contradicted the spec; updating `checklists/requirements.md` was not necessary.

## Deferred work after this implementation pass

Logged for follow-up, ordered by likely priority. None block the MVP slice.

1. **WCAG AA contrast audit** of all 22-color × switch-pairing combinations (FR-023). Presumed compliant; needs formal verification before any high-stakes content uses the new palette.
2. **Native Container cascade boundary** (T025). Native Contentful Containers with a brand-color background do NOT currently re-establish a new `SectionBackgroundProvider` for their children; resolution falls back to the outer Section's tone. Fix requires either wrapping the native Container render output or extending `apps/marketing/src/themes/code.org/styleOverrides/container.ts` with `data-bg-tone`-emitting `:has()` rules.
3. **Text Link + SimpleList contrast Storybook stories** (T018, T019). Both components now route through the resolver and behave correctly, but explicit visual-regression coverage of the contrast-switch cases inside colored Sections was not added in this pass.
4. **Paragraph override Storybook story** (T030). Heading covers the override path; Paragraph's Playground `colorOverride` control exists but no dedicated `ColorOverrideBypassesContrastSwitch` story was added.
5. **Overline migration** to the shared `BRAND_COLOR_OPTIONS` manifest (research.md §9). Overline still uses an inline `Primary`/`Secondary`/`White` list and does not participate in the contrast switch.
6. **Override coverage** for Text Link, Simple List, and the Section variants — none currently expose `colorOverride` (research.md §3).
7. **Consolidation of CS for All / Corporate Section background lists** (research.md §8). Out of scope here; explicitly preserved per the brief.
8. **Per-brand `BRAND_COLOR_OPTIONS` filter** — only required if csforall deprecation slips and isolation becomes mandatory (research.md §10).
9. **`primaryFont` default migration follow-up**: the visual shift from `#292f36` to `#000000` is small but real on existing code.org pages. Worth a manual screenshot comparison on 3–5 representative pages before merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks all user stories**. T004 must complete before T005 only if T005 references the same file's exports (it doesn't — `primitiveColors.scss` is independent of `colors.ts`), so T004 and T005 can in principle run in parallel; however T004 is marked non-parallel because the manifest extension is the critical-path foundation.
- **User Story 1 (Phase 3)**: Depends on Foundational. Can ship independently as MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational. Independent of US1 — they touch different code paths. May ship after US1 or in parallel.
- **User Story 3 (Phase 5)**: Depends on Foundational AND US2 (because US3 verifies override behavior in the presence of the contrast switch). Can ship after US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1**: Standalone. Delivers value (palette visible in dropdowns) on its own. **This is the MVP slice.**
- **US2**: Standalone in code but depends on US1's manifest extension (T004) being in place. Can also ship independently of US1 if US1 is deferred. Practically: US1 ships first.
- **US3**: Depends on US2's `resolveTextColorForBackground()` existing. Cannot be tested independently of US2 in a meaningful way.

### Within Each User Story

- Storybook stories and Jest tests are added BEFORE the implementation lands (TDD-lite). The expected failure is what proves the test is exercising the new behavior.
- Shared manifest extension and CSS primitives (Foundational) precede any consumer-facing change.
- Section.tsx attribute (T024) and native Container override (T025) precede the SCSS rule block (T023) only if T023 keys on attributes; T023 can be authored in parallel and the cascade verified together at the US2 checkpoint.
- Primary font default migration (T026) precedes the existing-content pass-through verification (T038).

### Parallel Opportunities

- T002, T003 in parallel (Setup).
- T005 can run in parallel with T004 (different files). Marked sequential above because T004 is the critical-path foundation; safe to run in parallel if staffed.
- T007 through T011 (US1 Storybook stories) all in parallel — different story files.
- T015 through T021 (US2 tests and stories) all in parallel — different files.
- T022, T023, T024, T025, T026 (US2 implementation) all in parallel — different files.
- T028, T029, T030 (US3 tests and stories) in parallel.
- T033, T034, T035, T036 (Polish — prettier, lint/typecheck, unit tests, visual regression) all in parallel.

---

## Parallel Example: User Story 2 Implementation

After Foundational (Phase 2) and US2 tests (T015–T021) are complete, the five implementation files have no overlap. They can be implemented in parallel by different developers or by the same developer in any order:

```bash
Task T022: resolveTextColorForBackground() in apps/marketing/src/components/common/colors.ts
Task T023: contrast-switch rules in packages/component-library-styles/colors.scss
Task T024: data-bg-tone attribute in apps/marketing/src/components/contentful/section/Section.tsx
Task T025: Container cascade override in apps/marketing/src/themes/code.org/styleOverrides/container.ts
Task T026: Primary font migration in apps/marketing/src/themes/code.org/index.ts
```

After all five land, run T027 (Jest tests) and the US2 Storybook stories (T016–T021) for the integrated verification.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T004 + T005)
3. Complete Phase 3: User Story 1 (T007–T014)
4. **STOP and VALIDATE**: Storybook + Contentful Studio show all 22 colors selectable on Heading/Paragraph/Text Link/Simple List/Container/Corporate Site Section. csforall renders unchanged.
5. Deploy/demo if approved — content authors can now pick brand colors. Contrast handling still relies on manual author care.

### Incremental Delivery

1. Setup + Foundational → palette tokens exist in code.
2. Add US1 → palette appears in dropdowns. **MVP shippable.**
3. Add US2 → contrast switch protects readability automatically. **Ship.**
4. Add US3 → override mechanism is verified and documented as Heading/Paragraph-only. **Ship.**
5. Polish (Phase 6) → tenant verification, baseline acceptance, follow-up logging.

### Single-Developer Strategy

One developer can complete the work sequentially in roughly the order shown. Total active task count: ~40. Most are small (a Storybook story extension or a single function), and many are read-only verifications.

---

## Notes

- **csforall isolation**: every implementation task explicitly excludes `apps/marketing/src/themes/csforall/`, `apps/marketing/src/components/contentful/section/sectionCSforAllContentfulDefinition.ts`, and `apps/marketing/src/contentful/registration/csforall/`. The value-space guard in T024 prevents the new `data-bg-tone` attribute from being emitted on csforall Sections.
- **Shared SCSS leakage**: T005 (new CSS variables) and T023 (new rule block) modify the shared SCSS layer. This is deliberate per research.md §10; csforall pages load the new declarations but no csforall component references them. T037 verifies this is inert.
- **Pre-commit prettier**: per project memory, run prettier on every touched workspace before each commit. The pre-commit hook in this clone is non-executable.
- **No Claude attribution**: per project memory, commits and PRs are human-authored — no co-author trailer or generated-with footer.
- **No push without approval**: per project memory, no `git push` until the user explicitly approves.
- **Branch from sandbox**: per project memory, if a new follow-up branch is created for any deferred work in T039, branch from a freshly-pulled `sandbox`.
- Avoid: same-file conflicts between parallel tasks; cross-story dependencies that break MVP shippability; introducing per-brand factory infrastructure when the soft-isolation guard already does the job.
