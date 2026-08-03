# Tasks: Brand Buttons & Brand Text Link

**Feature directory**: `/home/kal/projects/code-dot-org/marketing-sites/specs/008-brand-buttons/`
**Inputs**: [spec.md](./spec.md) (6 user stories), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [figma-tokens.md](./figma-tokens.md), `contracts/`
**Branch**: `008-brand-buttons`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2…US6). Setup / Foundational / Polish tasks omit the story label.
- Every task description includes the exact file path it touches.

## User Story map

| Story | Priority | One-line goal                                                                                                           |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| US1   | P1       | Brand Button variant matrix renders in design-system Storybook (4 sizes × 9 cells × 5 states × 2 icon-only).            |
| US2   | P1       | Every existing Contentful `button` entry auto-renders in the new Brand Button visuals.                                  |
| US3   | P2       | Authors can pick the new fields in Studio (tertiary, xl, icon-only, right icon).                                        |
| US4   | P2       | Direct in-code Button consumers re-render in the new visuals after a small size-rename sweep.                           |
| US5   | P1       | Brand Text Link variant matrix renders in marketing Storybook (3 hierarchies × 3 sizes × 5 states + tenant switcher).   |
| US6   | P1       | Every existing Contentful `link` entry auto-renders in the new Brand Link visuals on code.org; csforall byte-identical. |

---

## Phase 1: Setup

**Goal**: ~~Apply the one human Contentful schema change.~~ **No setup work required.** Per the 2026-06-22 clarification, there is no Contentful content type for `button` — the Button is a Contentful Experiences component whose "schema" is the code-side `ButtonLegacyContentfulComponentDefinition.variables` object. All updates land as code edits in subsequent phases. No Contentful Studio steps. No `ctf_get_content_type` re-read.

(T001 and T002 were removed — they assumed a `button` content type existed. Phase 2 task IDs start at T003.)

---

## Phase 2: Foundational (blocks every user story)

**Goal**: Land the shared SCSS variables, CSS custom properties, and type-system updates that every Button and Text Link task below depends on.

- [x] T003 Add SCSS variable `$button-border-radius: 0.5rem;` to `packages/component-library-styles/variables.scss` per research R5.
- [x] T004 [P] Create new file `packages/component-library-styles/buttonColors.scss` containing the 13 CSS custom properties listed in `specs/008-brand-buttons/figma-tokens.md` ("Color palette to add as CSS variables" table). Use exact hex values from Figma — no aliases to `primitiveColors.scss`. Add a top-of-file comment block citing `figma-tokens.md` as the source of truth.
- [x] T005 [P] Update `packages/component-library/src/button/types.ts` to: (a) remove `'gray'` from `ButtonColor` union, (b) export new local `ButtonSize = 's' | 'm' | 'l' | 'xl'` type per research R6.
- [x] T006 [P] Update the `buttonColors` constant in `packages/component-library/src/button/Button.tsx` to drop the `gray` entry (match the new `ButtonColor` union).
- [x] T007 Trim `checkButtonPropsForErrors` in `packages/component-library/src/button/GenericButton.tsx`: remove the `color === 'gray' && type === 'primary'` throw branch, the `color === 'gray' && type === 'tertiary' && !isIconOnly` throw branch, and the `color === 'purple' && type === 'secondary'` warning branch. Also replace `import {ComponentSizeXSToL} from '@/common/types';` with `import {ButtonSize} from './types';` and update the `size?:` prop type accordingly.
- [x] T008 Wire `buttonColors.scss` into the global SCSS entry point used by `apps/marketing` and both Storybooks. Verify the `var(--button-color-*)` references resolve at runtime by inspecting computed styles in browser devtools on any rendered page after `yarn workspace marketing dev` boots.

**Checkpoint**: After Phase 2, `yarn typecheck` passes across `packages/component-library`, the new CSS variables are available globally, and any `color="gray"` usage in the repo fails to compile (sets up US4's grep-verifiable removal).

---

## Phase 3: User Story 1 — Brand Button variant matrix in Storybook (Priority: P1)

**Goal**: The full 360-variant Brand Button matrix renders correctly in `apps/design-system-storybook`, matching each Figma frame for size × type × color × state × icon-only.

**Independent test**: Open the design-system Storybook → Button → step through the size/type/color/state/icon-only controls → every cell visually matches the corresponding Figma frame from `figma-tokens.md` Brand Button tables.

- [x] T009 [US1] Rewrite `packages/component-library/src/button/genericButton.module.scss` per the Brand Button section of `figma-tokens.md`: (a) `@use '@code-dot-org/component-library-styles/variables.scss' as variables;` at top; (b) replace `border-radius: 0.25rem;` with `variables.$button-border-radius`; (c) add a "Non-Brand legacy treatment" comment block segregating the existing `&.button-destructive` rules; (d) **remove** both `&.button-gray` rule blocks; (e) add the 9 Type × Color cell blocks (Primary, Primary Black, Primary White, Secondary, Secondary Black, Secondary White, Tertiary, Tertiary Black, Tertiary White) consuming `var(--button-color-*)` for default / hover / focus-visible / disabled / loading per the Brand Button matrix; (f) implement the "Loading = Hover visual for purple hierarchies; Loading = Default visual for Black/White hierarchies" rule via a `.is-loading` class composition.
- [x] T010 [US1] Update the per-size rules in `packages/component-library/src/button/genericButton.module.scss`: `.button-s`, `.button-m`, `.button-l`, `.button-xl` per the Brand Button per-size table in `figma-tokens.md` (font-size, font-weight 700, line-height, letter-spacing, padding, gap, icon-size). Apply `text-transform: uppercase` to `.button-m`, `.button-l`, `.button-xl` ONLY (not `.button-s`) and drop uppercase via a `.is-loading` override.
- [x] T011 [US1] Update the icon-only square rules in `packages/component-library/src/button/genericButton.module.scss` per the Brand Button icon-only table in `figma-tokens.md`: per-size square footprints (36/44/52/60), uniform paddings (8/12/16/20), constant 20px icon glyph. Confirm `&.button-iconOnly` overrides the per-size with-text padding correctly.
- [x] T012 [US1] Update the focus-ring rule in `packages/component-library/src/button/genericButton.module.scss` to use `outline: 2px solid var(--button-focus-ring);`, `outline-offset: 4px;`, `border-radius: 10px;` on `:focus-visible` (matches the figma-tokens Focus state mechanic; replaces today's `--borders-brand-teal-primary` outline).
- [x] T013 [P] [US1] Update `packages/component-library/src/button/stories/Button.story.tsx`: (a) update the `size` argType options to `['s', 'm', 'l', 'xl']`; (b) update the `color` argType options to `['purple', 'black', 'white', 'destructive']`; (c) update the `type` argType options to keep `['primary', 'secondary', 'tertiary']`; (d) **remove** the existing `xs` story row; (e) add an `xl` story row; (f) add a five-state demo story (Default / Hover / Focus / Disabled / Loading) on one representative cell (Primary Purple `m`); (g) confirm icon-only stories exercise all 4 sizes.
- [x] T014 [P] [US1] Update `packages/component-library/src/button/stories/LinkButton.story.tsx` with the same size/color/type knob updates as T013, the xs/xl swap, the five-state story, AND add a `useAsLink=true` external-link story per FR-020(g) (`href="https://example.com"`, `target="_blank"`, `iconRight` populated by the external-link icon).
- [x] T015 [P] [US1] Update `packages/component-library/src/button/stories/GenericButton.story.tsx` with the same control / story changes as T013/T014.
- [x] T016 [P] [US1] Update `packages/component-library/src/button/__tests__/Button.test.tsx`: **remove** the `color="gray" type="primary"` throw test, **remove** the `color="purple" type="secondary"` warning test, **remove** any `size="xs"` assertions; **add** tests for the new size scale (each of `s/m/l/xl` renders with the correct module class), the three Brand colors (`purple`/`black`/`white`), tertiary type rendering, icon-only happy-path, icon-only missing-icon dev-warning (per FR-018 / FR-007 mutual exclusion), left + right icon positions.
- [x] T017 [P] [US1] Update `packages/component-library/src/button/__tests__/LinkButton.test.tsx` per the same delta as T016, plus tests for `useAsLink` semantics (href required throw, onClick forbidden throw, `target="_blank"` adds `rel="noopener noreferrer"`).
- [x] T018 [P] [US1] Update `packages/component-library/src/button/__tests__/GenericButton.test.tsx` per the same delta as T016/T017.
- [x] T019 [P] [US1] Update `packages/component-library/src/button/__tests__/_BaseButton.test.tsx` per the same delta as T016 (focus-ring assertion if applicable; new CSS class names).

**Checkpoint**: After Phase 3, `yarn workspace design-system-storybook storybook` shows the full Brand Button matrix, `yarn workspace @code-dot-org/component-library test` passes, and visual inspection against `figma-tokens.md` confirms each cell matches.

---

## Phase 4: User Story 2 — Existing Button entries auto-render in the new style (Priority: P1)

**Goal**: Every existing Contentful `button` entry on every existing code.org page re-renders in the new Brand Button visuals without any author re-editing.

**Independent test**: Without touching any Contentful entry, deploy to preview and walk a representative set of code.org pages (homepage, hour-of-code, professional-learning, one teacher landing, one ad landing). Confirm every existing button renders with the new Brand visuals at the correctly-mapped size and type, with any author-set icon and external-link affordance preserved, and with no console errors.

- [x] T020 [US2] Expand the `variables` block in `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacyContentfulDefinition.ts` per `contracts/contentful-button-content-type-update.md` "Application-code definition update": expand the `type` enum to include `tertiary`; add `size` (default `m`, four options); add `iconRightName` (Text, no validation); add `isIconOnly` (Boolean, default `false`). Keep `id: 'button'` unchanged.
- [x] T021 [US2] Refactor `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/ButtonLegacy.tsx` to accept the new `size`, `iconRightName`, `isIconOnly` props per `contracts/contentful-button-content-type-update.md` "Wrapper update": (a) detect brand-family for both `iconLeftName` AND `iconRightName` via `fontAwesomeV6BrandIconsMap`; (b) construct `authorIconLeft` and `authorIconRight` `FontAwesomeV6IconProps`; (c) compute `effectiveIconRight = authorIconRight ?? (isLinkExternal ? externalLinkIconProps : undefined)` so author right icon wins (R7); (d) branch the render for `isIconOnly === true` (no text, `icon={authorIconLeft}`, `isIconOnly` on `LinkButton`) vs the with-text path; (e) pass `size ?? 'm'` (defaulting matches today's hard-coded `size="m"`).
- [ ] T022 [P] [US2] Add or expand the test file `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/__tests__/ButtonLegacy.test.tsx` with cases for: (a) existing entry shape `{color: 'purple', type: 'primary', text: 'Get Started', href: '/learn'}` renders as Brand Button Primary at size `m`; (b) entry with `color="white" type="secondary"` renders as Secondary White; (c) entry with `iconLeftName="github"` brand-detects and renders left icon; (d) entry with `iconRightName="arrow-right"` renders right icon (and the external-link icon is NOT rendered even when `isLinkExternal=true`, per R7); (e) entry with `isLinkExternal=true` and empty `iconRightName` falls back to the external-link icon on the right; (f) entry with `isIconOnly=true` renders square without text.
- [ ] T023 [US2] **MANUAL VERIFICATION** — boot `yarn workspace marketing dev`, open `http://code.org.marketing-sites.localhost:3001`, walk: `/`, `/hour-of-code`, `/teach`, one professional-learning landing, one ad landing. Confirm every previously-existing Button (composed inside Experience entries) renders in the new Brand visuals with no entry edits. The Studio Design tab on any Experience containing a Button now shows the new options (`tertiary` type, `size` dropdown, `iconRightName`, `isIconOnly`) — no Contentful schema action required to surface them; the new ComponentDefinition variables become visible after deploy. Capture before/after screenshots for the PR.

**Checkpoint**: After Phase 4, the code.org marketing app renders every legacy `button` entry in the new Brand visuals with zero per-entry author work.

---

## Phase 5: User Story 3 — Authors pick new Button fields in Studio (Priority: P2)

**Goal**: Authors editing a code.org experience in Contentful Studio can pick the new `tertiary` type, the new `xl` size, the new `iconRightName`, and the new `isIconOnly` Boolean — and the rendered Button reflects each choice.

**Independent test**: In Contentful Studio against a local code.org dev server, drag a Button into a Section, set Size to `XL`, Type to `Tertiary`, Color to `Black`, `iconRightName` to `arrow-right`, `isIconOnly=false`. Confirm rendered Button matches the Figma `xl/Tertiary Black/Default/with-right-icon` frame. Toggle `isIconOnly=true`, set `iconLeftName="arrow-right"`, blank the Text field — confirm the Button renders as a square XL icon-only Tertiary Black button.

- [ ] T024 [US3] **MANUAL VERIFICATION** — boot `yarn workspace marketing dev`, open Contentful Studio in editor mode against `http://code.org.marketing-sites.localhost:3001`, perform the three field-pick scenarios in spec.md US3 Acceptance Scenarios 1–6. Capture short screen recordings or screenshots for the PR. This phase depends entirely on the Contentful definition update from T020 and the wrapper from T021 — no new code tasks.
- [ ] T025 [US3] **MANUAL VERIFICATION** — confirm Studio surfaces the icon-only hint when an author enables `isIconOnly` with non-empty Text (Studio hint text is set via the Contentful field `description` or `help text`; if Studio doesn't render it, log a small follow-up TODO but don't block this story).

**Checkpoint**: After Phase 5, authors have the full new Button capability surface in Studio and the rendered output respects every author choice.

---

## Phase 6: User Story 4 — Direct in-code Button consumers re-render (Priority: P2)

**Goal**: Every direct in-code consumer of `Button` / `LinkButton` compiles after the one-line size-rename sweep and renders in the new Brand visuals.

**Independent test**: Run `grep -rn 'color="gray"\|size="xs"' apps/ packages/ --include='*.tsx' --include='*.ts'` after merge — expect zero matches outside `dist/` and `node_modules/`. Run `yarn typecheck`. Open both Storybooks; every Button-composing story renders.

- [x] T026 [US4] Update `packages/component-library/src/video/Video.tsx` lines 168 and 174: `color="gray"` → `color="black"`; `size="xs"` → `size="s"`. Confirm via grep that the file has no other Button consumers needing migration.
- [x] T027 [P] [US4] Verify post-sweep grep returns zero `size="xs"` Button consumers across the repo: run `grep -rn 'size="xs"' packages/component-library/src apps/marketing/src apps/marketing-storybook apps/design-system-storybook --include='*.tsx' --include='*.ts'` and confirm every match is either inside the Button stories already updated by T013–T015 or is a non-Button consumer (Slider/Dropdown/Tooltip story — those use the shared `ComponentSizeXSToL` and stay xs). Record the verification grep output in the PR description.
- [x] T028 [P] [US4] Verify post-sweep grep returns zero `color="gray"` Button consumers across the repo: run `grep -rn 'color="gray"' packages/component-library/src apps/marketing/src apps/marketing-storybook apps/design-system-storybook --include='*.tsx' --include='*.ts'` excluding stories for non-Button components. Confirm any remaining matches are non-Button (Dropdown/Chip/etc.). Record output in PR.
- [x] T029 [P] [US4] Confirm `apps/marketing/src/components/contentEditorHelper/ContentEditorHelper.tsx:61` still compiles unchanged with `color={'destructive'}` (destructive retained per research R3) — quick `yarn typecheck` on `apps/marketing`.
- [x] T030 [US4] Run `yarn lint && yarn typecheck` across `packages/component-library`, `packages/component-library-styles`, `apps/marketing`. Fix any new errors surfaced by the size-scale rename.

**Checkpoint**: After Phase 6, the repo has zero `gray` Button references and zero `size="xs"` Button references; every direct in-code consumer compiles and renders the new visuals.

---

## Phase 7: User Story 5 — Brand Text Link variant matrix in Storybook (Priority: P1)

**Goal**: The full 45-variant Brand Text Link matrix renders correctly in `apps/marketing-storybook`, including the asymmetric Hover behavior (color → text-color shift; black/white → underline), and a tenant-theme switcher demonstrates code.org Brand vs csforall legacy visuals side-by-side.

**Independent test**: Open the marketing Storybook → Text Link → step through `hierarchy/size/state` controls → every cell matches `figma-tokens.md` Brand Link tables. Toggle the tenant switcher — csforall stories show ZERO visual diff against today's baseline; code.org stories show the new Brand visuals.

- [x] T031 [US5] Refactor `apps/marketing/src/components/contentful/link/LinkContentfulDefinition.ts` per `contracts/contentful-link-content-type-update.md`: extract shared variables into a `BASE_VARIABLES` constant; export two factories — `BrandLinkContentfulComponentDefinition` (code.org, 3 Hierarchies + 3 sizes) and `LegacyLinkContentfulComponentDefinition` (csforall, 22-color + 4-size). Alias the legacy export name `LinkContentfulComponentDefinition` to `LegacyLinkContentfulComponentDefinition` for backward compatibility.
- [x] T032 [US5] Refactor `apps/marketing/src/components/contentful/link/Link.tsx` per `contracts/text-link-component-props.md`: (a) add internal `Hierarchy` type and `resolveHierarchy(color)` helper implementing the auto-mapping rules (primary/purplePrimary → color; default → black; white → white; other → color); (b) add `resolveBrandSize(size)` mapping `xs` → `s`, others passthrough; (c) preserve the existing `useSectionBackground` + `resolveTextColorForBackground` plumbing but branch by Hierarchy — switch ON for `color`/`black`, OFF for `white`; (d) remove the hardcoded `sx={{color, fontWeight, textDecoration, ...container}}` block; (e) remove the wrapping `<span style={{textDecoration: 'underline'}}>` (underline now controlled by tenant theme); (f) emit `data-hierarchy="<resolved>"` and `data-loading={isPending ? 'true' : undefined}` attributes on the rendered `<MuiLink>`; (g) add a new optional `isPending` prop to `LinkProps`.
- [x] T033 [P] [US5] Create new file `apps/marketing/src/themes/code.org/styleOverrides/link.ts` per `contracts/text-link-component-props.md` "Tenant theme override shape" — code.org section. Encode: Space Grotesk 700, per-Hierarchy default/hover/disabled/loading rules with the asymmetric Hover behavior (color Hover changes text color, no underline; black/white Hover add underline), per-size font/line-height/text-transform rules (uppercase except `s` and loading), focus ring matching Buttons (`--button-focus-ring`, 2px outer, 4px offset, 10px outer radius). Use `var(--button-color-*)` for all colors.
- [x] T034 [P] [US5] Create new file `apps/marketing/src/themes/csforall/styleOverrides/link.ts` per `contracts/text-link-component-props.md` "Tenant theme override shape" — csforall section. Encode today's legacy Link styling extracted from the current `Link.tsx` hardcoded `sx`: `display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;` plus the inner-span underline pattern. The override exists to ensure csforall visuals stay byte-identical after T032's removal of the hardcoded `sx`.
- [x] T035 [US5] Wire `LINK_OVERRIDES` from `apps/marketing/src/themes/code.org/styleOverrides/link.ts` into the code.org MUI theme aggregator (find the existing theme aggregator that imports `BUTTON_OVERRIDES` from the sibling `button.ts` and add the `MuiLink` entry alongside it).
- [x] T036 [US5] Wire `LINK_OVERRIDES` from `apps/marketing/src/themes/csforall/styleOverrides/link.ts` into the csforall MUI theme aggregator (same pattern as T035 for the csforall theme).
- [ ] T037 [P] [US5] Update `apps/marketing-storybook/stories/Link.story.tsx`: (a) add Hierarchy × size × state matrix coverage; (b) add a five-state story (Default / Hover / Focused / Disabled / Loading) on one representative cell (`color` at `m`); (c) add stories that explicitly hover (via `play()` interaction) `color` vs `black` and assert the asymmetric Hover behavior (color text shifts, no underline; black gets underline); (d) add a tenant-theme switcher story (or two paired stories — one with code.org theme, one with csforall theme) that visualizes the diff; (e) add an external-link story (`isLinkExternal=true`) confirming the right-side `OpenInNew` icon still renders; (f) add a contrast-switch story embedding the link inside a dark Section background to confirm `color`/`black` flip and `white` does not.
- [ ] T038 [P] [US5] Update `apps/marketing/src/components/contentful/link/__tests__/Link.test.tsx` (create if absent) with: (a) `resolveHierarchy` mapping table tests covering each legacy color value; (b) `resolveBrandSize` tests covering `xs → s` and passthroughs; (c) contrast switch ON for `color` and `black` (assert that the resolved `data-hierarchy` changes when `useSectionBackground` returns a dark value); (d) contrast switch OFF for `white` (assert `data-hierarchy="white"` regardless of background); (e) `isStrong` is ignored on the code.org render path (assert that `data-hierarchy` is set correctly regardless of `isStrong`); (f) `isPending=true` renders the spinner FontAwesomeV6Icon and sets `data-loading="true"`.

**Checkpoint**: After Phase 7, the Text Link matrix renders correctly in marketing Storybook, the asymmetric Hover behavior is verifiable, and the tenant switcher demonstrates the per-tenant split.

---

## Phase 8: User Story 6 — Existing Text Link entries auto-render (Priority: P1)

**Goal**: Every existing Contentful `link` entry on every existing code.org page re-renders in the new Brand Link visuals automatically. CSforAll pages render Text Links byte-identical to today.

**Independent test**: Without touching any Contentful entry, deploy to preview. Walk code.org pages containing existing `link` entries — every link renders in the new Brand Link Hierarchy, with the contrast switch flipping `color`/`black` Hierarchies on dark Sections but NOT `white`. Walk csforall preview pages — every `link` entry renders byte-identical to baseline.

- [x] T039 [US6] Update `apps/marketing/src/contentful/registration/code.org/index.ts`: change the `Link` import to bring in `BrandLinkContentfulComponentDefinition` instead of `LinkContentfulComponentDefinition`, and update the corresponding `componentRegistrations[*].definition` entry. The `Link` component import (the React component) stays the same.
- [x] T040 [US6] Update `apps/marketing/src/contentful/registration/csforall/index.ts`: change the `Link` import to bring in `LegacyLinkContentfulComponentDefinition` instead of `LinkContentfulComponentDefinition`, and update the corresponding `componentRegistrations[*].definition` entry. The `Link` component import stays the same.
- [x] T041 [P] [US6] Add a csforall-specific render test in `apps/marketing/src/components/contentful/link/__tests__/Link.csforall.test.tsx` (or extend the existing test file with a tenant-themed describe block) asserting that with the csforall MUI theme provider wrapping `<Link>`, the rendered output's structure matches today's structure: a single `<a>` (or MuiLink-wrapped `<a>`) containing an inner `<span>` with `text-decoration: underline` and color resolved via the existing `resolveTextColorForBackground` path. Snapshot test acceptable here.
- [ ] T042 [US6] **MANUAL VERIFICATION — code.org** — boot `yarn workspace marketing dev`, open `http://code.org.marketing-sites.localhost:3001`, walk pages containing Text Link entries (homepage, RichText-heavy curriculum pages, People collection pages). Confirm every link renders in the new Brand Hierarchy with no entry edits. Specifically verify: a `color="primary"` link inside a `purplePrimary` Section flips to white (SC-013); a `color="white"` link inside a `purplePrimary` Section stays white (SC-014); a `color="default"` link inside a light Section renders black, and on a dark Section flips to white. Capture screenshots.
- [ ] T043 [US6] **MANUAL VERIFICATION — csforall** — boot `yarn workspace marketing dev`, open `http://csforall.marketing-sites.localhost:3001`, walk csforall pages containing Text Link entries. Confirm every link renders **byte-identical** to today's baseline (color, font-weight per `isStrong`, underline, layout). If ANY visual diff is observed, the csforall theme override (T034) needs fixing before merge.

**Checkpoint**: After Phase 8, code.org Text Links render in the new Brand visuals automatically and csforall Text Links are byte-identical to today.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Run the full quality-gate suite, accept the visual baselines, and prepare the PR.

- [x] T044 Run `yarn prettier --write` on every file touched in Phases 1–8 per `[[feedback_run_prettier_before_commit]]`: `packages/component-library/src/button`, `packages/component-library/src/video/Video.tsx`, `packages/component-library-styles/variables.scss`, `packages/component-library-styles/buttonColors.scss`, `apps/marketing/src/components/contentful/corporateSite/buttonLegacy`, `apps/marketing/src/components/contentful/link`, `apps/marketing/src/contentful/registration/code.org/index.ts`, `apps/marketing/src/contentful/registration/csforall/index.ts`, `apps/marketing/src/themes/code.org/styleOverrides/link.ts`, `apps/marketing/src/themes/csforall/styleOverrides/link.ts`, `apps/marketing-storybook/stories/Link.story.tsx`, `packages/component-library/src/button/stories`.
- [x] T045 [P] Run `yarn lint` across `packages/component-library`, `packages/component-library-styles`, and `apps/marketing`. Fix any new lint findings.
- [x] T046 [P] Run `yarn typecheck` across the same workspaces. Fix any new typecheck errors.
- [x] T047 [P] Run `yarn workspace @code-dot-org/component-library test` and `yarn workspace marketing test`. All tests pass.
- [ ] T048 Build both Storybooks locally to confirm clean compile: `yarn workspace design-system-storybook build` and `yarn workspace marketing-storybook build`.
- [ ] T049 Push the branch and open a PR per `[[feedback_no_test_plan_in_pr]]` / `[[feedback_no_claude_attribution]]` / `[[feedback_no_push_without_approval]]` (require explicit user OK before this step). The CI will run storybook-eyes which will diff every Button-adjacent and Text-Link-adjacent story and **fail** — this is expected and the next task handles it.
- [ ] T050 Visual baseline review in the Applitools dashboard per `[[project_storybook_eyes_baseline_gate]]`: review every diff'd Button story (design-system Storybook) and every diff'd code.org Text Link story (marketing Storybook); **accept** the new baselines. **REJECT** any csforall Text Link diffs — if present, the csforall theme override needs fixing (loop back to T034 / T043 to chase the regression). Re-run CI after acceptance.
- [x] T051 Verify SC-016 token-fidelity invariant: `grep -E '#4C42CF|#382EA5|#1F1976|#E4E2F8|#F8F6FF|#AFB8C2|#D1D4D8|#E4E6E9|#F2F2F2|#0A84FF' packages/component-library-styles/buttonColors.scss` returns all 13 hex values from `figma-tokens.md`. Record the grep output in the PR description as the SC-016 acceptance evidence.

---

## Dependencies & ordering

```
Phase 1 (Setup)
   No tasks. (T001 + T002 removed per 2026-06-22 clarification — no Contentful Studio work.)

Phase 2 (Foundational)
   T003 → enables T009 (genericButton.module.scss uses $button-border-radius)
   T004 → enables T009, T033 (both consume var(--button-color-*))
   T005 → enables T006, T007, T013–T015, T016–T019, T020, T021, T026
   T006 → independent of T005 (different file)
   T007 → depends on T005 (consumes ButtonSize)
   T008 → enables visual verification in any Storybook (Phase 3+)
   T004 and T008 are [P] within Phase 2 but T008 implicitly waits on T004's file existing

Phase 3 (US1 — Brand Button matrix)
   T009 depends on T003 + T004 + T007
   T010, T011, T012 depend on T009 (same file)
   T013, T014, T015, T016, T017, T018, T019 depend on T005 + T007 (and on T009 for visual fidelity); independent of each other (different files; [P])

Phase 4 (US2 — Existing Button entries)
   T020 depends on T005 (type union). Pure code edit to the ComponentDefinition — no Contentful Studio dependency.
   T021 depends on T020 (uses the new variable shape) + T005
   T022 depends on T021 (tests the wrapper)
   T023 depends on T021 + deploy of T020/T021 (manual verification needs the code-side ComponentDefinition deployed; Studio editor surface refreshes automatically)

Phase 5 (US3 — New fields in Studio)
   T024 depends on T020 + T021 + deploy (Studio editor surface refreshes automatically once the ComponentDefinition update is deployed)
   T025 depends on T024 (same Studio walkthrough)

Phase 6 (US4 — Direct in-code consumers)
   T026 depends on T005 (color/size union changes)
   T027, T028 [P] — independent grep verifications, can run anytime after T026
   T029 [P] — confirmation that ContentEditorHelper still compiles after T005
   T030 depends on T026 + T029

Phase 7 (US5 — Brand Text Link matrix)
   T031 → enables T039, T040 (per-tenant definition factories)
   T032 → enables T037, T038 (Link.tsx props + helpers)
   T033 depends on T004 (consumes var(--button-color-*)); enables T035, T037
   T034 [P] — independent of T033 (different tenant theme file)
   T035 depends on T033 (wires the override)
   T036 depends on T034
   T037 depends on T032 + T033 + T034 + T035 + T036 (full theme stack must be in place to demo)
   T038 depends on T032 (tests the refactor)

Phase 8 (US6 — Existing Text Link entries)
   T039 depends on T031 + T032 + T035
   T040 depends on T031 + T032 + T036
   T041 [P] depends on T032 + T034 + T036
   T042 (manual) depends on T039 + T035 (code.org dev server must render new visuals)
   T043 (manual) depends on T040 + T036 + T034 (csforall dev server must render byte-identical)

Phase 9 (Polish)
   T044–T048 depend on every code change above
   T049 (open PR) depends on T044–T048 AND requires explicit user OK ([[feedback_no_push_without_approval]])
   T050 (baseline acceptance) depends on T049 (PR must exist + CI must have run)
   T051 (SC-016 grep) depends on T004 (buttonColors.scss must exist)
```

## Parallel execution windows

Within each phase, the following tasks can run concurrently (marked [P] above):

- **Phase 2 parallel block**: T004, T005, T006 (3 different files; T007 follows T005).
- **Phase 3 parallel block (after T009–T012 land)**: T013, T014, T015, T016, T017, T018, T019 (7 different story / test files).
- **Phase 4 parallel block (after T020–T021 land)**: T022 alone is meaningful in parallel; T023 is manual and serial.
- **Phase 6 parallel block (after T026 lands)**: T027, T028, T029 (3 grep / typecheck verifications on different scopes).
- **Phase 7 parallel block (after T031–T032 land)**: T033 + T034 in parallel (different theme files); after both land, T035 + T036 in parallel; after all four land, T037 + T038 in parallel.
- **Phase 8 parallel block (after T031, T032 land)**: T039 and T040 are [P] only if they avoid touching the same registration `componentRegistrations` array in conflicting ways — both DO touch different files so they ARE parallel.
- **Phase 9 parallel block**: T045 + T046 + T047 are independent quality gates.

## Implementation strategy

**Recommended slicing for incremental delivery**:

1. **MVP cut (P1 stories only)**: Phases 1 → 2 → 3 → 4 → 7 → 8 → 9. This delivers the full Brand visuals for both primitives plus zero-touch migration for both, on code.org, with csforall protected. Skip Phase 5 (US3) and Phase 6 (US4) until after the MVP merges if you want a smaller PR.
2. **Full ship**: Phases 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9, in that order. Phases 3 / 7 can interleave once Phase 2 lands (Button SCSS doesn't depend on Text Link theme files and vice versa).
3. **Solo or paired execution**: Phases 3 (Button SCSS) and 7 (Text Link theme) are the biggest single tasks. Splitting them between two engineers (or two work sessions) is natural: one owns `genericButton.module.scss` + Button stories + Button tests; the other owns `Link.tsx` + the two theme overrides + the Link story + Link tests.

**Risk**: Phase 7 (US5) is the riskiest piece. T032 (refactor Link.tsx to be theme-aware) plus T034 (encode legacy csforall styling in the theme override) MUST land together or csforall regresses. T043 (manual csforall verification) is the gatekeeper — do not merge until csforall preview pages show ZERO visual diff vs baseline.

**Out of scope** (not generated as tasks):

- Destructive Brand Button — separate follow-up spec.
- Any change to the CSforAll `button-mui` registration (Button on csforall is already on a separate definition; this feature does not touch it).
- Removing `isStrong` or `iconPosition` fields from the `link` Contentful schema — kept as render-time no-ops on code.org (research R14).

## Task count

- Setup: 0 tasks (T001–T002 removed — no Contentful Studio work)
- Foundational: 6 tasks (T003–T008)
- US1 (Brand Button matrix): 11 tasks (T009–T019)
- US2 (Existing Button entries): 4 tasks (T020–T023)
- US3 (New fields in Studio): 2 tasks (T024–T025)
- US4 (Direct in-code consumers): 5 tasks (T026–T030)
- US5 (Brand Text Link matrix): 8 tasks (T031–T038)
- US6 (Existing Text Link entries): 5 tasks (T039–T043)
- Polish: 8 tasks (T044–T051)

**Total: 49 tasks** (T001 + T002 removed; remaining IDs T003–T051 are unchanged so cross-references in code reviews and PR descriptions stay stable).

## Independent test criteria summary

| Story | Independent test criterion (paste into PR description on demo)                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1   | Design-system Storybook → Button → every cell in the 4×9×5×2 matrix matches the corresponding `figma-tokens.md` row.                                  |
| US2   | Walk 5 representative code.org pages with existing `button` entries; all render new Brand visuals; zero entry edits performed.                        |
| US3   | Studio walkthrough: author picks `tertiary`, `xl`, `iconRightName`, `isIconOnly`; rendered output matches expected Figma frame for each choice.       |
| US4   | `grep -rn 'color="gray"\|size="xs"' apps/ packages/` returns zero Button matches; `yarn typecheck` passes.                                            |
| US5   | Marketing Storybook → Text Link → every cell in the 3×3×5 matrix matches `figma-tokens.md`; asymmetric Hover behavior visible; tenant switcher works. |
| US6   | code.org pages: existing `link` entries render new Brand visuals + correct contrast-switch behavior. csforall pages: zero visual diff vs baseline.    |
