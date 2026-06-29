# Implementation Plan: Custom Text component

**Branch**: `010-custom-text` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-custom-text/spec.md`

## Summary

Add a new marketing Contentful component, **Custom Text**, that renders any non-heading / non-body inline text element. Authors pick a **type** from a dropdown (Custom, Subtitle, Overline, Statistic, Course Topics, Course Labs); each type supplies a complete default style set. Authors may then override individual properties (text color, background color, border color, text size, font track, font weight, text transform, HTML tag, and a single leading/trailing icon) where each override replaces only its own dimension and leaves the remaining type defaults intact — the same precedence model already shipped in `resolveHeadingStyles`.

Technical approach reuses existing primitives end to end: MUI `Typography` with the `component` prop for the polymorphic tag (the repo's established pattern — there is no `as` prop), `resolveTextColorForBackground` / `resolvedCssVarForBrandColor` + `useSectionBackground` for contrast switching, the `SCALE_TEXT` / `SCALE_DISPLAY` token cells for sizing, the `CODE_ORG_TEXT_FONT_STACK` / `CODE_ORG_DISPLAY_FONT_STACK` font stacks, and `FontAwesomeV6Icon` for the optional icon. A pure `resolveCustomTextStyles` function layers type defaults → overrides → contrast/background rules and returns `{tag, sx, resolvedColor}` for the component to render. Background-style instances wrap the text in a `Box` with the background fill and a fixed **2px** border in the chosen border color (no width control). When a background is present the contrast switch is bypassed and the chosen color renders directly (mirrors `Icon`'s `backgroundFill === 'none'` branch).

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 (Next.js App Router)
**Primary Dependencies**: `@mui/material` (Typography, Box), `@contentful/experiences-sdk-react` (ComponentDefinition), `@code-dot-org/component-library/fontAwesomeV6Icon`; internal `@/components/common/colors`, `@/themes/code.org/typography/tokens`, `@/themes/code.org/typography/fontStack`, `@/components/contentful/section/SectionBackgroundContext`
**Storage**: N/A (presentational; content authored in Contentful)
**Contentful Data Model**: New component definition / content type proposed (`customText`). Registered for the code.org brand only. **Not yet confirmed via Contentful MCP** — MCP server is not connected in this planning session (see research.md R8); schema must be MCP-confirmed and human-applied before implementation.
**MUI / Legacy DS Plan**: Direct MUI implementation (Typography + Box). No legacy design-system component introduced. The pre-existing `Overline` component (legacy `overline--color-*` SCSS classes) is left untouched; the new "Overline" type reproduces its visual role token without depending on it.
**SEO / Indexing Plan**: Existing Experience-page flow unchanged. Inline text renders within already-indexed pages; no metadata, canonical, structured-data, or sitemap change.
**Testing**: Jest unit tests for `resolveCustomTextStyles` (type defaults, per-property override isolation, tag resolution incl. Subtitle `<p>` default, contrast vs. background bypass, icon-side precedence); Storybook stories in `apps/marketing-storybook` (each type, override matrix, backgrounded/bordered + icon variants, light/dark Section backgrounds); storybook-eyes visual diff.
**Target Platform**: Server-rendered Next.js marketing app; renders under `http://[brand].marketing-sites.localhost:3001` and preview host.
**Project Type**: Web application (marketing monorepo, `apps/marketing`).
**Performance Goals**: No runtime/perf regression; pure style resolution at render, no client data fetching, no added hydration beyond the existing Section background context already used by Heading/Paragraph/Icon.
**Constraints**: WCAG AA contrast preserved across all types on supported backgrounds; border width fixed at 2px (no author control); never render icons on both sides; SSR-by-default with no new client-only boundary.
**Scale/Scope**: One new component (≈5 files + tests/stories) + one registration entry + one Contentful component definition. Single brand (code.org).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**: PASS. Purely presentational; no logging/metrics/analytics changes, no cache or revalidation changes, no secrets. No personal data, Student Records, FERPA, or third-party data flows are introduced (FR-013). No privacy/security review trigger.
- **Shared System First And SSR By Default**: PASS. The component belongs in the marketing Contentful layer (`apps/marketing/src/components/contentful/customText/`) per the convention that Contentful-driven higher-level components live in `apps/marketing` while atomic primitives live in shared packages. It reuses shared utilities (`colors`, typography `tokens`, `fontStack`, `SectionBackgroundContext`, `FontAwesomeV6Icon`) rather than forking them; no new shared-package change is required. Direct MUI implementation. Server-rendered by default — the only context consumed is the existing `useSectionBackground`, identical to Heading/Paragraph/Icon; no new `use client`, browser API, or client fetch is added. No intentional duplication beyond reproducing the `overline` role token's visual values for the "Overline" type (justified: avoids a dependency on the legacy `Overline` SCSS surface; tracked in Complexity Tracking).
- **WCAG AA And Layered Storybook UX**: PASS. This is a higher-level marketing composition, reviewed in `apps/marketing-storybook` with mocked Section backgrounds (light + dark) and Contentful-style props. Stories cover every type, the override matrix, backgrounded/bordered + icon variants. WCAG AA: contrast switching keeps text legible on dark sections; backgrounded chips must meet AA against their fill; semantic tag choice (default `<span>`/`<p>`) must not fabricate heading hierarchy; icons are decorative (color-inherited) and non-essential to meaning. Layout stability preserved across the icon-left/right and background states.
- **Quality Gates Are Release Gates**: PASS. Minimum gate: lint + typecheck + Jest unit coverage of the resolver, plus marketing-storybook CI and storybook-eyes visual diff. No Playwright needed (no caching/redirect/consent/analytics/CMS-integration behavior). Reuses `packages/lint-config`. Visual-diff baselines must be accepted in the Applitools dashboard (existing storybook-eyes gate).
- **Spec-Driven Incremental Delivery**: PASS. Delivered in independently testable slices matching the spec's user stories (US1 type dropdown + defaults → US2 per-property overrides → US3 background/border + contrast → US4 single icon). Affected surfaces inventoried: one brand (code.org), no locale-specific logic, one Contentful registration entry, no cache/revalidation/infra sync points. **Contentful note**: MCP was not available this session, so the proposed `customText` content type is code-inferred only; before implementation the exact fields/validations must be confirmed via Contentful MCP, presented for human application/approval, then re-read from Contentful (FR-014, FR-016). No automated Contentful writes. SEO/sitemap unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/010-custom-text/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── component-props.md
│   └── contentful-fields.md
├── checklists/
│   └── requirements.md   # Spec quality checklist (from /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
apps/marketing/src/
├── components/
│   ├── contentful/
│   │   └── customText/                       # NEW component folder
│   │       ├── index.ts                      # exports default + definition
│   │       ├── CustomText.tsx                # React component (MUI Typography/Box)
│   │       ├── CustomTextContentfulDefinition.ts
│   │       ├── resolveCustomTextStyles.ts    # pure type-default → override → contrast resolver
│   │       └── __tests__/
│   │           ├── CustomText.test.tsx
│   │           └── resolveCustomTextStyles.test.ts
│   └── common/
│       ├── colors.ts                         # REUSED (no change expected)
│       └── definitions/index.ts              # MAY add a shared dropdown def if reused
├── themes/code.org/typography/
│   ├── tokens.ts                             # REUSED (SCALE_TEXT/SCALE_DISPLAY, role tokens)
│   └── fontStack.ts                          # REUSED (text/display font stacks)
└── contentful/registration/code.org/
    └── index.ts                              # ADD CustomText registration entry

apps/marketing-storybook/                     # ADD CustomText stories
```

**Structure Decision**: New marketing Contentful component under `apps/marketing/src/components/contentful/customText/`, following the exact file set used by `heading/` (component + Contentful definition + pure style resolver + index + `__tests__`). Registered in `apps/marketing/src/contentful/registration/code.org/index.ts`. Stories live in `apps/marketing-storybook`. No shared-package (`packages/*`) changes are planned; all reused primitives already exist in `apps/marketing`.

## Complexity Tracking

| Violation                                                                                                          | Why Needed                                                                                                                                                                                                                                      | Simpler Alternative Rejected Because                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Overline" type reproduces the `overline` role token's values instead of reusing the existing `Overline` component | Custom Text is a single catch-all element; it cannot delegate one of its types to a separately-registered Contentful component, and the existing `Overline` renders via legacy `overline--color-*` SCSS classes tied to a different color model | Migrating/retiring the existing `Overline` is out of scope for this feature and would expand the blast radius; reproducing one role token (text/xs/semibold) is a one-line default, not a forked subsystem. Future consolidation noted in research.md. |
