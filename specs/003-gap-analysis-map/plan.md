# Implementation Plan: Interactive Gap Analysis Map

**Branch**: `003-gap-analysis-map` | **Date**: 2026-04-01 | **Spec**: [spec.md](/var/home/sliang/git-workspaces/marketing-sites/specs/003-gap-analysis-map/spec.md)
**Input**: Feature specification from `/specs/003-gap-analysis-map/spec.md`

## Summary

Add a standalone, state-by-state US gap analysis map to the advocacy experience as a server-rendered page section with a tightly scoped client interaction island. The implementation should use a structured local dataset plus a vetted React US map package with explicit East Coast small-state selectability and Alaska/Hawaii West Coast inset placement, avoiding new hot-path runtime dependencies while preserving existing cache, SEO, privacy, and SSR behavior.

## Technical Context

**Language/Version**: TypeScript with React 18 on Next.js 15  
**Primary Dependencies**: Next.js App Router, MUI, existing marketing app testing stack, vetted npm React US map package, repo-managed data  
**Storage**: Repo-managed structured data file; no runtime persistence  
**Contentful Data Model**: No Contentful change needed for v1  
**MUI / Legacy DS Plan**: Direct MUI implementation in the marketing layer; do not expand deprecated legacy design-system usage  
**SEO / Indexing Plan**: Existing page metadata, canonical, indexing, and sitemap behavior unchanged  
**Testing**: Jest + Testing Library for interaction/state logic, marketing Storybook stories for visual and accessibility review, focused Playwright coverage only if page-level interaction regression risk warrants it  
**Target Platform**: Public marketing web experience in modern desktop and touch browsers  
**Project Type**: Multi-tenant Next.js marketing web app  
**Performance Goals**: Near-instant hover-to-panel feedback, no new hot-path network dependency, minimal client bundle impact relative to existing marketing page standards  
**Constraints**: Preserve SWR/SIE cache semantics for the containing page, keep client boundary narrow, support `data-theme` inheritance, maintain WCAG AA, keep small states individually selectable, keep Alaska/Hawaii visible via inset placement  
**Scale/Scope**: One higher-level marketing component, one structured dataset covering 50 states plus Washington, D.C., Storybook coverage, focused automated tests, and one public advocacy page integration

## Implementation Conventions

- Match established `corporateSite` component structure: `StateGapMap.tsx` as the feature entry point, `StateGapMapContentfulDefinition.ts` for Contentful metadata, `index.ts` for exports, and helper modules named by responsibility rather than by repeated feature prefix.
- Prefer React props and MUI interaction utilities for hover, lock, and reset behavior. If the selected map package still requires DOM annotation to add accessibility semantics, keep that code isolated to the renderer wrapper and avoid raw global `document` listeners.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**: Pass. The plan keeps the feature on a cacheable public page without adding a per-request API or tokenized runtime map dependency. No new logging, analytics, consent, or telemetry is required for v1. No new personal data, Student Records, or FERPA-sensitive data is introduced; the feature only renders aggregate public metrics and visitor-initiated links to already public state assets.
- **Shared System First And SSR By Default**: Pass. Affected workspaces are [`apps/marketing`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing) and [`apps/marketing-storybook`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing-storybook). The feature remains a higher-level marketing component rather than a shared atomic primitive. The page shell and data composition stay server-rendered; only the interactive map and floating panel behavior use a client boundary. The implementation will use direct MUI composition and will not add more legacy design-system dependency.
- **WCAG AA And Layered Storybook UX**: Pass. The feature belongs in higher-level marketing Storybook, with stories covering default, hover/locked, missing-data, East Coast small-state, Alaska/Hawaii inset, and theme inheritance scenarios. WCAG AA expectations include keyboard operability, screen-reader labeling, focus visibility, contrast on light/dark inherited themes, and non-hover access to state details.
- **Quality Gates Are Release Gates**: Pass. Minimum validation set: lint, typecheck, focused Jest coverage for selection/locking/reset/data fallback behavior, marketing Storybook stories with interaction review, and the marketing Storybook CI path. Add Playwright only for page-level verification of the integrated experience if needed to protect against regression in the existing advocacy page embedding.
- **Spec-Driven Incremental Delivery**: Pass. The feature can ship in slices: data contract and package-backed map rendering, interactive state selection and panel locking, then page integration and review coverage. Affected brand/runtime scope is the current Code.org advocacy experience only; locale impact is assumed unchanged for v1. No Contentful schema work is required for the initial repo-managed dataset approach, though component registration in the Code.org marketing runtime is still required. SEO, canonical, indexing, structured data, and sitemap behavior remain unchanged. No infrastructure sync points are expected because cache and revalidation policy are intentionally preserved.

## Project Structure

### Documentation (this feature)

```text
specs/003-gap-analysis-map/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── state-gap-data.schema.json
└── tasks.md
```

### Source Code (repository root)

```text
apps/marketing/
├── src/
│   ├── app/
│   ├── components/contentful/
│   │   └── corporateSite/
│   │       └── ...
│   └── components/
├── tests/e2e/
└── package.json

apps/marketing-storybook/
├── stories/
│   └── ...
└── package.json

packages/
└── component-library/  # unchanged unless a reusable primitive emerges during implementation
```

**Structure Decision**: Implement the feature as a higher-level marketing component in [`apps/marketing`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing), with review coverage in [`apps/marketing-storybook`](/var/home/sliang/git-workspaces/marketing-sites/apps/marketing-storybook). Keep shared packages unchanged unless implementation reveals a clearly reusable primitive that benefits other marketing surfaces.

## Complexity Tracking

No constitution violations or exceptional complexity require justification at planning time.

## Post-Design Constitution Re-Check

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**: Still passes after design. The proposed contract uses repo-managed structured data and a cache-friendly package renderer, so no new runtime fetch, cache policy change, consent change, or sensitive data handling was introduced.
- **Shared System First And SSR By Default**: Still passes after design. The design keeps the page server-rendered, limits client hydration to the interaction island, and keeps the work in the marketing layer with direct MUI composition.
- **WCAG AA And Layered Storybook UX**: Still passes after design. Storybook coverage is planned for theme inheritance, small-state targeting, inset placement, and fallback states, with WCAG AA expectations retained.
- **Quality Gates Are Release Gates**: Still passes after design. The artifacts define focused unit coverage, Storybook review, and optional page-level Playwright only where it adds integration confidence.
- **Spec-Driven Incremental Delivery**: Still passes after design. The work remains sliceable into data contract, interaction behavior, and integration/review steps, with no unresolved clarifications blocking implementation.
