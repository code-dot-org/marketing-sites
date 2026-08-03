# Implementation Plan: Brand Buttons & Brand Text Link

**Branch**: `008-brand-buttons` | **Date**: 2026-06-22 (re-planned post-clarify) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-brand-buttons/spec.md` (updated 2026-06-22 with Text Link in scope + Figma-final tokens)
**Tokens**: [figma-tokens.md](./figma-tokens.md) — authoritative per-cell color and per-size grid extracted from Figma; consumed verbatim by SCSS

## Summary

Replace the code.org **Button** and **Text Link** visuals and capability surfaces with the new CodeAI Brand specification from Figma file `Aw6YXqpx6QFlNMXqCKk60e`, component set `Brand Buttons` node `7:3976`. Two shared primitives are touched in place:

1. **Button** — `packages/component-library/src/button/` (`Button`/`LinkButton`/`GenericButton` re-skinned and prop-expanded to the 4-size × 9-cell × 5-state × 2-icon-only Brand matrix) plus `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/` (Contentful **Experiences ComponentDefinition** with exported id `button` — code-side; not a Contentful content type). The Component Definition's `variables.style` group is extended with new Design-tab options (`size`, `iconRightName`, `isIconOnly`; `type` enum expanded to include `tertiary`). The Content-tab variables (`text`, `href`, `isLinkExternal`, `ariaLabel`) are unchanged and continue to bind to Link content-type entries as today. **No Contentful Studio schema work is needed for Button.**
2. **Text Link** — `apps/marketing/src/components/contentful/link/Link.tsx` (Contentful id `link`). Re-skinned to the 3-Hierarchy (`color`/`black`/`white`) × 3-size (`s`/`m`/`l`) × 5-state Brand Link matrix. Because the same component renders on both tenants today, the implementation isolates the rebrand to code.org by **(a)** moving per-Hierarchy styling into tenant MUI `styleOverrides` (`apps/marketing/src/themes/code.org/styleOverrides/link.ts` gains Brand Link rules; `apps/marketing/src/themes/csforall/styleOverrides/link.ts` keeps current behavior) and **(b)** registering per-tenant `validations.in` for the `color` field in each tenant's Contentful registration (code.org narrows to 3 Hierarchies; csforall keeps the existing 22-color palette). The Link.tsx component itself becomes theme-aware: it consumes per-Hierarchy color from the active MUI theme instead of hard-coding `sx`. Existing code.org `link` entries are auto-mapped at render time (`primary` → `color`; `default` → `black`; `white` → `white`; other 19 brand colors → `color` fallback). See **R12** below.

The Figma per-state token grid is **final** (no placeholders): the SCSS module lands the exact hex values from `figma-tokens.md` as new CSS custom properties under `packages/component-library-styles/buttonColors.scss` (new file). The `gray` Button color is fully removed (one one-line `Video.tsx` consumer migrates to `color="black"`); `destructive` is preserved as a clearly-segregated legacy variant for `ContentEditorHelper.tsx`. CSforAll's Button registration (`button-mui`) is unchanged.

## Technical Context

**Language/Version**: TypeScript ~5.x, React 18, Next.js (existing marketing app), SCSS modules + MUI theme overrides for component styling.
**Primary Dependencies**: `@mui/material`, `@contentful/experiences-sdk-react`, `@code-dot-org/component-library` (this feature updates `button` exports and their dependencies), `@code-dot-org/component-library-styles` (adds `$button-border-radius` SCSS var + new `buttonColors.scss` CSS-vars file). No new third-party dependency.
**Storage**: N/A — read-only Contentful entries.
**Contentful Data Model**: **No Contentful content-type changes.** All "schema" updates land in code-side Component Definition `variables` objects exported from `apps/marketing/src/components/contentful/.../*ContentfulDefinition.ts`. Two definitions are updated:

- `ButtonLegacyContentfulComponentDefinition` (exported component id `button`) — Design-tab variables expanded with new `size`, `iconRightName`, `isIconOnly`; `type` enum expanded to include `tertiary`. **There is no `button` content type in Contentful** — Buttons are composed components living inside Experience entries.
- `LinkContentfulDefinition.ts` exports two factories — `BrandLinkContentfulComponentDefinition` (code.org, 3 Hierarchies + 3 sizes) and `LegacyLinkContentfulComponentDefinition` (csforall, 22 colors + 4 sizes) — both producing definitions with exported id `link`. The `link` Contentful content type (used by authors to create reusable Link entries that bind into Buttons and Text Links) is **not touched**.
- **Zero Contentful Studio steps. Zero `ctf_get_content_type` MCP re-read.** Studio editors immediately see the new Design-tab options after deploy.

**MUI / Legacy DS Plan**: Direct MUI. Button uses the shared in-house design-system component (`packages/component-library`); Text Link uses MUI `Link` directly as today. **New for this feature**: Link.tsx's hard-coded `sx` is moved into per-tenant `MuiLink` `styleOverrides` so the tenant theme drives per-Hierarchy visuals. This matches how Button is themed today (`themes/code.org/styleOverrides/button.ts` exists). No legacy DS migration; no new styling library.
**SEO / Indexing Plan**: Existing Experience sitemap flow unchanged. No new metadata, structured data, canonical, or indexing behavior.
**Testing**: Jest + React Testing Library for unit tests (`packages/component-library/src/button/__tests__/`, `apps/marketing/src/components/contentful/link/__tests__/`); Storybook stories in `apps/design-system-storybook` (button primitives) and `apps/marketing-storybook` (Link composition + tenant-themed previews); visual coverage via storybook-eyes (Applitools) — every Button-adjacent AND Text-Link-adjacent story will diff post-merge and requires baseline re-acceptance per `[[project_storybook_eyes_baseline_gate]]`.
**Target Platform**: Web (Next.js SSR), all viewports. Server-rendered only — no `"use client"` directive added. Existing `forwardRef` API on Button preserved.
**Project Type**: Web application (Next.js marketing app + design-system + Storybook companions).
**Performance Goals**: No measurable impact on hot paths. Both primitives remain static markup; no new JS runtime cost.
**Constraints**: MUST remain SSR-only. Bundle delta MUST be ≤ ~2 KB gzipped across both primitives (the SCSS grows with the per-state grid; the TSX stays small). MUST NOT change the public Contentful ids `button` or `link`. MUST NOT touch the CSforAll Button registration. MUST NOT route Button color through the contrast switch. Text Link MUST route only `color` and `black` Hierarchies through the contrast switch; `white` MUST NOT switch. The `gray` Button color is fully removed (one one-line `Video.tsx` consumer migrated to `color="black"` in the same PR). The new CSS custom properties MUST be the exact hex values from `figma-tokens.md` — no placeholder fallbacks to the universal brand-color manifest.
**Scale/Scope**: Targets the **code.org** tenant only for both Brand visual treatments. The shared Button package is reused across the repo, so the visual change reaches every direct in-code consumer too — intentional (Story 4 in the spec). CSforAll continues to render its current Button (via `button-mui`) and its current Text Link (via the csforall MUI theme override that does not adopt the Brand rules).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**:
  No logging, metrics, traces, or analytics changes. No cache or revalidation changes — both primitives render inside existing Contentful Experience pages whose cache headers remain untouched. No new third-party data flow. No personal data, Student Records, or FERPA-adjacent concerns. The existing `analyticsCallback` prop on `LinkButton` is preserved unchanged. The `target="_blank"` + `rel="noopener noreferrer"` security guardrail for external links is preserved on both Button and Text Link. **PASS.**

- **Shared System First And SSR By Default**:
  Affected workspaces:

  - `packages/component-library/src/button/` — updated in place (Button.tsx, LinkButton.tsx, GenericButton.tsx, types.ts, genericButton.module.scss, stories/, \_\_tests\_\_/).
  - `packages/component-library/src/video/Video.tsx` — one-line migration (`color="gray" size="xs"` → `color="black" size="s"`).
  - `packages/component-library-styles/` — new `buttonColors.scss` (CSS custom properties for the Figma-final color grid), new SCSS variable `$button-border-radius` in `variables.scss`.
  - `apps/marketing/src/components/contentful/corporateSite/buttonLegacy/` — schema expansion + wrapper updates.
  - `apps/marketing/src/components/contentful/link/Link.tsx` — refactored to consume per-Hierarchy styling from MUI theme overrides instead of hardcoded `sx`; added render-time auto-mapping of legacy color values to the 3 Hierarchies (only when on code.org tenant).
  - `apps/marketing/src/themes/code.org/styleOverrides/link.ts` — **new** file. Adds per-Hierarchy `MuiLink` style rules per the figma-tokens grid.
  - `apps/marketing/src/themes/csforall/styleOverrides/link.ts` — **new** file. Holds the legacy Link styling (extracted from today's hardcoded `sx`) so csforall renders byte-identical visuals after the Link.tsx refactor.
  - `apps/marketing/src/contentful/registration/code.org/index.ts` — extends `LinkContentfulComponentDefinition` import to declare a code.org-specific `color` enum (3 Hierarchies); Button registration import path may update if files are renamed.
  - `apps/marketing/src/contentful/registration/csforall/index.ts` — registers the same `LinkContentfulComponentDefinition` but with the existing 22-color enum; Button registration (`button-mui`) UNCHANGED.
  - `apps/design-system-storybook` and `apps/marketing-storybook` — Button + Text Link stories updated and storybook-eyes baselines re-accepted.
  - Direct in-code consumers (e.g. `apps/marketing/src/components/contentful/video/`, `corporateSite/{adoptionMap,afeEligibility,yourSchool}/`, `contentEditorHelper/`) — props swept for size-scale rename where applicable.
    Shared-system reuse: this is the canonical "update the shared package + per-tenant theme override" pattern. Button reuses the existing in-house shared design-system primitive; Text Link reuses the existing Link wrapper but moves per-tenant variation into MUI theme overrides (the established repo pattern for tenant-specific component styling). No parallel `BrandButton` or `BrandTextLink` component is created. CSforAll continues to render via theme-overridden Link (current visuals) and the separate `button-mui` registration.
    SSR-only: no `"use client"`, no browser-only dependency, no hydration cost.
    MUI / Legacy DS plan: this feature updates the in-house shared design-system Button + the MUI-based shared Text Link, not a deprecated legacy DS component. Text Link's refactor from hardcoded `sx` → tenant `styleOverrides` is a contained, low-risk MUI-pattern improvement that matches how Button is themed today. **PASS.**

- **WCAG AA And Layered Storybook UX**:
  Atomic-level shared design-system Button → primary review surface is `apps/design-system-storybook` (Button stories). Text Link is a higher-level Contentful-driven component → primary review surface is `apps/marketing-storybook`. Stories enumerated in spec FR-020 (Button) + FR-040 (Text Link) cover the full matrices, the 5 states, the asymmetric Hover behavior on Links, and the tenant-themed visual differences.
  Accessibility expectations: focus ring is the same Focus Blue (`#0A84FF`) `2px` outer ring across both primitives (single shared `--button-focus-ring` CSS variable); disabled Button sets both `disabled` and `aria-disabled="true"`; icon-only Button requires `ariaLabel` (dev warning when missing); Text Link Disabled state preserves the existing `aria-disabled="true"` pattern from the current Link.tsx. Layout stability across hover/focus/disabled/loading preserved (no padding shifts between states). Localized-content resilience preserved (icon-only Button has min-width; with-text Button + Text Link grow with translated labels). **PASS.**

- **Quality Gates Are Release Gates**:
  Required gates:

  - **Lint + typecheck**: `yarn lint`, `yarn typecheck` on `packages/component-library`, `packages/component-library-styles`, `apps/marketing`.
  - **Unit tests**: Jest tests under `packages/component-library/src/button/__tests__/` (per spec FR-021) and `apps/marketing/src/components/contentful/link/__tests__/` (per spec FR-041 — covers auto-mapping, contrast-switch per Hierarchy, asymmetric Hover, Loading state).
  - **Storybook coverage**: Button stories in `packages/component-library/src/button/stories/` updated for the new variant matrix (FR-020); Text Link story `apps/marketing-storybook/stories/Link.story.tsx` updated for the new Hierarchy × size × state matrix + tenant-theme switcher (FR-040).
  - **Visual gate (storybook-eyes / Applitools)**: Every Button-adjacent AND Text-Link-adjacent story will visual-diff. Both primitives' baselines MUST be re-accepted in the Applitools dashboard (CI-only key) — manual baseline acceptance, not a code fix.
  - **Prettier**: `yarn prettier` on touched files before commit.
  - **No integration / Playwright coverage** added — both primitives are leaf presentational components with no caching, redirect, consent, analytics, or CMS integration concern beyond the existing registration plumbing.
  - **Design-system Storybook CI path** MUST pass before marketing-layer work is treated as done (constitution IV).
    **PASS.**

- **Spec-Driven Incremental Delivery**:
  User stories in spec.md are independently deliverable:
  - US1 (Button variant matrix in Storybook) is the Button foundation, shippable alone.
  - US2 (Button zero-touch migration of existing instances) ships once US1 lands plus the Component Definition variable expansion (code edit in T020) deploys.
  - US3 (Button new author-facing fields) is purely additive on the Component Definition's `variables.style` group — Studio editors see the new options automatically after deploy.
  - US4 (Button direct in-code consumers re-render) requires the one-line Video.tsx sweep; ships with the same merge.
  - US5 (Text Link variant matrix in Storybook) is the Text Link foundation, independently shippable from Button (separate primitive, separate file paths, separate theme override).
  - US6 (Text Link existing entries auto-render) ships once US5 lands; requires no entry-side work and **no Contentful schema change** (per R12).
    Affected brands: **code.org** for new Brand visuals; **csforall byte-identical** for both primitives (Button via separate `button-mui` registration; Text Link via tenant-themed Link.tsx that picks up the csforall styleOverrides which encode current behavior).
    Locales: none — both primitives accept labels from existing Contentful text fields; localization unchanged.
    Contentful: **no content-type schema changes for either Button or Text Link.** The "Button schema" is actually a code-side Component Definition (`ButtonLegacyContentfulComponentDefinition.variables`) — extended in code per `contracts/contentful-button-content-type-update.md` (filename retained for continuity but the contract is a code-edit recipe, not a Studio recipe). The Text Link work is similarly code-side per `contracts/contentful-link-content-type-update.md` (per-tenant ComponentDefinition factories, no Studio change). The `link` Contentful content type is read-only for this feature.
    SEO/sitemap: existing Experience sitemap flow unchanged.
    Infrastructure sync: none. **PASS.**

**Result**: All five core principles pass. **No constitutional violations to justify.**

## Project Structure

### Documentation (this feature)

```text
specs/008-brand-buttons/
├── plan.md                                          # This file
├── spec.md                                          # Feature spec (updated post-clarify)
├── research.md                                      # Phase 0 output (this command, re-written)
├── data-model.md                                    # Phase 1 output (this command, re-written)
├── quickstart.md                                    # Phase 1 output (this command, re-written)
├── figma-tokens.md                                  # Authoritative per-cell + per-size token grid (created in /speckit.clarify)
├── contracts/
│   ├── button-component-props.md                    # React API contract for Button/LinkButton/GenericButton
│   ├── contentful-button-content-type-update.md     # ComponentDefinition variables update for `button` (code edit only — no Studio steps)
│   ├── text-link-component-props.md                 # NEW — React API contract for the refactored Link + per-tenant theme override shape
│   └── contentful-link-content-type-update.md       # NEW — per-tenant ComponentDefinition factory delta for `link` (code edit only — no Studio steps)
└── checklists/
    └── requirements.md                              # Spec quality checklist
```

### Source Code (repository root)

```text
packages/component-library/
├── src/
│   ├── button/
│   │   ├── Button.tsx                               # MODIFIED — color enum trimmed (gray removed; destructive retained)
│   │   ├── LinkButton.tsx                           # MODIFIED — same as Button
│   │   ├── GenericButton.tsx                        # MODIFIED — size scale renamed (xs→removed, xl→added); checkButtonPropsForErrors trimmed (gray throw + purple-secondary warning removed)
│   │   ├── types.ts                                 # MODIFIED — ButtonColor: 'purple' | 'black' | 'white' | 'destructive'; new local ButtonSize: 's' | 'm' | 'l' | 'xl'
│   │   ├── genericButton.module.scss                # REWRITTEN — Brand Button rules from figma-tokens.md per cell × state; destructive segregated with comment block; gray rules removed
│   │   ├── stories/
│   │   │   ├── Button.story.tsx                     # MODIFIED — new size/type/color matrix; xs removed
│   │   │   ├── LinkButton.story.tsx                 # MODIFIED — same + external-link story
│   │   │   └── GenericButton.story.tsx              # MODIFIED — same
│   │   └── __tests__/
│   │       ├── Button.test.tsx                      # MODIFIED — gray-throw + purple-secondary-warning removed; new size/type/color/state tests
│   │       ├── LinkButton.test.tsx                  # MODIFIED — same
│   │       ├── GenericButton.test.tsx               # MODIFIED — same
│   │       └── _BaseButton.test.tsx                 # MODIFIED — same
│   └── video/Video.tsx                              # MODIFIED — `color="gray" size="xs"` → `color="black" size="s"`

packages/component-library-styles/
├── variables.scss                                   # MODIFIED — add $button-border-radius: 0.5rem (consumed by genericButton.module.scss)
├── primitiveColors.scss                             # UNCHANGED — existing brand-color CSS vars stay; Brand Button vars land in a sibling file
└── buttonColors.scss                                # NEW — Figma-final CSS custom properties: --button-color-purple-primary, --button-color-purple-hover, --button-color-purple-dark, --button-color-purple-light, --button-color-purple-tint, --button-color-black, --button-color-white, --button-color-white-alpha-20, --button-color-disabled-dark, --button-color-link-disabled, --button-color-disabled-light, --button-color-disabled-bg, --button-focus-ring (see figma-tokens.md palette table). Imported by both genericButton.module.scss and the new themes/code.org/styleOverrides/link.ts.

apps/marketing/
├── src/
│   ├── components/
│   │   ├── contentful/
│   │   │   ├── corporateSite/
│   │   │   │   └── buttonLegacy/                    # MODIFIED — directory name preserved (Contentful id `button` unchanged)
│   │   │   │       ├── ButtonLegacy.tsx             # MODIFIED — wrapper passes through size, type (incl. tertiary), iconRightName, isIconOnly; external-link icon precedence per FR-019 (author right icon wins)
│   │   │   │       └── ButtonLegacyContentfulDefinition.ts  # MODIFIED — schema expanded per FR-013
│   │   │   ├── link/                                # MODIFIED — Link.tsx becomes theme-aware
│   │   │   │   ├── Link.tsx                         # MODIFIED — read per-Hierarchy color from MUI theme via theme.components.MuiLink.styleOverrides (instead of hardcoded sx); add render-time auto-mapping of legacy color values to 3 Hierarchies; preserve contrast-switch behavior for `color` and `black` (off for `white`)
│   │   │   │   ├── LinkContentfulDefinition.ts      # MODIFIED — exports two factories: brandLinkValidations() (3 Hierarchies, code.org) and legacyLinkValidations() (22-color enum, csforall) so each tenant registration declares its own variations
│   │   │   │   └── __tests__/                       # MODIFIED — auto-mapping + per-Hierarchy contrast + asymmetric Hover tests
│   │   │   ├── richText/RichText.tsx                # UNCHANGED — composes Link from '@/components/contentful/link' which remains the same import path
│   │   │   └── contentEditorHelper/                 # UNCHANGED — destructive Button color retained
│   │   └── common/colors.ts                         # READ-ONLY — universal brand palette still used by Text Link's contrast-switch (NOT by Brand Buttons)
│   ├── themes/
│   │   ├── code.org/
│   │   │   └── styleOverrides/
│   │   │       ├── button.ts                        # UNCHANGED (the existing MUI Button overrides are for csforall-style MUI buttons; the new Brand Button styling lives in genericButton.module.scss)
│   │   │       └── link.ts                          # NEW — MuiLink.styleOverrides with per-Hierarchy rules sourced from figma-tokens.md
│   │   └── csforall/
│   │       └── styleOverrides/
│   │           ├── button.ts                        # UNCHANGED
│   │           └── link.ts                          # NEW — encodes the legacy Link styling (extracted from today's hardcoded sx in Link.tsx) so csforall renders byte-identical visuals after Link.tsx is refactored
│   └── contentful/
│       └── registration/
│           ├── code.org/index.ts                    # MODIFIED — Link registration uses brandLinkValidations() (3 Hierarchies); Button registration may update import path if files renamed
│           └── csforall/index.ts                    # MODIFIED — Link registration uses legacyLinkValidations() (22-color enum, identical to today); Button registration UNCHANGED (still uses `button-mui` id)

apps/design-system-storybook/                        # READ-ONLY (auto-picks up updated stories from component-library)

apps/marketing-storybook/
└── stories/
    ├── Button.story.tsx                             # UNCHANGED — CSforAll MUI button story; CSforAll not in scope for Brand Button
    └── Link.story.tsx                               # MODIFIED — exercise the 3-Hierarchy × 3-size × 5-state matrix; tenant-theme switcher story to show code.org Brand vs csforall legacy visuals; asymmetric Hover stories; external-link story
```

**Structure Decision**: The feature touches three layers:

1. **Shared design-system Button primitive** (`packages/component-library/src/button/`) — the Brand Button rules land in the SCSS module and are tenant-agnostic at the component level. CSforAll keeps its own `button-mui` registration, so CSforAll users never see the shared `Button` component.
2. **Shared MUI-based Text Link** (`apps/marketing/src/components/contentful/link/Link.tsx`) — refactored to be theme-aware. Per-Hierarchy color and per-state behavior move into `MuiLink.styleOverrides` per tenant. CSforAll gets a new `themes/csforall/styleOverrides/link.ts` that encodes today's visuals (byte-identical to current); code.org gets a new `themes/code.org/styleOverrides/link.ts` with the Figma Brand Link rules. The Link component itself remains in the same path so `RichText.tsx` and direct callers don't change imports.
3. **Per-tenant Contentful registration overrides** — code.org's `link` ComponentDefinition declares a narrower `color` enum (3 Hierarchies); csforall's declares the existing 22-color enum. This isolates Studio editor experience per tenant without changing the underlying Contentful content type.

Three things to be aware of for `/speckit.tasks`:

- The Link.tsx refactor is the riskiest piece because every existing csforall `link` entry MUST render visually unchanged. Story 5/6 acceptance tests against csforall preview pages are mandatory before merge.
- The Brand Button SCSS rewrite is mechanical once `figma-tokens.md` is consumed — the per-cell rules map 1:1 to the table rows.
- The `gray`/`xs` sweep is two files (Video.tsx + three Button storybook stories) — tiny.

## Complexity Tracking

> No Constitution Check violations — this section intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _(none)_  | _(none)_   | _(none)_                             |
