# Implementation Plan: State of Digital Fluency report pages

**Branch**: `014-state-digital-fluency` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-state-digital-fluency/spec.md`

## Summary

This plan builds the public report on the Code.org brand from the `reportData` entry `state-of-digital-fluency`. Infrastructure's spec 013 Python pipeline writes and publishes that entry.

- **Routes**: server-rendered template routes under `/[brand]/[locale]/state-of-digital-fluency`.
- **Fetching**: the entry is fetched with `getEntries({'sys.id[in]': id})`, so the existing entry-ID webhook refreshes it.
- **Cache**: `revalidate = 900` behind the existing SWR and SIE headers.
- **Launch gate**: `notFound()` until the entry is published.
- **Reading**: the overall shape is checked with Zod. If it fails, the page throws, so the last good page keeps serving and an error is logged. Individual fields are read tolerantly.
- **Display components**: five general components in the marketing layer.
  - Chart wraps `@mui/x-charts` 8.29.3.
  - Map is a first-party, server-rendered SVG generated from `us-atlas`, with a small client island.

## Technical Context

- **Language/Version**: TypeScript 5.5 on Node 22, React 18.3, Next.js 15.4 App Router.
- **Primary dependencies**:
  - Existing: `@mui/material` 7.1.2, `contentful` 11, `tsx`.
  - New runtime: `@mui/x-charts@8.29.3` (9.x needs `@mui/material` 7.3 or later), `zod@^3.25.76` (already installed transitively, now declared, used server-side for the shape check).
  - New devDeps, used only to regenerate the committed map paths: `us-atlas@3.0.1`, `topojson-client`, `topojson-simplify`, `d3-geo`.
- **Storage**: none. Reads the Contentful entry.
- **Contentful data model**:
  - The `reportData` type already exists. It was confirmed via MCP in Code.org `master` and exists in `development` (Dee).
  - One entry, fixed ID `state-of-digital-fluency`, written only by the spec 013 pipeline.
  - The methodology page uses the existing `experience` type.
  - No new content types.
- **MUI and legacy design system**: direct MUI throughout, with no legacy components.
- **SEO and indexing**:
  - Explicit metadata, with a self-canonical that includes the locale, following the activity catalog pattern.
  - The sitemap lists the overview, rankings and 51 state pages in every locale, only while the entry is published.
  - Printable pages are `noindex, follow`.
  - The methodology page is covered by the existing Experience sitemap.
- **Testing**:
  - Jest: `getReport`, `readReport`, routes and sitemap.
  - Storybook 9 `play` tests and the a11y addon for the components.
  - A contrast unit test.
  - One Playwright spec for cache headers, the launch gate and axe.
- **Target platform**: the existing marketing app (ECS Fargate behind CloudFront).
- **Project type**: multi-tenant Next.js web app.
- **Performance goals**: within the site's Lighthouse budget, with no layout shift. Client islands receive only the fields they render.
- **Constraints**: no new runtime secrets, outbound calls or AWS changes, and preview stays uncached.
- **Scale and scope**: 54 public pages plus 51 printable pages, about 120 KB of data, high read traffic behind the CDN.

## Constitution Check

_Passed before research; re-checked after design._

**Availability, cache, security, observability and privacy**

- Pages use ISR with a 900-second window, matching the Experience route and the CloudFront function note.
- One Contentful fetch per page, tagged by entry ID.
- If the shape check fails, the page throws, so the cache keeps serving the stale page (SIE) and a structured error is logged with the entry version and the failing path.
- No Google or GitHub calls at request time.
- State aggregates only: no personal data, no FERPA scope, no new data leaving the site.

**Shared system first and SSR by default**

- Workspaces: `apps/marketing` and `apps/marketing-storybook`. Nothing in `packages/*`.
- The components live in `src/components/dataDisplay/`. Only one app needs them today; if a second app needs them, they move to a shared package.
- Server-first. The client islands are:
  - Chart (MUI X Charts are client components, rendered on the server)
  - Map hover, focus and tooltip, plus the overview's linked info and gender cards
  - Rankings tabs (all panels rendered on the server)
- Recorded change from the approved plan: MUI X Charts ship their browser code even for static charts, so pages are held to the performance budget instead (research R3).

**WCAG AA and layered Storybook UX**

- Marketing-storybook stories for Stat, Chart, Scale, ReportMap and DataTable on synthetic data, with `play` tests for keyboard use and the table equivalents.
- Requirements: table equivalents, bands that don't rely on colour alone, visible focus, reduced motion respected, and stable layout across states.
- A contrast unit test, because the a11y addon has colour-contrast turned off.

**Quality gates**

- Lint, typecheck and Jest.
- The marketing-storybook `test:ui:ci` run.
- One Playwright spec, because it crosses cache and preview boundaries.
- Eyes baselines.
- `yarn release:dryrun`.

**Spec-driven incremental delivery**

- Slices: US1 (pages on fixture data, then live), US2 (print), US3 (methodology), US4 (launch).
- Brand: Code.org only. Locales: all.
- No Studio registrations.
- Contentful: confirmed via MCP. The methodology draft is built with Dee's OK and re-read.
- Upstream dependency: spec 013 (Infrastructure) for live data, publishing and the sheet trigger. Fixture data unblocks all UI work.

**Re-check: passes.** One recorded change (R3). No complexity violations.

## Project Structure

### Documentation

```text
specs/014-state-digital-fluency/
├── plan.md  research.md  data-model.md  quickstart.md  tasks.md
└── contracts/report-data.schema.md     # what the site needs in reportData.data (handed to spec 013)
```

### Source Code

```text
apps/marketing/
├── scripts/generateUsStatePaths.ts                # one-off us-atlas → usStatePaths.ts
├── src/modules/stateOfDigitalFluency/
│   ├── paths.ts  constants.ts  types.ts
│   ├── reportShape.ts                             # zod shape check (structure only)
│   ├── getReport.ts                               # getEntries({'sys.id[in]'}); null when absent; dev fixture
│   ├── readReport.ts                              # tolerant view models
│   ├── metadata.ts
│   ├── sections/{overview,rankings,state,print}/  DraftWarnings.tsx
│   └── __tests__/ (fixtures/)
├── src/components/dataDisplay/{stat,chart,scale,map,table}/
├── src/app/[brand]/[locale]/state-of-digital-fluency/
│   ├── page.tsx  rankings/page.tsx  methodology/page.tsx
│   ├── [state]/page.tsx  [state]/report/page.tsx
│   └── __tests__/
├── src/app/sitemap.xml/route.ts                   # EDIT
└── tests/e2e/stateOfDigitalFluency.spec.ts

apps/marketing-storybook/stories/
├── Stat.story.tsx  Chart.story.tsx  Scale.story.tsx  ReportMap.story.tsx  DataTable.story.tsx
└── __mocks__/stateOfDigitalFluency.ts
```

**Structure decisions**:

- `methodology/page.tsx` reuses the Experience page with fixed paths, so the `[state]` route doesn't catch "methodology".
- `getReport()` only ever reads the Contentful entry. The synthetic fixture is for tests and Storybook; the app never reads it.
- `types.ts` mirrors the payload JSON Schema in spec 013 (`pipelines/digital-fluency/schema/`). A Jest test checks the fixture against that schema once it's on `main`.

## Complexity Tracking

None.
