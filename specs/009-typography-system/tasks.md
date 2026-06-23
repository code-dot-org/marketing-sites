# Tasks: Sitewide Typography System

**Feature directory**: `/home/kal/projects/code-dot-org/marketing-sites/specs/009-typography-system/`
**Inputs**: [spec.md](./spec.md) (6 user stories), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), `contracts/`
**Branch**: `009-typography-system`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2…US6). Setup / Foundational / Polish tasks omit the story label.
- Every task description includes the exact file path it touches.

## User Story map

| Story | Priority | One-line goal                                                                                                              |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| US1   | P1       | Heading + Paragraph default render path resolves from canonical role tokens; editing a token changes the rendered output sitewide. |
| US2   | P1       | Code.org-only deprecated components (Hero Banner, YourSchool, AdoptionMap, AfeEligibility, activityCatalog, etc.) consume role tokens — no hardcoded font sizes left. |
| US3   | P1       | Heading gains the orthogonal `appearance` field; Paragraph's `visualAppearance` enum widens to 12 cells; precedence Heading-Level → Visual-Appearance → individual override. |
| US4   | P2       | Individual override fields (`fontSize`, `fontWeight`, `lineHeight`, `colorOverride`, `isStrong`, etc.) take top precedence and only override their dimension. |
| US5   | P2       | Restored 21-variant Noto Sans i18n fallback chain renders mixed-script content correctly on code.org; CSforAll byte-identical. |
| US6   | P3       | Responsive sizing steps through the 8-token scale at MUI breakpoints with a 1rem floor; hierarchy non-increasing at every viewport. |

---

## Phase 1: Setup

**Goal**: Confirm the implementation scope. **No Contentful content-type schema actions** — both Heading and Paragraph changes are code-side `ComponentDefinition.variables` updates per the spec-008 precedent and FR-024 / FR-011a / FR-011b. No `ctf_get_content_type` MCP read or write.

- [X] T001 Confirm branch `009-typography-system` is checked out and based on the latest `008-brand-buttons` (or rebase onto `sandbox` if user prefers per `[[feedback_branch_workflow_sandbox_base]]`); document the rebase decision in the PR description. **Done**: branch is `009-typography-system` (off `008-brand-buttons`). Rebase onto `sandbox` deferred — pending user confirmation; default is to leave branch base as `008-brand-buttons` per the auto-create flow.
- [X] T002 [P] Verify `apps/marketing/src/themes/csforall/` is fully untouched in `git status` after every subsequent task; treat any csforall diff as a regression to investigate before committing. **Standing contract** — re-checked at each commit boundary.
- [X] T003 [P] Run `find apps/marketing/src/components -iname '*hero*'` to confirm whether a Hero Banner component exists today on the code.org code path; record the path (if any) in this file's US2 section, or remove Hero Banner from US2 scope if no current file matches. **Found**: `apps/marketing/src/components/contentful/heroBanner/HeroBanner.tsx` is a thin Contentful wrapper that delegates to `DSCOHeroBanner` from `@code-dot-org/component-library/cms/heroBanner` — the typography lives in the **shared** design-system component, NOT in the marketing-layer wrapper. Per the spec's "opt-in shared-component migration" rule (research §R8 / contracts §deprecated-component-migration §"Scope rule"), Hero Banner migration is **out of scope** for this spec and deferred to a follow-up that touches `packages/component-library/`. T042 below is updated accordingly.

**Checkpoint**: Scope confirmed. No Contentful Studio operations performed.

---

## Phase 2: Foundational (blocks every user story)

**Goal**: Land the token module, font-stack helper, theme rewrite, and shared SCSS primitives extension. After this phase, the code.org typography theme exposes canonical role tokens via MUI variants + CSS custom properties; the Noto Sans chain flows in the computed font-family; CSforAll remains byte-identical.

- [X] T004 Create `apps/marketing/src/themes/code.org/typography/tokens.ts`. **Done**: 195 lines, exports all required types + constants. Cell values copied from `contracts/scale-tokens.md`; role tokens from `contracts/role-tokens.md`; `DISPLAY_APPEARANCE_ROLES` reuses H1–H6 references where the cells coincide.
- [X] T005 [P] Create `apps/marketing/src/themes/code.org/typography/fontStack.ts`. **Done**: `NOTO_SANS_CHAIN` (20 entries) + `createCodeOrgFontStack(primary)` + pre-built `CODE_ORG_TEXT_FONT_STACK` / `CODE_ORG_DISPLAY_FONT_STACK`.
- [X] T006 [P] Create `apps/marketing/src/themes/code.org/typography/buildTypography.ts`. **Done**: pure builder. Three invariants enforced (`assertScaleCompleteness`, `assertFloor`, `assertHierarchy`); throw at construction time. Per-viewport step queries map `steps.sm → breakpoints.down('md')`, `steps.xs → breakpoints.down('sm')` (so the viewport-name keys produce correct cascading media queries).
- [X] T007 Create `apps/marketing/src/themes/code.org/typography/__tests__/buildTypography.test.ts`. **Done**: 19 test cases covering H1 locked cell, body2 locked cell, hierarchy, floor, top-level fontFamily, overline+caption mapping, ROLE_TOKENS sanity. All pass.
- [X] T008 Rewrite `apps/marketing/src/themes/code.org/index.ts`. **Done**: typography section now `typography: buildTypography({defaultFontFamily: CODE_ORG_TEXT_FONT_STACK})`; preserved `cssVariables: true`, `STYLE_OVERRIDES`, `shape.borderRadius`; deleted the 60 lines of inline h1–h6 / body1–body4 / overline blocks.
- [X] T009 Update `apps/marketing/src/themes/code.org/styleOverrides/typography.ts`. **Done**: overline--size-s/m → `var(--font-size-text-xs)`; overline--size-l → `var(--font-size-text-sm)`; caption → `var(--font-size-text-sm)`. Documented the small intentional ~20% growth of `overline--size-s` (10px → 12px) in a code comment.
- [X] T010 Extend `packages/component-library-styles/typography.module.scss`. **Done**: legacy `--font-size-body-{xs,sm,md,lg}` preserved at existing values (0.813rem / 0.875rem / 1rem / 1.25rem); added 8 `--font-size-text-*` and 8 `--font-size-display-*` variables.
- [~] T011 [P] **Skipped**: `packages/component-library-styles` has no Jest test infrastructure (only release / lint scripts). The back-compat values for `--font-size-body-{xs,sm,md,lg}` are verified by inspection of `typography.module.scss` and will be caught by Applitools visual regression if they drift on csforall.
- [X] T012 [P] Add `apps/marketing/src/themes/code.org/typography/__tests__/fontStack.test.ts`. **Done**: 4 test groups (chain length / first / last / SCSS line-by-line match; createCodeOrgFontStack shape; pre-built stacks). All pass; the SCSS line-by-line match catches any drift between TS chain and `font.scss`.

**Checkpoint**: After Phase 2, `yarn typecheck` and `yarn jest apps/marketing/src/themes/code.org/typography` pass. The code.org theme's typography output is fully driven by `tokens.ts`. CSforAll continues to use the bare `createFontStack` from `themes/common/constants.tsx` (untouched).

---

## Phase 3: User Story 1 — Heading and Paragraph Defaults Resolve From a Single Source (Priority: P1) 🎯 MVP

**Goal**: After this phase, every default Heading and Paragraph entry renders the canonical role token for its level / variant. Editing `ROLE_TOKENS.h1` in `tokens.ts` updates every default H1 across the site, every deprecated component once US2 lands, and Storybook — all from a single edit.

**Independent test**: In Storybook, the Heading "Default per level" matrix renders H1–H6 at the locked canonical role tokens (H1 = Display 2xl Semibold @ desktop). The Paragraph "Default" story renders body2 at Text md Medium / line-height 1.5rem. Editing `ROLE_TOKENS.h1` to `{track: 'display', size: '3xl', weight: 'semibold', steps: ...}` and re-running the Storybook causes the default H1 story to render at Display 3xl Semibold without any per-story edit.

### Implementation

- [X] T013 [US1] Refactor `Heading.tsx`. **Done**: deleted `HEADING_RESPONSIVE_SIZE`; dropped hardcoded `font-family: 'Space Grotesk'`; dropped `lineHeight: 1` / `fontWeight: 500` / `fontKerning: 'normal'` defaults. The variant's styles now flow through; only explicit overrides are emitted in `sx`. Removed unused `SPACE_GROTESK_FONT` import.
- [X] T014 [US1] Update `Paragraph.tsx`. **Done**: dropped the `fontWeight: 400` shadow when `!isStrong`; dropped the `fontStyle: 'normal'` shadow when `!isItalic`; replaced literal `600` for `isStrong` with `WEIGHTS.semibold` import.
- [X] T015 [P] [US1] Extend `Heading.test.tsx`. **Done**: added "spec 009 refactor" describe block with 5 tests (no clamp() emitted, fontSize/fontWeight/lineHeight overrides apply via `toHaveStyle`, textTransform applies). All 8 Heading tests pass.
- [X] T016 [P] [US1] Update `Paragraph.test.tsx`. **Done**: fixed the existing "does not apply italic style by default" test (now asserts `.not.toHaveStyle({fontStyle: 'italic'})` since we no longer emit the redundant `normal` shadow). All 9 Paragraph tests pass.
- [X] T017 [P] [US1] Add `DefaultsPerLevel` story to `Heading.story.tsx`. **Done**: a side-by-side matrix story for storybook-eyes diff. Preserved all existing stories.
- [X] T018 [P] [US1] Add `DefaultsByVariant` story to `Paragraph.story.tsx`. **Done**: a side-by-side matrix of the 4 legacy `body-*` variants with their canonical role tokens labeled.
- [ ] T019 [US1] **MANUAL VERIFICATION** — **awaiting user**. Boot `yarn workspace @code-dot-org/marketing dev`, open `http://code.org.marketing-sites.localhost:3001`, inspect a rendered Heading + Paragraph in DevTools. Confirm computed `font-family` starts with `Space Grotesk` (Heading) or `Geist` (Paragraph), contains every entry from `NOTO_SANS_CHAIN`, and ends with `sans-serif`. Confirm H1 = 72px / Body = 16px / 24px line-height / weight 500.

**Checkpoint**: After Phase 3, default rendering across the site is driven by the new role tokens. US5 (Noto Sans chain) and US6 (responsive ladder) are visually verifiable from this phase's Storybook + manual checks.

---

## Phase 4: User Story 3 — Authors Decouple Heading Level From Visual Appearance (Priority: P1)

**Goal**: After this phase, Heading has a new "Visual Appearance" dropdown (9 enum values: `default` + 8 Display cells); the existing "Heading Level" field continues to set the `<h*>` semantic tag; Paragraph's "Visual Appearance" dropdown is widened to 12 values (4 legacy + 8 new Text cells). The three-step (Heading) / two-step (Paragraph) precedence chain works as documented in `contracts/heading-component-props.md` and `contracts/paragraph-component-props.md`.

**Independent test**: In Storybook, render a Heading with Heading Level = "Heading 2" and Visual Appearance = "Display 2xl" — confirm rendered tag is `<h2>` (per `outerHTML` inspection) and computed `font-size: 72px` (Display 2xl). Render a Paragraph with `visualAppearance = "text-2xl"` — confirm `font-size: 24px` / `line-height: 32px`. Open Contentful Studio against a local code.org dev server, place a Heading: the "Heading Level" dropdown shows 6 options unchanged; the "Visual Appearance" dropdown shows 9 new options (default + 8 Display cells).

### Implementation

- [X] T020 [US3] Add `appearance` variable to `HeadingContentfulDefinition.ts`. **Done**: 9-option enum (`default` + 8 Display cells largest-first); defaultValue `default`; description explains the orthogonal-to-tag role.
- [X] T021 [US3] Widen `ParagraphContentfulDefinition.ts` `visualAppearance.validations.in`. **Done**: 12 entries (4 legacy `body-*` + 8 new `text-*` largest-first). Default stays `body-two`.
- [X] T022 [US3] Create `resolveHeadingStyles.ts`. **Done**: 3-step chain (Heading Level → seed; Visual Appearance → cell override with variant-binding rule; individual overrides). 6 Display cells map 1:1 to canonical H1–H6 variants; 2 extra (4xl/3xl) fall back to h1 variant + inline sx.
- [X] T023 [US3] Create `resolveParagraphStyles.ts`. **Done**: 2-step chain. Legacy `body-*` + matching `text-*` (md/lg/sm/xs) use canonical body variants; larger cells use body1 + inline sx.
- [X] T024 [US3] Rewire `Heading.tsx` to consume `resolveHeadingStyles`. **Done**: accepts `appearance` prop (default `'default'`); spreads `resolvedSx` then layers `colorOverride`/contrast/zIndex; passes `component={semanticTag}` `variant={variantTag}`.
- [X] T025 [US3] Rewire `Paragraph.tsx` to consume `resolveParagraphStyles`. **Done**: dropped the `visualAppearanceToMuiTagMap` const; spreads `resolvedSx` then layers `inlineColor`/`textTransform`/user `sx`.
- [X] T026 [P] [US3] Tests for `resolveHeadingStyles`. **Done**: 22 cases — step 1 (6 levels + appearance=default no-op), step 2 (orthogonality, variant binding, 4xl/3xl extra cells), step 3 (overrides + composition).
- [X] T027 [P] [US3] Tests for `resolveParagraphStyles`. **Done**: 21 cases — legacy `body-*`, canonical `text-*`, larger `text-*` (size+lh+ls), individual overrides, composition. Naming-equivalent pairs (text-md ↔ body-two, text-lg ↔ body-one) confirmed identical.
- [X] T028 [P] [US3] Extend `Heading.test.tsx` with orthogonality tests. **Done**: tag orthogonality across (level, appearance) pairs; display-4xl inline 7.5rem; appearance=default no-op vs unset.
- [X] T029 [P] [US3] Extend `Paragraph.test.tsx` with widened-enum tests. **Done**: text-md ↔ body-two same variant; text-2xl inline 1.5rem; text-4xl inline size+lh+ls; text-xs uses body4 variant.
- [X] T030 [P] [US3] Update `Heading.story.tsx`. **Done**: added `OrthogonalHeadingLevelVsAppearance`, `VisualAppearanceBeyondCanonical`, `ResolutionChain` stories + `appearance` argType to Playground.
- [X] T031 [P] [US3] Update `Paragraph.story.tsx`. **Done**: widened argType to 12 options; added `FullTextScale` and `LegacyVsNewNaming` stories.
- [ ] T032 [US3] **MANUAL VERIFICATION** — **awaiting user**. Boot `yarn workspace @code-dot-org/marketing dev`, open Contentful Studio in editor mode, drag a Heading: confirm "Heading Level" + new "Visual Appearance" dropdowns (9 options). Drag a Paragraph: confirm "Visual Appearance" shows 12 options. Save an H2 entry with Visual Appearance = "Display 2xl"; reload the rendered page; confirm `<h2>` tag in DevTools at `font-size: 72px`.

**Checkpoint**: After Phase 4, authors have the orthogonal field model in Studio and the resolution chain works for every (Heading Level, Visual Appearance, individual override) combination.

---

## Phase 5: User Story 2 — Deprecated Components Reflect Canonical Defaults (Priority: P1)

**Goal**: After this phase, every code.org-only deprecated component currently bypassing Heading/Paragraph routes its typography through canonical role tokens via MUI variants or the shared `--font-size-text-*` / `--font-size-display-*` CSS variables. Editing a role token updates the rendered Hero Banner title and other deprecated-component headings without per-file edits.

**Independent test**: In Storybook (or local preview for components without stories), confirm each migrated component renders typography that visually matches the canonical role token for its semantic role. Edit `ROLE_TOKENS.h1` in `tokens.ts`, rebuild, and confirm any migrated H1-equivalent surface in those components (e.g. Hero Banner title) picks up the change.

Per `contracts/deprecated-component-migration.md`, each migration uses Pattern A (replace markup with `<Heading>`/`<Paragraph>`) or Pattern B (replace literal with `var(--font-size-...)`). Per-call-site choice documented in the contract.

- [X] T033 [P] [US2] Migrate `yourSchool.module.scss`. **Done**: L143 `2rem` left as a literal with comment (FontAwesome icon glyph — out of typography scope; 2rem has no exact cell); L173 `1.25rem` → `var(--font-size-text-xl)`; L232 `0.875rem` → `var(--font-size-text-sm)`. Line-heights preserved.
- [X] T034 [P] [US2] Migrate `adoptionMap.module.scss`. **Done**: both `0.75rem` (L31, L96) → `var(--font-size-text-xs)` via `replace_all`. `font-weight` mixin reference and 1.64 line-heights preserved.
- [X] T035 [P] [US2] Migrate `adoptionMap.scss`. **Done**: L18 `1.5rem` → `var(--font-size-text-2xl)`. L19 `line-height: 0.55` documented as intentional (vertical-centering of × glyph in the mapbox popup close button), not a typo.
- [X] T036 [P] [US2] Migrate `afeEligibility.module.scss`. **Done**: L26 `1rem` → `var(--font-size-text-md)`; L148 `0.625rem` → `var(--font-size-text-xs)` with documented sub-floor clamp comment; L147 `font-weight: 500` preserved.
- [~] T037 [P] [US2] `stateGapMap/StateGapMapPanel.tsx` L41 — **no migration needed**. `fontWeight={700}` is the canonical Bold weight; matches the 4-weight ladder; not a conflict per SC-006. Leave as-is.
- [X] T038 [P] [US2] Migrate `activitiesHero.tsx`. **Done**: px literals `{xs: 36, md: 50}` → rem `{xs: '2.25rem', md: '3.125rem'}`; weight 800 (Extra Bold, not in the 4-weight ladder) dropped to 700 (Bold) per spec.
- [~] T039 [P] [US2] `facetBar.tsx` + `facetDrawer.tsx` — **no migration needed**. Each `fontWeight: 600/700` literal is already on the canonical Semibold/Bold ladder; matches the spec. Leave as-is.
- [X] T040 [P] [US2] Migrate `video/styledMuiComponents/index.ts`. **Done**: SVG icon glyph `fontSize: '3rem'` → `fontSize: 'var(--font-size-display-lg)'`. Rejected the contract's suggestion to route through `theme.typography.h3.fontSize` (coincidentally the same value, but ties an SVG icon size to an unrelated H3 role-token shape — surprising coupling).
- [X] T041 [P] [US2] Migrate `Card.tsx` L155. **Done**: `fontWeight="bolder"` → `fontWeight={600}` (canonical Semibold). Browser-relative `"bolder"` is now consistent across contexts.
- [X] T042 [US2] Hero Banner — **out of scope** per T003 finding. The marketing-layer wrapper `apps/marketing/src/components/contentful/heroBanner/HeroBanner.tsx` does NOT hardcode type; it delegates to the shared `DSCOHeroBanner` from `@code-dot-org/component-library/cms/heroBanner` whose typography is set inside `packages/component-library/`. That shared component ships to BOTH tenants — migrating it is opt-in follow-up scope per research §R8. No code change in this spec; documented in the PR.
- [ ] T043 [P] [US2] **awaiting user** — visual coverage: storybook-eyes baselines for each migrated component need acceptance on the Applitools dashboard. Verified locally that all 786 marketing tests pass and CSforAll diff is zero in `git status apps/marketing/src/themes/csforall/`.
- [ ] T044 [US2] **MANUAL VERIFICATION (awaiting user)** — boot dev server, edit `ROLE_TOKENS.h1` in `tokens.ts`, rebuild, confirm any migrated component using H1-equivalent surface updates. SC-006 (no remaining `font-size: <literal>` that conflicts) verified by inspection of the migrated files' diffs — all literal sizes either route through `var(--font-size-*)` tokens or are intentional non-typography uses (icon glyphs documented with comments).

**Checkpoint**: After Phase 5, the deprecated-component surface area is fully on canonical role tokens. SC-006 passes.

---

## Phase 6: User Story 4 — Per-Instance Overrides Without Breaking Defaults (Priority: P2)

**Goal**: Verify that the individual override fields (`fontSize`, `fontWeight`, `lineHeight`, `colorOverride`, `fontKerning`, `textTransform`, `isStrong`, `isItalic`) take top precedence and override ONLY their corresponding dimension while everything else flows through the role-token chain. Most of the implementation already landed in US1 + US3; this phase is verification and Storybook coverage.

**Independent test**: In Storybook, render Heading and Paragraph entries with each override field set in isolation and in combination; confirm only the overridden dimension changes while non-overridden dimensions retain their role-token defaults.

- [X] T045 [P] [US4] Heading overrides story. **Already covered by existing stories** added in earlier phases: `Overrides`, `ColorOverrideBypassesContrastSwitch`, `ResolutionChain`. Each exercises a different override dimension. No new story added.
- [X] T046 [P] [US4] Paragraph overrides story. **Done**: added an `Overrides` story (body-two+isStrong, text-lg+isItalic, text-2xl+isStrong+isItalic, body-two+colorOverride).
- [X] T047 [P] [US4] Heading override tests. **Already covered** by the "spec 009 refactor" + "orthogonal Heading Level / Visual Appearance" describe blocks in `Heading.test.tsx`. Override dimension scoping is verified.
- [X] T048 [P] [US4] Paragraph override tests. **Already covered** by `resolveParagraphStyles.test.ts` (isStrong→Semibold, isStrong:false→no fontWeight emitted, isItalic→italic, composition on text-2xl).

**Checkpoint**: After Phase 6, the override path has Storybook + Jest coverage matching the spec's US4 acceptance scenarios.

---

## Phase 7: User Story 5 — Noto Sans Fallback Chain (Priority: P2)

**Goal**: Confirm the 20-variant Noto Sans chain flows in the MUI font-family cascade on code.org for every Heading and Paragraph (and any downstream consumer using MUI typography variants). Confirm CSforAll is byte-identical.

**Independent test**: With DevTools open on a code.org page, every rendered Heading shows `font-family: Space Grotesk, Noto Sans, Noto Sans Math, …, Noto Sans Thaana, sans-serif`; every rendered Paragraph shows `Geist, Noto Sans, …, sans-serif`. On a csforall page, every rendered Heading shows `Geist, sans-serif` (or whatever the csforall theme produces — UNCHANGED from pre-feature). Render a fixture page with Arabic + CJK + Devanagari content using Heading/Paragraph; confirm non-Latin glyphs render in the appropriate Noto Sans family.

- [X] T049 [P] [US5] Add Noto Sans i18n smoke story. **Done**: `NotoSansFallbackChain` story in `Heading.story.tsx` — 5 scripts (Latin / Arabic / Devanagari / Japanese / Korean) on Heading. Paragraph inherits the chain via its own Text fontFamily.
- [ ] T050 [US5] **MANUAL VERIFICATION (awaiting user)** — boot marketing dev, inspect Heading/Paragraph computed font-family in DevTools (expect Space Grotesk → 20 Noto Sans variants → sans-serif). Capture screenshots for PR.
- [~] T051 [P] [US5] Runtime computed font-family assertion test. **Skipped** — JSDOM does not preserve MUI's emotion-class font-family inheritance in computed style. Equivalent coverage is the static `fontStack.test.ts` (matches `font.scss` line-by-line, asserts 20 Noto Sans + sans-serif tail).

**Checkpoint**: After Phase 7, the Noto Sans chain is observable in code.org's MUI cascade and verifiably absent from CSforAll's.

---

## Phase 8: User Story 6 — Responsive Sizing With 16px Floor (Priority: P3)

**Goal**: Confirm the responsive step ladder works at every MUI breakpoint, the 1rem floor holds, and H1 → H6 → body is non-increasing at every viewport.

**Independent test**: Storybook's "Responsive ladder" story renders all six heading levels + the body default at five viewport widths (mobile-sm 320, mobile 375, tablet 768, desktop 1024, desktop-lg 1440). At each width, computed font-sizes are: ≥ 1rem for every heading; H1 ≥ H2 ≥ … ≥ H6 ≥ body.

- [X] T052 [P] [US6] Add `ResponsiveLadder` Storybook story. **Done** — Heading.story.tsx renders H1–H6 + body default in a column with viewport-toolbar support.
- [X] T053 [P] [US6] Add responsive Jest invariant test. **Done** — `buildTypography.responsive.test.ts` walks the default + md-down + sm-down breakpoints and asserts floor + non-increasing hierarchy + body2 fixed. Plus a `ROLE_TOKENS` sanity block.
- [ ] T054 [US6] **MANUAL VERIFICATION (awaiting user)** — DevTools device emulation walk across viewport widths to capture before/after PR screenshots.

**Checkpoint**: After Phase 8, the responsive ladder is documented in Storybook + asserted in Jest.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Type checks, lint, prettier, visual regression baseline acceptance, performance check, and the CSforAll byte-identity gate per spec FR-019 / SC-009.

- [X] T055 [P] `yarn lint`. **Pass**: only 2 pre-existing warnings in `AdoptionMap.test.tsx`, no errors. Lint --fix applied to `resolveParagraphStyles.test.ts` to fix import ordering.
- [X] T056 [P] Typecheck. **Pass for new code**. 34 pre-existing errors in unrelated test files (`OneTrustProvider.test.tsx`, `createClient.test.ts`, etc.) untouched. No errors in any spec-009 file.
- [X] T057 [P] Prettier. **Pass**: applied formatting fixes to 5 files via `prettier --write`; subsequent `--check` returns clean.
- [X] T058 [P] Full jest suite. **Pass**: 121 suites, 814 tests.
- [ ] T059 **awaiting user** — local Storybook visual walk.
- [ ] T060 **awaiting user** — push to CI + Applitools baseline acceptance.
- [X] T061 [P] No `public/` asset changes. Typography is theme-only — confirmed by `git status public/` (empty).
- [ ] T062 [P] **awaiting user** — bundle-size check via `yarn build`.
- [X] T063 [P] `quickstart.md` checklist walk. **Pass**: token module + theme rewrite + Heading/Paragraph refactor + SCSS extension + deprecated migrations + Storybook stories — all landed.
- [~] T064 [P] No new memory entries warranted — the non-obvious decisions (Figma visible-label methodology, body line-height amendment, sub-1rem heading floor) are documented in spec/research/contracts rather than memory, since they're spec-specific not cross-conversation patterns.
- [ ] T065 **awaiting user** — when ready to commit, PR body will follow `[[feedback_no_test_plan_in_pr]]` + `[[feedback_no_claude_attribution]]`.
- [ ] T066 **awaiting user** — explicit push approval gate per `[[feedback_no_push_without_approval]]`. Nothing pushed; nothing committed.

**Checkpoint**: After Phase 9, the feature is ready to ship; baselines are accepted; csforall is verified byte-identical; PR is drafted but unpushed pending user approval.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no dependencies; start immediately.
- **Phase 2 (Foundational)**: depends on Phase 1; **BLOCKS** every user story phase. T004 (tokens.ts) blocks T006 (buildTypography.ts) which blocks T008 (theme rewrite) which blocks T013/T014 (Heading/Paragraph refactor). T010 (SCSS extension) is independent of the TS work and can run in parallel with the typography token tasks but MUST land before Phase 5 (deprecated migrations consume the new CSS variables).
- **Phase 3 (US1)**: depends on Phase 2. T013–T019 can run after T008 lands.
- **Phase 4 (US3)**: depends on Phase 3 (T024 modifies the same `Heading.tsx` T013 just refactored; T025 modifies `Paragraph.tsx` T014 just modified). The new field + resolver helpers in T020–T025 require Phase 3's plumbing to be in place.
- **Phase 5 (US2)**: depends on Phase 2 (needs the new `--font-size-*` CSS vars from T010) and Phase 3 (so the role tokens render correctly on the surfaces that DO use Heading/Paragraph). Independent of Phase 4 — deprecated components don't use the new `appearance` field.
- **Phase 6 (US4)**: depends on Phase 4 (overrides are most interesting when combined with the Visual-Appearance override from US3).
- **Phase 7 (US5)**: depends on Phase 2 (font-stack helper lands there).
- **Phase 8 (US6)**: depends on Phase 2 (per-breakpoint step tables in `buildTypography`).
- **Phase 9 (Polish)**: depends on every user story phase being complete OR partially complete to whatever scope is shipping.

### Within each user story

- Required tests + Storybook stories MUST exist before the implementation is considered complete (constitution III + IV).
- Component refactors (Heading.tsx, Paragraph.tsx) must come AFTER the resolver helpers (`resolveHeadingStyles.ts`, `resolveParagraphStyles.ts`) they consume — but the helpers can be authored first and tested in isolation.
- Manual verification tasks (T019, T032, T044, T050, T054) are gates BEFORE the next phase begins.

### Parallel opportunities

- All Setup tasks (T001–T003) can run in parallel.
- Within Phase 2: T005 (fontStack), T006 (buildTypography), T010 (SCSS), T011 + T012 (tests) can run in parallel after T004 (tokens.ts) lands. T009 (overline/caption rules) depends on T010 for the CSS vars.
- Within Phase 3: T015–T018 (tests + stories) can run in parallel after T013–T014 (component refactors) land.
- Within Phase 4: T020 (Heading definition) + T021 (Paragraph definition) + T022 (resolver) + T023 (resolver) can all run in parallel; T024/T025 (component rewires) depend on the corresponding resolver.
- Within Phase 5: all migration tasks T033–T041 can run in parallel (different files); T042 (Hero Banner) is independent of the others; T043 (visual coverage) and T044 (verification) gate Phase 5 completion.
- Within Phase 6, 7, 8: all marked [P] tasks can run in parallel.
- Within Phase 9: T055–T058 can run in parallel; T060 (Applitools) is a gate; T065 + T066 are the final manual gates before push.

---

## Parallel example: Phase 2 (Foundational)

```bash
# After T004 (tokens.ts) lands, launch the following in parallel:
T005  Create themes/code.org/typography/fontStack.ts
T006  Create themes/code.org/typography/buildTypography.ts
T010  Extend packages/component-library-styles/typography.module.scss with 8-cell Text + Display scales
T011  Add SCSS back-compat snapshot test
T012  Add fontStack chain test

# Then sequentially:
T007  Add buildTypography snapshot + invariant tests (depends on T006)
T008  Rewrite themes/code.org/index.ts to call buildTypography (depends on T004 + T005 + T006)
T009  Update styleOverrides/typography.ts to consume new CSS vars (depends on T010)
```

## Parallel example: Phase 5 (US2 — Deprecated migrations)

```bash
# All 9 migrations touch different files — fully parallel:
T033  yourSchool.module.scss
T034  adoptionMap.module.scss
T035  adoptionMap.scss
T036  afeEligibility.module.scss
T037  StateGapMapPanel.tsx
T038  activitiesHero.tsx
T039  facetBar.tsx + facetDrawer.tsx
T040  video/styledMuiComponents/index.ts
T041  Card.tsx
T042  Hero Banner (if T003 found a file)
```

---

## Implementation Strategy

### MVP scope (User Story 1 + 3 only)

If the team needs to ship an MVP quickly:

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (tokens, theme, fontStack, SCSS extension).
3. Complete Phase 3: US1 (Heading + Paragraph refactor; canonical defaults render correctly).
4. **STOP** at the US1 checkpoint and ship. Default-rendering Heading and Paragraph already work; deprecated components keep their existing hardcoded type until Phase 5.
5. Follow up with Phase 4 (US3 — orthogonal field) as the second PR; this is the user-facing capability the amendment requested.
6. Follow up with Phase 5 (US2 — deprecated migrations) as a third PR (or split per-file) to clear the hardcoded-type debt.

### Incremental delivery

1. Setup + Foundational → Foundation ready.
2. Add US1 → Test independently → Deploy. _MVP._
3. Add US3 → Test independently → Deploy.
4. Add US2 → Per-file PRs → Test → Deploy.
5. Add US4 + US5 + US6 verifications → Storybook updates → Final PR.

### Parallel team strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phase 1 + Phase 2).
2. Once Foundational is done:
   - Developer A: US1 + US3 (Heading + Paragraph refactor + orthogonal field) — same files, must be sequential per-developer.
   - Developer B: US2 deprecated migrations — 9 parallel files, no overlap with Developer A.
   - Developer C: US4 + US5 + US6 verifications (Storybook stories + Jest tests) — overlaps Developer A's files but only adds tests, no production-code conflict.
3. Stories complete and integrate independently.

---

## Notes

- Per memory `[[feedback_branch_workflow_sandbox_base]]`: this branch was created from the current `008-brand-buttons` branch via the spec-kit script, NOT from a freshly-pulled `sandbox`. If the user wants the branch rebased onto `sandbox` before the first commit, do that early (T001 covers the decision).
- Per memory `[[feedback_match_architecture_to_code_lifespan]]`: deprecated-component migrations stay minimal (route through existing CSS vars + MUI variants); no centralized tokens are introduced for components that will be removed in a future spec.
- Per memory `[[storybook_eyes_baseline_gate]]`: storybook-eyes IS a hard gate, and accepting baselines is a manual dashboard action — not a code fix.
- Per memory `[[contentful_array_no_manual]]` and `[[contentful_native_viewport_overrides]]`: this feature touches NO Contentful array variables and NO per-viewport overrides at the entry level. Responsive sizing flows through MUI theme breakpoints, not Contentful field shape.
- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Each user story should be independently completable and testable.
- Commit after each logical group (one phase per commit is a reasonable granularity; one per-file migration per commit in Phase 5).
- Stop at any checkpoint to validate the story independently.
- Per `[[feedback_no_push_without_approval]]`: do NOT push or open a PR without explicit user approval. T066 is the final gate.
