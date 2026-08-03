# Implementation Plan: Sitewide Typography System

**Branch**: `009-typography-system` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-typography-system/spec.md` (updated 2026-06-23 to lock body line-height to Figma `text-md` token)

## Summary

Rebuild the **code.org** MUI typography surface around two explicit type tracks — **Display (Space Grotesk)** for headings and **Text (Geist)** for body / lists / link labels / captions / overline — each addressable as an 8-size × 4-weight grid (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl` × Regular/Medium/Semibold/Bold). Bind every MUI `theme.typography` variant (`h1`–`h6`, `body1`–`body4`, `overline`, `caption`) to one cell in that grid via a new token module (`apps/marketing/src/themes/code.org/typography/tokens.ts`), with **H1 = Display 2xl Semibold** and **body default = Text Md Medium** locked from the spec; H2–H6 descend the Display scale at Semibold (`xl`/`lg`/`md`/`sm`/`xs` — final cells confirmed in research). Replace the current `clamp()` table in `Heading.tsx` and the per-variant `font-size` overrides in `themes/code.org/index.ts` with **per-breakpoint step tables on the MUI variants themselves** so responsive resizing is one media-query cascade at SSR time, never drops below 1rem, and stays in sync with the same 8-token vocabulary authors see.

Re-introduce the **Noto Sans i18n fallback chain** that already lives in SCSS (`packages/component-library-styles/font.scss:12-17`, 20 locale variants) into the MUI font-family stack by adding a code.org-only helper `createCodeOrgFontStack(primary)` that emits `${primary}, ${NOTO_SANS_CHAIN}, sans-serif`. **CSforAll is not touched** — the existing `createFontStack` helper in `apps/marketing/src/themes/common/constants.tsx` keeps its current 2-family output and continues to feed `themes/csforall/index.ts`.

`Heading.tsx` loses its hardcoded `font-family: 'Space Grotesk'`, the per-level `clamp()` table, and its `lineHeight: 1` default — all three values now come from the per-level theme variant so a single edit to `tokens.ts` updates every default H1 across every page, every deprecated component, and Storybook. `Paragraph.tsx` keeps its current shape (already routes through MUI variants); its `isStrong` weight changes from 600 to map to the new Semibold cell explicitly. Legacy `visualAppearance` enums (`heading-xxl`…`heading-xs`, `body-one`…`body-four`) are preserved as the level-selection vocabulary in Contentful Studio — they map at component layer to the same `h1`…`h6` / `body1`…`body4` semantic tags, which now carry the new canonical defaults — so **no Contentful schema change** and **no entry re-publish** is required.

Deprecated code.org-only components that hardcode their type today (Hero Banner, `YourSchool`, `AdoptionMap`, `AfeEligibility`, and any others surfaced in research) are migrated to consume the canonical defaults via MUI variants or CSS custom properties emitted by `cssVariables: true` on the code.org theme. The shared SCSS primitives at `packages/component-library-styles/typography.module.scss` (currently `--font-size-body-xs`/`-sm`/`-md`/`-lg`) are extended to expose the full 8-token Text-track scale and an 8-token Display-track scale, additive to preserve the existing variable names for back-compat.

CSforAll's typography theme (`themes/csforall/index.ts`), its critical-fonts pipeline, and its rendered output are **byte-identical before and after** this feature ships — verified by Applitools/storybook-eyes baselines on csforall-only stories.

## Technical Context

**Language/Version**: TypeScript ~5.x, React 18, Next.js 14 (existing marketing app), SCSS modules + MUI theme variants for component styling.

**Primary Dependencies**: `@mui/material` (existing — uses `createTheme({cssVariables: true})`), `@code-dot-org/fonts` (existing — provides `FONT_FAMILY_NAMES`, `FALLBACK_FONT_FAMILIES_BY_LOCALE`, `loadFonts()`, locale resolver), `@code-dot-org/component-library-styles` (existing — SCSS primitives extended). No new third-party dependency.

**Storage**: N/A — Contentful entries are read-only for this feature.

**Contentful Data Model**: **No Contentful content-type schema migrations.** Two **ComponentDefinition variable updates** (code-side, per the spec 008 / spec 009 precedent that ComponentDefinition.variables are code-managed and require no Studio configuration step):

- **Heading** gains a NEW variable `appearance` (Studio displayName "Visual Appearance"; enum `default` + 8 Display cells; default `default`). The existing `visualAppearance` variable (Studio displayName "Heading Level"; enum `heading-xxl`…`heading-xs`) is unchanged in shape — it still selects the semantic tag and seeds the canonical role token.
- **Paragraph**'s existing `visualAppearance` variable is widened: enum grows from 4 legacy values to 12 (4 legacy + 8 new Text cells `text-xs`…`text-4xl`). Default stays `body-two`. Shape unchanged.
- `heading.fontWeight` enum stays as `'500' | '700'`. **Deferred** to a follow-up spec to widen to 4 cells (Regular / Medium / Semibold / Bold).
- `heading.fontSize` / `heading.lineHeight` stay as freeform Number overrides.
- Existing entries continue to validate (every existing enum value remains valid).

Zero `ctf_get_content_type` MCP read/write needed — neither `heading` nor `paragraph` content types are touched; only the code-side ComponentDefinition variable objects change. Studio editors see the new "Visual Appearance" dropdown on Heading and the widened Paragraph enum immediately after deploy. The exact ComponentDefinition deltas are recorded in `contracts/heading-component-props.md` and `contracts/paragraph-component-props.md`.

**MUI / Legacy DS Plan**: Direct MUI. The plan stays on MUI `theme.typography` variants as the canonical role-token surface (no parallel custom-token API, per FR-022/FR-023). The token module is a plain TS file consumed by `createTheme()`; the MUI variant output is what every consumer (Heading / Paragraph / Rich Text / Link / deprecated components / SCSS via `--mui-typography-*` CSS variables) reads. No legacy design-system migration. No new styling library.

The MUI deprecated-legacy-DS concern is not applicable here — every component touched (Heading, Paragraph, Rich Text, Link, Hero Banner) is already on the MUI path; this work upgrades how MUI is configured, not what styling system is in use. The deprecated content components (Hero Banner, YourSchool, AdoptionMap, AfeEligibility) that currently bypass `theme.typography` are migrated to consume it directly — same MUI path, no new abstraction.

**SEO / Indexing Plan**: Existing Experience sitemap flow unchanged. No new metadata, structured data, canonical, robots, or indexing behavior. Visual reflow at smaller viewports may reduce CLS marginally (the current `clamp()` produces smoother but constantly-shifting font sizes; the new stepped breakpoints produce stable sizes between breakpoint thresholds), but no Core Web Vitals contract is added or removed.

**Testing**:

- Jest + React Testing Library for unit tests on `Heading`, `Paragraph`, `Rich Text` under `apps/marketing/src/components/contentful/{heading,paragraph,richText}/__tests__/`. New cases: per-level canonical default resolution, legacy `visualAppearance` auto-map, override precedence over canonical default, Rich Text inline element resolution.
- Storybook stories in `apps/marketing-storybook` (Heading, Paragraph, RichText, Hero Banner) and `apps/design-system-storybook` (if any atomic typography primitive is added — none expected). New stories: per-level default matrix, responsive ladder at 5 viewports, override matrix, Rich Text mixed content, Hero Banner reference, deprecated-component-after-migration.
- Visual gate via **`marketing/storybook-eyes` (Applitools)** — every story affected by this work will visual-diff. All baselines MUST be re-accepted on the Applitools dashboard (CI-only key) — per `[[project_storybook_eyes_baseline_gate]]` this is manual baseline acceptance, not a code fix.
- No new Playwright/integration coverage. Typography is leaf presentation; no caching, redirect, consent, analytics, or CMS integration concern is introduced beyond what the existing Heading/Paragraph registrations already cover.
- Lint + typecheck via existing `yarn lint` / `yarn typecheck`. Per `[[feedback_run_prettier_before_commit]]`, `yarn prettier --check` runs on touched packages before every commit (CI prettier hook has burned us twice).

**Target Platform**: Web (Next.js SSR), all viewports MUI supports (`xs`/`sm`/`md`/`lg`/`xl` breakpoints — exact widths per `theme.breakpoints.values`; default MUI is `0`/`600`/`900`/`1200`/`1536`px). Server-rendered only — no `'use client'` directive added or removed. MUI `cssVariables: true` is already on so role-token CSS custom properties emit at SSR.

**Project Type**: Web application (Next.js marketing app + design-system Storybook + marketing Storybook companions, all in a Turborepo monorepo).

**Performance Goals**: No measurable impact on hot paths. The new token module is a constant TS object evaluated once per build; MUI's `createTheme` runtime cost is unchanged. The new responsive cascade replaces a runtime `clamp()` calculation with breakpoint media queries — net wash or marginal positive. No additional webfont download (Noto Sans variants either already load from `@code-dot-org/fonts/brands/code.org/index.css` or rely on system-installed variants).

**Constraints**:

- MUST remain SSR-only — no `'use client'` added.
- MUST NOT modify `themes/csforall/index.ts`, `themes/csforall/critical-fonts.ts`, `themes/csforall/constants/fonts.ts`, or `themes/csforall/styleOverrides/typography.ts`.
- MUST NOT change the public Contentful component ids `heading` or `paragraph`.
- MUST NOT change the existing `visualAppearance` enum values on either component.
- MUST NOT introduce any new webfont @font-face declaration; the Noto Sans chain is CSS-only against fonts the existing `@code-dot-org/fonts/brands/code.org/index.css` pipeline already declares (or system-installed equivalents).
- MUST NOT touch the existing `getFontByLocale` resolver — it stays as the per-locale Noto Sans selection mechanism.
- Bundle delta budget: ≤ 1 KB gzipped across the touched theme files. The token module is small; the deleted `HEADING_RESPONSIVE_SIZE` table partially offsets.
- All `font-size` / `line-height` values in the new token module MUST be expressed in `rem` (no `px` literals) per FR-005 / SC-011.
- Responsive sizes for every level at every breakpoint MUST be ≥ 1rem (the body floor) per FR-015 / SC-004.
- At every breakpoint, the rendered H1 → H6 → body sequence MUST be non-increasing per FR-016 / SC-005.

**Scale/Scope**: Targets the **code.org** tenant only. The shared SCSS primitives in `packages/component-library-styles/typography.module.scss` (extended additively) and the Noto Sans chain in `font.scss` (already canonical) reach both tenants by virtue of being shared, but the additive extensions do not change any value csforall consumes today. CSforAll's MUI theme is unchanged. CSforAll-rendered pages MUST be byte-identical pre / post.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**:
  No logging, metrics, traces, or analytics changes. No cache or revalidation changes — typography is leaf presentation inside existing Experience pages whose cache headers (`stale-while-revalidate` + `stale-if-error`) remain untouched. No new third-party data flow, no external font CDN call, no analytics integration. No personal data, no Student Records, no FERPA-adjacent concerns. The Noto Sans fallback chain is a CSS `font-family` cascade that resolves locally in the browser against fonts already loaded by `@code-dot-org/fonts/brands/code.org/index.css` or against system-installed variants — no network egress added. **PASS.**

- **Shared System First And SSR By Default**:
  Affected workspaces:

  - `apps/marketing/src/themes/code.org/` — primary target. New `typography/tokens.ts` (token grid + role tokens). `index.ts` rewritten to consume the token builder. `constants/fonts.ts` extended with the Noto Sans chain. `critical-fonts.ts` unchanged (it loads existing @font-face declarations from `@code-dot-org/fonts/brands/code.org/index.css`). `styleOverrides/typography.ts` updated to route overline + caption sizes through the new scale tokens.
  - `apps/marketing/src/themes/common/constants.tsx` — `createFontStack` left unchanged (csforall still uses it). New code.org-only helper added next to it OR colocated in `themes/code.org/typography/fontStack.ts`.
  - `apps/marketing/src/components/contentful/heading/Heading.tsx` — refactored to (a) remove the `clamp()` table, hardcoded `font-family: 'Space Grotesk'`, and `lineHeight: 1` default; (b) consume the new three-step resolution chain via `resolveHeadingStyles({visualAppearance, appearance, ...overrides})`. Override props preserved.
  - `apps/marketing/src/components/contentful/heading/HeadingContentfulDefinition.ts` — **MODIFIED**: adds the new `appearance` variable (Studio displayName "Visual Appearance"; 9 enum values: `default` + 8 Display cells).
  - `apps/marketing/src/components/contentful/heading/resolveHeadingStyles.ts` — **NEW**: pure helper implementing the three-step style resolution chain.
  - `apps/marketing/src/components/contentful/paragraph/Paragraph.tsx` — `isStrong` continues to map to Semibold (weight 600); the rendered variant + inline sx now come from `resolveParagraphStyles({visualAppearance, isStrong, isItalic})`; legacy color path preserved unchanged.
  - `apps/marketing/src/components/contentful/paragraph/ParagraphContentfulDefinition.ts` — **MODIFIED**: widens `visualAppearance.validations.in` from 4 to 12 enum values (legacy `body-*` + new `text-*`).
  - `apps/marketing/src/components/contentful/paragraph/resolveParagraphStyles.ts` — **NEW**: pure helper for variant binding + inline sx for the new Text cells.
  - `apps/marketing/src/components/contentful/richText/RichText.tsx` + `richTextStyles.ts` — verify inline `h1`–`h6` and paragraph rendering uses Heading / Paragraph composition (no direct typography styling); add a Storybook story for mixed content.
  - `apps/marketing/src/components/contentful/link/Link.tsx` — verify the per-tenant `MuiLink` `styleOverrides` from spec 008 consume Text-track size tokens for `s`/`m`/`l`. Update `themes/code.org/styleOverrides/link.ts` if it currently hardcodes link font-size in px or rem literals — switch to scale tokens.
  - Deprecated code.org-only components — migrated SCSS modules:
    - `apps/marketing/src/components/contentful/corporateSite/yourSchool/yourSchool.module.scss` (2rem / 1.25rem / 0.875rem → scale tokens)
    - `apps/marketing/src/components/contentful/corporateSite/adoptionMap/adoptionMap.module.scss` (0.75rem → smallest scale ≥ 1rem)
    - `apps/marketing/src/components/contentful/corporateSite/afeEligibility/afeEligibility.module.scss` (1rem / 0.625rem → scale tokens)
    - Hero Banner — research confirms exact path during Phase 0; expected at `apps/marketing/src/components/contentful/corporateSite/heroBanner/` or similar.
    - Additional surfaces identified by the research agent (pending fork result).
  - `packages/component-library-styles/typography.module.scss` — additive extension to cover the full 8-token Text scale and add an 8-token Display scale. Existing `--font-size-body-{xs,sm,md,lg}` variable names retained for back-compat; resolved values must match the new token values (any change to these is verified by visual regression on csforall stories).
  - `packages/component-library-styles/font.scss` — unchanged (the `$noto-sans-fonts` list and weight-named mixins are already what we want).
  - `packages/fonts/src/constants.ts` — unchanged. The `FONT_FAMILY_NAMES` array is the preloader contract; we don't change preloads.
  - `apps/marketing-storybook/stories/` — Heading.story.tsx, Paragraph.story.tsx, RichText.story.tsx, HeroBanner.story.tsx (if it exists) extended with the matrices and responsive viewports enumerated in FR-021. New story: typography-scale matrix (per-level default × 5 viewport widths).
  - `apps/design-system-storybook/` — no work expected. The Heading / Paragraph components live in `apps/marketing/`; their stories live in `apps/marketing-storybook/`.

  Shared-system reuse: the canonical role-token surface is the MUI `theme.typography` variant API — the standard MUI mechanism. The new TS token module sits as a pure data layer feeding `createTheme`; no parallel custom-token API. SCSS primitives extend the existing file at `packages/component-library-styles/typography.module.scss`. The Noto Sans chain is reused from the existing `font.scss` definition (mirrored to TS, not redefined).

  SSR-only: no `'use client'` added. MUI `cssVariables: true` emits CSS custom properties at SSR; per-breakpoint media queries inside variant definitions resolve at SSR. No hydration cost added.

  CSforAll isolation: `themes/csforall/*` untouched; `createFontStack` (the shared common helper) untouched; csforall continues to consume the bare 2-family stack `${font}, sans-serif`. Shared SCSS extensions are additive: any existing variable used by csforall today resolves to the same value tomorrow.

  **PASS.**

- **WCAG AA And Layered Storybook UX**:
  Higher-level marketing components composed from MUI + Contentful — primary review surface is `apps/marketing-storybook`. Stories enumerated in spec FR-021 cover per-level defaults (H1–H6), the override matrix, Rich Text mixed content, Hero Banner reference, and the responsive ladder at five viewport widths (`mobile-sm`, `mobile`, `tablet`, `desktop`, `desktop-lg`).

  Accessibility expectations:

  - Root `html { font-size: 100% }` (already set in `typography.module.scss:11`) preserves user font-size preferences — every `rem`-based size scales accordingly.
  - The 1rem (16px) body floor at every viewport (FR-015) preserves the legibility minimum.
  - Non-increasing H1 → H6 → body sequence at every viewport (FR-016) preserves heading hierarchy for screen readers and visual users.
  - Locale-resilience: the Noto Sans chain covers 20+ scripts including RTL (Arabic, Hebrew), CJK (JP / SC / TC / KR), Indic (Devanagari, Bengali, Tamil, Telugu, Kannada, Sinhala, Myanmar, Thai, Khmer, Thaana), Armenian, Georgian. RTL layout is unchanged — Heading and Paragraph emit logical-property CSS via MUI which already supports `dir="rtl"` markup.
  - Color contrast — out of scope here; spec 006's contrast switch handles foreground/background.
  - Layout stability — switching from `clamp()` to stepped breakpoints produces stable sizes between threshold widths (small positive a11y win — `clamp()` causes constant micro-reflow as the user resizes / rotates).

  **PASS.**

- **Quality Gates Are Release Gates**:
  Required gates:

  - **Lint + typecheck**: `yarn lint`, `yarn typecheck` on `apps/marketing`, `packages/component-library-styles`. (`packages/fonts` is not touched.)
  - **Unit tests**: Jest tests under `apps/marketing/src/components/contentful/{heading,paragraph,richText}/__tests__/`. New cases: per-level canonical default resolution, legacy enum auto-map preserved, override precedence (size / weight / fontKerning / colorOverride), Rich Text inline element resolution, font-family includes Noto Sans chain.
  - **Storybook coverage**: stories enumerated in FR-021 — per-level default × responsive ladder × override matrix × Rich Text × Hero Banner.
  - **Visual gate (storybook-eyes / Applitools)**: every Heading-, Paragraph-, RichText-, HeroBanner-, deprecated-corporate-site-adjacent story will diff. All baselines MUST be re-accepted on the Applitools dashboard. Crucially: **CSforAll baselines MUST diff to zero** (any non-zero CSforAll diff is a regression, not a baseline update).
  - **Prettier**: `yarn prettier --check` on touched packages before every commit per `[[feedback_run_prettier_before_commit]]`.
  - **Design-system Storybook CI path**: no design-system primitives touched, so the design-system Storybook gate has nothing new to validate — the marketing Storybook is the gate for this feature.
  - **No integration / Playwright coverage** added — typography is a leaf presentation concern with no caching, redirect, consent, analytics, or CMS integration changes.

  **PASS.**

- **Spec-Driven Incremental Delivery**:
  User stories in spec.md are independently deliverable:

  - **US1 (Heading + Paragraph defaults from a single source)** — the foundation. Lands as: token module + theme rewrite + Heading.tsx refactor + Paragraph.tsx weight tweak. Shippable as one PR; verifiable in Storybook before the deprecated-component migration. Existing live pages render with canonical defaults from the moment this lands.
  - **US2 (Deprecated components reflect canonical defaults)** — depends on US1. Lands as one or more PRs migrating the SCSS modules (one per component or grouped by directory). Each component is independently testable in its own story.
  - **US3 (Per-instance overrides)** — no new code needed; verification of existing override props after US1. Pure Storybook coverage + targeted Jest cases.
  - **US4 (Noto Sans fallback chain)** — shipped with US1 (the chain rewrite is part of `themes/code.org/constants/fonts.ts` and the createFontStack helper change). Independently testable by inspecting computed font-family on any rendered element.
  - **US5 (Responsive stepping with 1rem floor)** — shipped with US1 (the per-breakpoint step tables live in the same token module). Independently testable via the responsive Storybook story.

  Affected brands: **code.org** receives the new typography; **csforall byte-identical** (verified by Applitools).
  Locales: all 23+ locales the per-locale resolver supports continue to work; the Noto Sans chain in the MUI stack is independent of the per-locale primary-font selection.
  Contentful: **no content-type changes** — neither `heading` nor `paragraph` ComponentDefinitions need a Studio update. The Heading `fontWeight` enum stays at `['500', '700']` for this feature (4-weight ladder expansion deferred as a follow-up to keep scope tight).
  SEO/sitemap: existing Experience sitemap flow unchanged.
  Infrastructure sync: none.
  Contentful MCP usage: not required for this feature — confirmed via direct read of `HeadingContentfulDefinition.ts` and `ParagraphContentfulDefinition.ts`; both definitions are code-side. Recorded explicitly in research.md.

  **PASS.**

**Result**: All five core principles pass. **No constitutional violations to justify.**

## Project Structure

### Documentation (this feature)

```text
specs/009-typography-system/
├── plan.md                                 # This file
├── spec.md                                 # Feature spec (amended 2026-06-23 for body line-height)
├── research.md                             # Phase 0 output (this command)
├── data-model.md                           # Phase 1 output (this command)
├── quickstart.md                           # Phase 1 output (this command)
├── contracts/
│   ├── role-tokens.md                      # Canonical (semantic role → track × size × weight × line-height × per-breakpoint) bindings
│   ├── scale-tokens.md                     # The 8-size × 4-weight grid per track with locked rem values from Figma
│   ├── heading-component-props.md          # Heading.tsx React API after the refactor
│   ├── paragraph-component-props.md        # Paragraph.tsx React API after the refactor
│   ├── font-fallback-chain.md              # The shared Noto Sans + sans-serif chain and how it composes per-locale
│   └── deprecated-component-migration.md   # Per-component recipe for the migrations under US2
└── checklists/
    └── requirements.md                     # Spec quality checklist (already created in /speckit.specify)
```

### Source Code (repository root)

```text
apps/marketing/
├── src/
│   ├── themes/
│   │   ├── code.org/
│   │   │   ├── index.ts                          # MODIFIED — typography block rewritten to call buildTypography(tokens) from the new module
│   │   │   ├── typography/
│   │   │   │   ├── tokens.ts                     # NEW — Display scale (8 sizes), Text scale (8 sizes), 4 weights, role tokens (h1–h6 + body1–body4 + overline + caption), per-breakpoint step tables, locked rem values from research.md
│   │   │   │   ├── fontStack.ts                  # NEW — createCodeOrgFontStack(primary): emits `${primary}, ${NOTO_SANS_CHAIN}, sans-serif`; exports NOTO_SANS_CHAIN constant (mirror of $noto-sans-fonts from font.scss)
│   │   │   │   └── buildTypography.ts            # NEW — pure function: (tokens, theme) → MUI typography config object with per-breakpoint media queries baked into each variant
│   │   │   ├── constants/
│   │   │   │   └── fonts.ts                      # MODIFIED — re-exports SPACE_GROTESK_FONT + GEIST_FONT; adds NOTO_SANS_FONTS as a typed array constant (matches font.scss list)
│   │   │   ├── critical-fonts.ts                 # UNCHANGED — still imports '@code-dot-org/fonts/brands/code.org/index.css'
│   │   │   └── styleOverrides/
│   │   │       └── typography.ts                 # MODIFIED — overline + caption font-size rules switch from hardcoded `0.625rem`/`0.75rem`/`0.875rem` to scale tokens (Text-track xs/sm/md cells)
│   │   ├── csforall/
│   │   │   └── (everything)                       # UNCHANGED — must render byte-identical after this feature
│   │   └── common/
│   │       └── constants.tsx                     # UNCHANGED — createFontStack still emits `${font}, sans-serif` (csforall consumer)
│   ├── components/
│   │   ├── contentful/
│   │   │   ├── heading/
│   │   │   │   ├── Heading.tsx                   # MODIFIED — remove clamp() table, hardcoded `font-family: 'Space Grotesk'`, `lineHeight: 1` default; inherit from theme.typography.h{1-6} variants; override props preserved
│   │   │   │   ├── HeadingContentfulDefinition.ts # UNCHANGED — no schema delta
│   │   │   │   └── __tests__/                    # MODIFIED — new tests for canonical default per level, legacy enum mapping, override precedence
│   │   │   ├── paragraph/
│   │   │   │   ├── Paragraph.tsx                 # MODIFIED — `isStrong: true` weight changes from hardcoded 600 to a Semibold token reference (semantically identical numeric value, future-proof for ladder rename)
│   │   │   │   └── __tests__/                    # MODIFIED — verify body default = Text Md Medium / canonical
│   │   │   ├── richText/
│   │   │   │   ├── RichText.tsx                  # UNCHANGED OR MINIMAL — composes Heading + Paragraph; verify no parallel typography styling
│   │   │   │   ├── richTextStyles.ts             # UNCHANGED OR MINIMAL — spacing utility only
│   │   │   │   └── __tests__/                    # MODIFIED — verify inline h1–h6 + p resolve through canonical defaults
│   │   │   ├── link/
│   │   │   │   ├── Link.tsx                      # UNCHANGED — already routes through MUI theme overrides per spec 008
│   │   │   │   └── (verification only)
│   │   │   └── corporateSite/
│   │   │       ├── heroBanner/
│   │   │       │   └── (path tbd in research.md) # MODIFIED — title/body type routes through theme variants; existing semantic tag preserved
│   │   │       ├── yourSchool/
│   │   │       │   └── yourSchool.module.scss    # MODIFIED — font-size 2rem / 1.25rem / 0.875rem → scale tokens via shared SCSS vars
│   │   │       ├── adoptionMap/
│   │   │       │   └── adoptionMap.module.scss   # MODIFIED — font-size 0.75rem → smallest scale cell ≥ 1rem (sub-1rem clamps to 1rem per FR-015)
│   │   │       └── afeEligibility/
│   │   │           └── afeEligibility.module.scss # MODIFIED — font-size 1rem / 0.625rem → scale tokens (0.625rem clamps to 1rem)
│   │   └── common/
│   │       └── (unchanged)
│   └── (no other apps/marketing changes)

packages/component-library-styles/
├── typography.module.scss                        # MODIFIED — extend :root vars to full 8-token scale (text-{xs..4xl} + display-{xs..4xl}); existing --font-size-body-{xs,sm,md,lg} retained with same resolved values for back-compat; add @mixin display-{xs..4xl} mirroring the existing heading-{xxl..xs} pattern for non-MUI consumers
├── font.scss                                     # UNCHANGED — $noto-sans-fonts list and weight mixins already canonical
├── primitiveColors.scss                          # UNCHANGED
├── colors.scss                                   # UNCHANGED
├── variables.scss                                # UNCHANGED
└── mixins.scss                                   # UNCHANGED

packages/fonts/                                   # UNCHANGED — FONT_FAMILY_NAMES, locale resolver, and @font-face declarations are correct as-is

apps/marketing-storybook/
└── stories/
    ├── Heading.story.tsx                         # MODIFIED — per-level default matrix + override matrix; responsive ladder story added
    ├── Paragraph.story.tsx                       # MODIFIED — variant matrix verified at new defaults
    ├── RichText.story.tsx                        # MODIFIED — mixed h1–h6 + p + inline link story; verify canonical resolution
    └── HeroBanner.story.tsx OR equivalent        # MODIFIED — references canonical H1 token (no separate story file needed if Hero Banner already has Storybook coverage; otherwise add minimal default+responsive story per FR-021)

apps/design-system-storybook/                     # UNCHANGED — no design-system primitives touched
```

**Structure Decision**: The feature touches three layers:

1. **Code.org theme** (`apps/marketing/src/themes/code.org/`) — the canonical role-token surface. A new `typography/` subdirectory holds the token grid, the font-stack helper, and the variant builder. `index.ts` calls the builder and registers `cssVariables: true` (already on). This is the single source of truth that FR-020 / SC-010 demand.
2. **Component consumers** (`Heading.tsx`, `Paragraph.tsx`, Rich Text, deprecated corporate-site components) — refactored to inherit canonical defaults from `theme.typography` variants and the MUI-emitted CSS variables. Override surfaces stay where they are.
3. **Shared SCSS primitives** (`packages/component-library-styles/typography.module.scss`) — additively extended so non-MUI consumers (deprecated components' SCSS modules, any hardcoded `var(--font-size-*)` usage) read the same scale values via CSS variables. Existing variable names keep their existing resolved values.

Three things to be aware of for `/speckit.tasks`:

- **Order matters**: the token module + theme rewrite (US1) MUST land before the deprecated-component migrations (US2), because the deprecated SCSS migrations consume CSS variables emitted by the theme.
- **CSforAll byte-identity is the riskiest verification**: every shared file change (typography.module.scss, font.scss-imports, common/constants.tsx if it grows a code.org-specific helper colocated there) must be visually diff'd on csforall stories with zero pixel deltas before merge. The Applitools baseline acceptance for csforall stories is the gate.
- **The 4-weight Studio ladder (Heading.fontWeight enum widening to Regular / Medium / Semibold / Bold) is deferred**, not in scope here. Authors retain Medium / Bold via Studio; the 4-weight ladder is exposed in the TS / Storybook layer for engineering / design use until a follow-up spec widens the Contentful enum (which IS a schema delta requiring MCP confirmation).

## Complexity Tracking

> No Constitution Check violations — this section intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _(none)_  | _(none)_   | _(none)_                             |
