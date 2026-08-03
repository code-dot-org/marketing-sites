# Implementation Plan: Icon Component

**Branch**: `dee/component-updates/icon` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-icon-component/spec.md`

## Summary

Add a new, standalone **Icon** Contentful component to `apps/marketing` that renders a single decorated Font Awesome icon. It reuses the existing `FontAwesomeV6Icon` primitive from `@code-dot-org/component-library` (no shared package change), the universal CodeAI brand color manifest in `apps/marketing/src/components/common/colors.ts`, the brand-icon detection map in `apps/marketing/src/components/common/constants.ts`, and the Section background context for contrast-switch resolution. The component introduces three Icon-specific concerns: a `backgroundFill` field (`none` / `filled` / `outline`), a `backgroundShape` field (`circle` / `square`), and one Icon-local `Light Grey` background option whose stored value is the literal hex `#f6f6f6` — confined to the Icon's `backgroundColor` field so it doesn't bleed into other components' color pickers. The icon glyph color uses `brandColorOptionsWithDefault('purplePrimary')` (matching Divider's order and default, minus the three legacy entries Divider tolerates) and routes through the contrast switch via `resolvedCssVarForBrandColor`, identical to Heading and Paragraph. Default icon size is 32 px (author-configurable); background outer size is a fixed `1.75 × iconSize` ratio with `25 %` corner radius for `square`; outer margin is zero. Registered for **code.org** only.

## Technical Context

**Language/Version**: TypeScript ~5.x, React 18, Next.js (existing marketing app)
**Primary Dependencies**: `@mui/material`, `@contentful/experiences-sdk-react`, `@code-dot-org/component-library` (existing `fontAwesomeV6Icon` export). No new third-party dependency.
**Storage**: N/A — read-only; consumes Contentful entries. No storage layer in this feature.
**Contentful Data Model**: **New type proposed** — content type `icon` with fields `iconName: Symbol`, `color: Symbol`, `backgroundFill: Symbol`, `backgroundShape: Symbol`, `backgroundColor: Symbol`, `iconSize: Number`. Type is human-applied via Contentful Studio UI (not by code), then re-read via Contentful MCP before merging the component code. No application-code Contentful writes.
**MUI / Legacy DS Plan**: Direct MUI implementation. Wrapper is a simple `<Box>` styled via `sx`; icon glyph is `FontAwesomeV6Icon`. No legacy design-system component is touched, kept, or migrated. Icon Highlight (the legacy `iconHighlight` component, category `10: Deprecated`) is left exactly as-is.
**SEO / Indexing Plan**: Existing Experience sitemap flow unchanged. No new metadata, structured data, canonical, or indexing behavior.
**Testing**: Jest + React Testing Library for unit tests (`apps/marketing/src/components/contentful/icon/__tests__/Icon.test.tsx`); Storybook stories in `apps/marketing-storybook/stories/Icon.story.tsx`; visual coverage via storybook-eyes (Applitools) — new baseline acceptance required in the dashboard (CI-only key) for the new story, consistent with `[[project_storybook_eyes_baseline_gate]]`.
**Target Platform**: Web (Next.js SSR), all viewports. Server-rendered only — no `"use client"` directive.
**Project Type**: Web application (Next.js marketing app + Storybook companion).
**Performance Goals**: No measurable impact on hot paths. Icon contributes at most one `<i>` plus an optional `<span>` per instance; no JS runtime cost (no hooks beyond `useSectionBackground`, no client-side fetch).
**Constraints**: Must remain SSR-only. Bundle delta MUST be < ~500 B gzipped. No new global SCSS. No new entry in the shared `BRAND_COLORS` manifest. Padding ratio / corner radius MUST be Icon-local constants. No outer margin contribution.
**Scale/Scope**: Targets the **code.org** tenant only (~one new Contentful component, used initially in incremental rebuild pages). csforall NOT registered.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**:
  No logging, metrics, traces, or analytics changes. No cache or revalidation changes — the component renders inside existing Contentful Experience pages whose cache headers remain untouched. No privacy, consent, or third-party data handling — no new outbound calls; Font Awesome is already loaded site-wide. No personal data, Student Records, or FERPA-adjacent flows. No availability or performance hit on hot paths (component is static markup). Privacy review not required (no new data surface). **PASS.**

- **Shared System First And SSR By Default**:
  Affected workspaces: `apps/marketing` (component source + Contentful registration) and `apps/marketing-storybook` (story). No `packages/*` change required — the new Icon composes the existing `@code-dot-org/component-library/fontAwesomeV6Icon` export. Shared-system reuse: the universal `BRAND_COLORS` manifest, `brandColorOptionsWithDefault`, `cssVarForBrandColor` / `resolvedCssVarForBrandColor`, `useSectionBackground`, and `fontAwesomeV6BrandIconsMap` are all reused without modification. No new duplication, no brand-specific fork. SSR-only: no `"use client"`, no browser-only dependency, no hydration cost. MUI: direct MUI (`Box` wrapper). No deprecated legacy design-system surface is taken on or expanded by this feature. **PASS.**

- **WCAG AA And Layered Storybook UX**:
  Atomic-level marketing component → review surface is `apps/marketing-storybook`. Stories enumerated in spec FR-020 cover the eight required configurations. Accessibility expectations: icon is decorative by default — no `title`, no `aria-label`, and the wrapper has no role. The icon glyph color routes through the existing contrast switch so the same readability guarantees text gets apply to icon glyphs on light/dark Section backgrounds. Layout stability across hover/selected/locked: N/A — the component has no interactive states. **PASS.**

- **Quality Gates Are Release Gates**:
  Required gates for this change:

  - **Lint + typecheck**: `yarn lint`, `yarn typecheck` on `apps/marketing`.
  - **Unit tests**: Jest tests under `apps/marketing/src/components/contentful/icon/__tests__/Icon.test.tsx` covering FR-021.
  - **Storybook coverage**: New `apps/marketing-storybook/stories/Icon.story.tsx` covering the eight configurations in FR-020.
  - **storybook-eyes**: New visual baselines must be **accepted** in the Applitools dashboard (CI-only key). This is a manual baseline-acceptance step, not a code fix (see `[[project_storybook_eyes_baseline_gate]]`).
  - **Prettier**: Run `yarn prettier` on touched files before commit (`[[feedback_run_prettier_before_commit]]`).
    No integration / Playwright coverage is added — the Icon is a leaf atomic component with no caching, redirect, consent, analytics, or CMS integration concern beyond the existing Contentful registration plumbing, which other components in the same registration file already exercise. **PASS.**

- **Spec-Driven Incremental Delivery**:
  User stories in spec.md are independently testable: US1 (bare icon) is shippable alone; US2 (filled background) builds on US1; US3 (outline) is a single-line variant of US2. Affected brands: code.org only (csforall is deprecated and not registered). Locales: none (no text content). Contentful: new content type `icon` MUST be created via Contentful Studio UI by a human; the schema shape is proposed in `contracts/contentful-icon-content-type.md` (this plan), then re-read via Contentful MCP before the component is merged. No application-code Contentful writes. SEO/sitemap: existing Experience sitemap flow unchanged. **PASS.**

**Result**: All five core principles pass. **No constitutional violations to justify.**

## Project Structure

### Documentation (this feature)

```text
specs/007-icon-component/
├── plan.md                                          # This file
├── spec.md                                          # Feature spec
├── research.md                                      # Phase 0 output (this command)
├── data-model.md                                    # Phase 1 output (this command)
├── quickstart.md                                    # Phase 1 output (this command)
├── contracts/
│   ├── icon-component-props.md                      # Props/Contentful field contract
│   └── contentful-icon-content-type.md              # Content-type proposal for human-applied creation
└── checklists/
    └── requirements.md                              # Spec quality checklist (already created)
```

### Source Code (repository root)

```text
apps/marketing/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── colors.ts                            # READ-ONLY — reused
│   │   │   └── constants.ts                         # READ-ONLY — reused (fontAwesomeV6BrandIconsMap)
│   │   └── contentful/
│   │       ├── icon/                                # NEW
│   │       │   ├── Icon.tsx
│   │       │   ├── iconContentfulDefinition.ts
│   │       │   ├── index.ts
│   │       │   └── __tests__/
│   │       │       └── Icon.test.tsx
│   │       ├── iconHighlight/                        # READ-ONLY — UNCHANGED
│   │       └── section/SectionBackgroundContext.tsx  # READ-ONLY — reused
│   └── contentful/
│       └── registration/
│           ├── code.org/index.ts                    # MODIFIED — register new Icon component
│           └── csforall/                            # NOT MODIFIED
└── ...

apps/marketing-storybook/
└── stories/
    └── Icon.story.tsx                                # NEW
```

**Structure Decision**: This feature lives entirely in `apps/marketing` (the new Icon component and its Contentful registration) and `apps/marketing-storybook` (the story). No shared-package change in `packages/*` is required, because the existing `@code-dot-org/component-library/fontAwesomeV6Icon` export already provides the icon-rendering primitive. The new Icon is a Contentful-driven higher-level marketing component, which the constitution places in `apps/marketing` rather than the shared design-system packages.

## Complexity Tracking

> No Constitution Check violations — this section intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _(none)_  | _(none)_   | _(none)_                             |
