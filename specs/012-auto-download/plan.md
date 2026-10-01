# Implementation Plan: Auto Download component

**Branch**: `012-auto-download` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-auto-download/spec.md`

## Summary

A new Studio component, **Auto Download** (`autoDownload`), for the marketing app, registered for Hour of AI and Code.org under `08: Advanced`.

- **Binding**: one `Media` variable bound to an asset, which the SDK resolves to the asset's file URL.
- **Server output**: a status message and a real fallback link in the server-rendered HTML.
- **Download**: after hydration, one effect fetches the file from Contentful's CDN (CORS `*`, confirmed) and saves it through a same-origin `blob:` link, so the PDF is saved rather than opened in the viewer.
- **Suppression**: auto-start is off in the Studio editor, on preview hosts, on back/forward returns, and for all but the first instance on a page.
- **Analytics**: each automatic download sends one GA4 `file_download` event (built-in tracking parameter meanings, plus `method: 'auto'`). Fallback-link clicks are left to GA4's built-in tracking, so nothing is counted twice.
- **What doesn't change**: no Contentful schema, route, middleware, cache, or SEO code. Pages are ordinary Experiences marked `noindex` by the authoring convention.

## Technical Context

**Language/Version**: TypeScript ~5.x, React 18, Next.js App Router (existing marketing app)  
**Primary Dependencies**: `@mui/material` (Box, Typography), `@contentful/experiences-sdk-react` (ComponentDefinition, editor properties), `@next/third-parties/google` (`sendGAEvent`, already used by not-found), the existing marketing `Link` component and `useSectionBackground`. No new dependencies.  
**Storage**: N/A  
**Contentful Data Model**: no Contentful change needed. One component variable bound to an existing asset. Fallback (R1): a one-field type proposed for human approval, only if Studio's picker refuses PDFs.  
**MUI / Legacy DS Plan**: direct MUI implementation, reusing the MUI-based marketing `Link`. No legacy design system.  
**SEO / Indexing Plan**: existing Experience sitemap flow unchanged. Download pages are non-indexable by authoring convention (`noindex`), which also drops them from the sitemap.  
**Testing**: Jest + React Testing Library (component, download helper, analytics helper, registration). Storybook stories with `play` in `apps/marketing-storybook`.  
**Target Platform**: current Chrome, Edge, Firefox, and Safari (desktop and mobile)  
**Project Type**: multi-tenant Next.js web app (monorepo)  
**Performance Goals**: file saved within 2 s of page load on broadband, with zero added origin requests (the fetch goes to Contentful's CDN).  
**Constraints**: no new client root boundary, and no new third-party recipients or data. Keep the public cache contract (SWR/SIE) unchanged. WCAG 2.x AA.  
**Scale/Scope**: one component (about 4 source files), one registration, one story file. Files are small (≤10 MB target; the toolkit is 150–250 KB).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**: ✅
  - No cache, header, route, redirect, or revalidation change. Pages keep the Experience route's SWR/SIE headers, and the file is fetched from Contentful's CDN, not the origin.
  - The analytics call uses the existing GA integration behind OneTrust. It carries file metadata only and adds no new recipient, so the Privacy Policy is unaffected and there is no FERPA or student-record exposure.
  - Failure mode: if the download fails, the message changes and the link remains.
  - Observability: GA is the metric. A failed fetch logs a console warning only; there's no Sentry noise for user network errors.
- **Shared System First And SSR By Default**: ✅
  - Only `apps/marketing` (component + Hour of AI and Code.org registrations) and `apps/marketing-storybook` (stories) are affected. No shared package need: a Contentful-bound marketing component belongs in the app layer, per the Architecture Decision Rules.
  - Registration goes through the existing brand switchboard.
  - Client execution is limited to one effect inside the SDK's existing client root, and all visible output is server-rendered (R7).
  - Built directly with MUI, with no legacy design-system use.
- **WCAG AA And Layered Storybook UX**: ✅
  - Higher-level marketing composition, reviewed in `apps/marketing-storybook`.
  - Stories: default, dark section background, editor/preview note, failure message, unbound (editor placeholder).
  - AA requirements: a `role="status"` live region; a real, keyboard-focusable link with descriptive text; section-background contrast switching through the shared `Link` and `useSectionBackground`; no focus moves; no layout shift between states (the message swaps in the same line box).
- **Quality Gates Are Release Gates**: ✅
  - `yarn lint`, typecheck, and Jest for the component, helpers, and registration.
  - Marketing-storybook `test:ui:ci` must pass, and new stories need Applitools baselines accepted in the dashboard.
  - No Playwright e2e: there is no runtime-contract change, and a real download plus GA would need a live Hour of AI page and GA property that don't exist yet. The quickstart has a manual check instead.
  - Final `yarn release:dryrun`.
- **Spec-Driven Incremental Delivery**: ✅
  - Slices: US1 (download + fallback) ships alone. US2 is the editor path. US3 (analytics) layers on.
  - Brands: Hour of AI and Code.org (added 2026-09-30 at Dee's request). CSforAll isn't registered.
  - Locales: text variables are localizable in Studio.
  - Contentful (MCP-confirmed):
    - Hour of AI asset URLs use `contentful-images` and `contentful-videos.code.org`.
    - No PDF exists in the space yet, so the PDF host (`contentful-assets.code.org`) is inferred.
  - Contentful (inferred or not yet confirmed):
    - The `Media` → URL resolution comes from the installed SDK source.
    - Whether the Studio picker accepts PDFs is unconfirmed; Dee checks it on the first draft.
  - Contentful writes: at most one draft `toolkit` Experience, proposed to Dee first, left unpublished, and re-read after writing. Dee uploads the PDF.
  - Data model reviewed: no new type.
  - SEO: unchanged apart from the `noindex` convention.

**Post-design re-check**: ✅ No violations. The design adds no complexity that needs justification.

## Project Structure

### Documentation (this feature)

```text
specs/012-auto-download/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── file-download-event.md
│   └── studio-component.md
├── checklists/requirements.md
└── tasks.md             # /speckit.tasks
```

### Source Code (repository root)

```text
apps/marketing/src/components/contentful/autoDownload/
├── AutoDownload.tsx                     # MUI render + one effect (state machine in data-model.md)
├── AutoDownloadContentfulDefinition.ts  # contracts/studio-component.md
├── startFileDownload.ts                 # fetch → blob → <a download>; abortable; URL/name helpers
├── sendFileDownloadEvent.ts             # sendGAEvent wrapper with the load-retry (R6)
├── index.ts
└── __tests__/
    ├── AutoDownload.test.tsx
    ├── startFileDownload.test.ts
    └── sendFileDownloadEvent.test.ts

apps/marketing/src/contentful/registration/hourofai/
├── index.ts                             # + {component: AutoDownload, definition, options.enableEditorProperties}
└── __tests__/definitions.registration.test.ts  # + autoDownload registered for Hour of AI (Code.org in registration/code.org/index.ts)

apps/marketing-storybook/stories/
└── AutoDownload.story.tsx               # autoStart=false for static states; one play story with a mocked fetch
```

**Structure Decision**: this matches the existing Contentful component layout (for example `customText/`). The download and analytics helpers are separate modules so they can be unit-tested and mocked in Storybook without touching the render.

## Complexity Tracking

None.
