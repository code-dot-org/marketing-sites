# Tasks: Custom Text component

**Input**: Design documents from `/specs/010-custom-text/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included. The spec (FR-014) and constitution require Jest unit coverage of the resolver and marketing-storybook coverage; Playwright is omitted (no caching/redirect/consent/analytics/CMS-integration behavior — purely presentational).

**Organization**: Grouped by user story (US1–US4) for independent implementation and testing.

## Path Conventions

- Component: `apps/marketing/src/components/contentful/customText/`
- Registration: `apps/marketing/src/contentful/registration/code.org/index.ts`
- Stories: `apps/marketing-storybook/`
- Reused (no edit expected): `apps/marketing/src/components/common/colors.ts`, `apps/marketing/src/themes/code.org/typography/{tokens,fontStack}.ts`, `apps/marketing/src/components/contentful/section/SectionBackgroundContext.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Confirm affected workspace is `apps/marketing` only (+ `apps/marketing-storybook` stories); no `packages/*` change planned per plan.md Structure Decision
- [x] T002 [P] Confirm reused primitives exist and signatures match contracts: `resolvedCssVarForBrandColor`/`cssVarForBrandColor`/`brandTextColorOptions`/`brandColorOptionsWithDefault` in `components/common/colors.ts`, `SCALE_TEXT`/`SCALE_DISPLAY`/`SizeToken`/`WEIGHTS` in `themes/code.org/typography/tokens.ts`, `CODE_ORG_TEXT_FONT_STACK`/`CODE_ORG_DISPLAY_FONT_STACK` in `fontStack.ts`, `useSectionBackground` in `SectionBackgroundContext.tsx`
- [ ] T003 [P] **BLOCKED — Contentful**: Initialize Contentful MCP, capture space/environment context, and confirm no existing `customText` component id collides (research.md R8). Not connected this session — must be done before T020.
- [x] T004 Create the component folder `apps/marketing/src/components/contentful/customText/` with `__tests__/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Types + the per-type default map block all user stories.

- [x] T005 Define shared types in `apps/marketing/src/components/contentful/customText/resolveCustomTextStyles.ts`: `CustomTextType`, `CustomTextTag`, `CustomTextFontTrack`, `CustomTextTransform`, and the `CUSTOM_TEXT_TYPE_DEFAULTS: Record<CustomTextType, CustomTextDefault>` map (draft values from research.md R7; mark chip/Statistic values `// TODO: confirm with design`)
- [x] T006 Implement the `resolveCustomTextStyles(args)` skeleton in the same file returning `{tag, sx, resolvedColor, background, icon}` with type-default seeding only (no overrides yet) — establishes the contract in contracts/component-props.md

**Checkpoint**: Types + defaults compile; user story work can begin.

---

## Phase 3: User Story 1 - Author a predefined text style from a dropdown (Priority: P1) 🎯 MVP

**Goal**: Selecting a type renders a finished element with that type's defaults (color, size, font, weight, casing, semantic tag); Subtitle defaults to `<p>`, all others to `<span>`; unset → `custom`.

**Independent Test**: In Storybook, render each of the six types with no overrides and confirm distinct default appearance + correct tag.

### Tests for User Story 1

- [x] T007 [P] [US1] In `customText/__tests__/resolveCustomTextStyles.test.ts`: assert each type seeds the expected `tag`, track/size cell (`fontSize`/`lineHeight`), `fontWeight`, `textTransform`, and color; assert Subtitle → `tag: 'p'`, all others → `'span'`; assert unknown/undefined type → `custom`
- [x] T008 [P] [US1] In `customText/__tests__/CustomText.test.tsx`: render each type and assert the rendered element tag + that the resolved sx is applied via MUI Typography

### Implementation for User Story 1

- [x] T009 [US1] Implement size/weight/font resolution in `resolveCustomTextStyles.ts`: read `SCALE_TEXT`/`SCALE_DISPLAY` cell for the type's track+size → emit `fontSize`/`lineHeight`/`letterSpacing`; map `WEIGHTS[weight]` → `fontWeight`; map track → `fontFamily` (`CODE_ORG_TEXT_FONT_STACK`/`CODE_ORG_DISPLAY_FONT_STACK`); emit `textTransform` when not `none`
- [x] T010 [US1] Implement `CustomText.tsx`: render `<Typography component={tag} variant="inherit" className={className} sx={{...sx, color: resolvedColor}}>{children}</Typography>`; default `type='custom'`; consume `useSectionBackground()` for the resolver
- [x] T011 [US1] Create `customText/index.ts` exporting the default component and (placeholder) definition
- [x] T012 [P] [US1] Add a marketing-storybook story file rendering all six types with default props on a neutral background

**Checkpoint**: All six types render correctly with defaults (MVP).

---

## Phase 4: User Story 2 - Override individual style options without losing other defaults (Priority: P1)

**Goal**: Each override (htmlTag, color, textSize, font, fontWeight, textTransform) replaces only its dimension; `default` sentinel / undefined restores the type default.

**Independent Test**: Set one override at a time and confirm only that property changes; clear it and confirm revert.

### Tests for User Story 2

- [x] T013 [P] [US2] Extend `resolveCustomTextStyles.test.ts`: for each override field, assert it changes only its dimension and leaves the others at the type default; assert `default` sentinel = inherit; assert `htmlTag` override changes tag on every type incl. overriding Subtitle's `p`

### Implementation for User Story 2

- [x] T014 [US2] Extend `resolveCustomTextStyles.ts` with per-property override layering: `htmlTag` → `tag`; `textSize` → size cell on resolved track; `font` → track + font stack; `fontWeight` → weight; `textTransform` → transform; `color` → text color token. Each treats `undefined`/`'default'` as inherit
- [x] T015 [US2] Wire the override props through `CustomText.tsx` props → resolver (per contracts/component-props.md `CustomTextProps`)

**Checkpoint**: Overrides isolated; type defaults preserved.

---

## Phase 5: User Story 3 - Backgrounded text with border, and contrast-aware text color (Priority: P2)

**Goal**: No background → text color contrast-switches vs. enclosing Section background. Background set → 2px border in chosen border color, contrast switch bypassed, color applied directly. No border-width control.

**Independent Test**: Render on light + dark Section backgrounds with/without an element background; confirm contrast behavior and the fixed 2px border.

### Tests for User Story 3

- [x] T016 [P] [US3] Extend `resolveCustomTextStyles.test.ts`: with no background, assert `resolvedColor` = `resolvedCssVarForBrandColor(color, bg)` (switches on dark bg); with a background, assert `resolvedColor` = `cssVarForBrandColor(color)` (no switch) and `background.border === '2px solid <borderColor var>'`; assert borderColor without background → `background === null`

### Implementation for User Story 3

- [x] T017 [US3] Extend `resolveCustomTextStyles.ts`: resolve `backgroundColor`/`borderColor` (type default for chip types or override); when a background is present, set `resolvedColor` via `cssVarForBrandColor` (bypass switch) and build `background = {backgroundColor, border: '2px solid …'}`; else `resolvedCssVarForBrandColor(color, enclosingBackground)` and `background = null`
- [x] T018 [US3] Update `CustomText.tsx`: when `background` is non-null, wrap the Typography in a MUI `<Box sx={{display:'inline-block', ...background, ...chip padding/radius from design}}>`; otherwise render bare
- [x] T019 [P] [US3] Add Storybook stories: Course Topics + Course Labs chips, and a plain type rendered on both a light and a dark mocked Section background (decorator with `SectionBackgroundProvider`)

**Checkpoint**: Contrast + backgrounded/bordered chips work.

---

## Phase 6: User Story 4 - Single leading or trailing icon that matches the text color (Priority: P2)

**Goal**: One icon (left or right) renders inline and inherits the resolved text color; never both sides (left wins).

**Independent Test**: Set left icon → renders before text in text color; clear, set right → renders after; set both → only left.

### Tests for User Story 4

- [x] T020 [P] [US4] Extend `resolveCustomTextStyles.test.ts`: `iconNameLeft` → `{name, side:'left'}`; only `iconNameRight` → `{name, side:'right'}`; both set → left; neither → `null`
- [x] T021 [P] [US4] Extend `CustomText.test.tsx`: assert a single `FontAwesomeV6Icon` renders on the correct side and that both-set renders only one icon

### Implementation for User Story 4

- [x] T022 [US4] Extend `resolveCustomTextStyles.ts` icon resolution (left-wins precedence) and update `CustomText.tsx` to render text+icon in an inline-flex wrapper with `color: resolvedColor`, the `FontAwesomeV6Icon` using `color: 'inherit'`/`currentColor`, ordered by `icon.side`
- [x] T023 [P] [US4] Add Storybook stories for icon-left and icon-right variants (e.g. on a Course Labs chip and a plain type)

**Checkpoint**: All four user stories independently functional.

---

## Phase 7: Contentful definition & registration (gated on MCP + human apply)

- [x] T024 [US1] Author `CustomTextContentfulDefinition.ts` per contracts/contentful-fields.md (type dropdown + all override fields, color dropdowns via `brandTextColorOptions`/`brandColorOptionsWithDefault`, `builtInStyles: ['cfTextAlign','cfMaxWidth']`, `category: '03: Content Building Blocks'`); export from `index.ts`
- [x] T025 [US1] Register CustomText in `apps/marketing/src/contentful/registration/code.org/index.ts` (import + `{component, definition}` entry)
- [ ] T026 **BLOCKED — Contentful human step**: Present the exact `customText` content type fields/validations for a human to apply/approve in Contentful, then re-read the applied state via MCP (FR-016, constitution Principle V). Verify rendering in the Studio iframe afterward.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T027 [P] Verify WCAG AA contrast for every type on supported light/dark backgrounds and for chip fills; confirm semantic tag choices don't fabricate heading hierarchy and icons are decorative (SC-004, FR-015)
- [x] T028 Run lint + typecheck + Jest for `apps/marketing`; run `yarn prettier` on touched files before committing (per repo CI history)
- [ ] T029 Run the marketing-storybook CI path + storybook-eyes; accept new visual baselines in the Applitools dashboard
- [ ] T030 [P] Resolve open questions O1–O3 (icon field shape, hex/rem escape hatches, chip geometry) with design if not already settled; update defaults accordingly

---

## Dependencies & Execution Order

- **Setup (P1)** → **Foundational (P2)** → user stories.
- **US1 (P3)** is the MVP and unblocks the rest (shared component + resolver skeleton).
- **US2, US3, US4** each extend the same resolver/component; they are logically independent in behavior but touch the same two files, so within them the resolver edit precedes the component edit. Sequence US2 → US3 → US4 to avoid edit conflicts (not parallel across stories).
- **Phase 7 (Contentful)** depends on US1–US4 for the final prop set and is **blocked** on Contentful MCP + human apply (T003, T026).
- **Phase 8** is last.

## Parallel Opportunities

- T002, T003 in Setup.
- Test tasks marked [P] within a story (different test files) can be written together.
- Story-specific Storybook story files (T012, T019, T023) are [P] — distinct files.

## Implementation Strategy

**MVP = Phase 1–3 (US1)**: a working Custom Text with six correct type defaults, renderable in Storybook, before Contentful wiring. Layer US2→US4, then gate the Contentful definition on the human/MCP step. The React component, resolver, tests, and stories can all be completed this session; **only T003, T024–T026 (live Contentful) are blocked** by the missing MCP connection.
