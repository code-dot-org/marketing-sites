# Implementation Plan: Activity Catalog Migration to Code.org Brand

**Branch**: `011-activity-catalog-codeorg-migration` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-activity-catalog-codeorg-migration/spec.md`

## Summary

Serve the fully-coded activity catalog page (currently `/[locale]/activities/[activityType]`, gated to the CSforAll brand) under the Code.org brand so it runs on aiday.org backed by the Code.org Contentful space, `sandbox` environment. Per clarification, the Code.org brand uses a **new URL structure** — `/{locale}/hour-of-ai/activities` and `/{locale}/hour-of-code/activities` — while csforall.org keeps its existing `/activities/{activityType}` URLs until retirement (no redirects on either brand). The page deliberately has **no Contentful Experience entry** (performance) and stays that way. Code changes are small and app-local: two new static route directories sharing an extracted page implementation, brand-aware metadata and footer cross-links, brand-aware content-type selection in the data layer, and the sitemap brand check. The larger work is in Contentful: the Code.org space has **no activity content model, no `hour-of-ai`/`hour-of-code` tags, and zero activity entries** (confirmed via read-only CDA on both `sandbox` and `master`), so a new `activity` content type, the two tags, and ported entries must be created in `sandbox` — all Dee-applied/approved per the Contentful write policy. Production (code.org / `master`) rollout is explicitly a later project; this feature merges to the `sandbox` branch that backs aiday.org.

## Technical Context

**Language/Version**: TypeScript (repo-standard), React 19 / Next.js App Router in `apps/marketing`, Turborepo-managed
**Primary Dependencies**: Next.js (SSR + ISR `revalidate = 3600`), MUI, `@orama/orama` (in-memory faceted search), `contentful` delivery/preview SDK
**Storage**: Contentful — Code.org space `90t6bu6vlf76`, env `sandbox` (aiday phase); CSforAll space (separate, old content model) keeps serving csforall.org via its own deployment env vars. Space selection is **per deployment** (`CONTENTFUL_SPACE_ID`/`CONTENTFUL_ENV_ID`), not per request.
**Contentful Data Model**: **New type proposed** — `activity` in the Code.org space (see [data-model.md](./data-model.md) and [contracts/contentful-activity-content-type.md](./contracts/contentful-activity-content-type.md)); reusing/extending the existing Code.org `curriculum` type was evaluated and rejected (Complexity Tracking). Plus two Contentful tags (`hour-of-ai`, `hour-of-code`) and entry porting from the CSforAll space.
**MUI / Legacy DS Plan**: Existing catalog components are already direct MUI (`ActivitiesHero`, `ActivityCatalog`, `FacetBar`, `FacetDrawer`, `ActivitiesFooter`, `ActivityCollection`); no legacy DS involved; no new components.
**SEO / Indexing Plan**: Metadata + sitemap review needed — the coded route builds its own metadata (currently hardcoded to CSforAll canonical/icons) and the sitemap emits `/activities/*` only for `Brand.CS_FOR_ALL`; both become brand-aware, with the Code.org brand using the new `/{activityType}/activities` paths (canonical `https://code.org/{locale}/{activityType}/activities`). No redirects: the new paths never existed on Code.org and CSforAll's URLs don't move. Not covered by the Experience sitemap flow (no Experience entry, intentionally).
**Testing**: Jest (existing suites under `activityCatalog/**/__tests__` and module tests), `yarn prettier`, typecheck/lint; marketing-storybook CI path for any touched marketing components; manual verification on `http://code.marketing-sites.localhost:3001` and aiday.org.
**Target Platform**: Next.js server (SSR/ISR) behind CDN; multi-tenant by hostname (`withBrand` middleware; unknown hosts — including aiday.org — default to `Brand.CODE_DOT_ORG`).
**Project Type**: Web app route + data module inside existing monorepo app (`apps/marketing`); no shared-package changes expected.
**Performance Goals**: Preserve the no-Experience server render; keep route ISR at 3600s and Contentful fetch cache at 900s with tag-based invalidation; no new client-side data fetching.
**Constraints**: No Contentful Experience entry may be introduced; CSforAll brand must keep working unchanged (CSFORALL-COMPAT); production (main branch / master env) untouched — target branch is `sandbox`; all Contentful schema/content changes are proposed to Dee, human-applied/approved, then re-read.
**Scale/Scope**: 2 activity types (`hour-of-ai`, `hour-of-code`); on the order of tens–low hundreds of activity entries; ~7 code files touched (2 new static routes, extracted shared page, existing route, data module, sitemap, footer links) + tests.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Availability, Cached, Secure, Observable, and Privacy-Safe Operations**: PASS.
  No cache-lifetime changes: route keeps `revalidate = 3600`; the shared Contentful client adapter keeps `force-cache` + 900s revalidate with sys-id/content-type cache tags (the new `activity` content-type tag participates in webhook invalidation automatically). Sitemap keeps `STALE_WHILE_REVALIDATE_ONE_DAY`. Existing structured logging in `getAllEntriesForContentType` covers the new fetch path. No new third-party integrations; existing Statsig card events carry over unchanged (no new analytics). No personal data, Student Records, or FERPA surface — public marketing/curriculum content only; no privacy review needed. Empty-content states degrade gracefully (page renders with zero results rather than erroring).
- **Shared System First And SSR By Default**: PASS.
  Affected workspace: `apps/marketing` only. The catalog is app-level page composition (correct layer per architecture rules); shared design-system packages untouched. Brand behavior uses the existing switchboards: `withBrand` middleware, `getMuiTheme(brand)`, `getHeader/getFooter(brand)`, `getIcons(brand)`, `getProductionCanonicalRootDomain(brand)` — no forks. Page remains server-rendered (SSR + Orama index built server-side); the only client boundaries are the pre-existing facet/search interaction components (`'use client'` in `ActivityCatalog`, hero/footer) — no new client code. All components are already MUI; no legacy-DS migration owed here.
- **WCAG AA And Layered Storybook UX**: PASS.
  No visual changes to the components themselves; they inherit Code.org brand theming from the existing `data-brand`/MUI-theme plumbing. Review surfaces: existing marketing-storybook stories for catalog components remain the review fixture; page-level manual preview on the local Code.org host and aiday.org. WCAG AA posture is preserved (semantic h1, keyboard-accessible MUI controls, existing facet drawer behavior); no contrast changes because tokens come from the already-shipped Code.org theme. Catalog styling is intentionally untouched, including its documented exemption from the `codeai-` radius token scheme (spec FR-003) — implementers editing catalog components (e.g. the footer links) must not re-token them.
- **Quality Gates Are Release Gates**: PASS.
  Required: lint, typecheck, Jest for the touched page/module/sitemap behavior (extend tests to cover the Code.org brand gate, brand-aware metadata, brand-aware content-type selection, and sitemap emission for Code.org), `yarn prettier` before commit, marketing-storybook CI path (components unchanged, suite must stay green). Playwright/E2E omitted: no cross-system change to caching, redirects, consent, or security semantics — the route contract is exercised by Jest plus manual aiday.org verification during the sandbox test phase. Visual baselines: no component pixel changes expected; storybook-eyes stays as-is.
- **Spec-Driven Incremental Delivery**: PASS.
  Independently testable slices: (1) code changes verifiable locally against sandbox even before content exists (empty catalog renders), (2) Contentful model + tags creation, (3) content porting + verification, (4) sitemap/SEO. Brands inventoried: Code.org (new), CSforAll (must not regress), HOC (unaffected). Locales: route already carries `[locale]`; behavior unchanged. Contentful registration: none (no Experience component involved). MCP status: the Contentful MCP requires interactive OAuth not completable in this session; schema facts were confirmed via **read-only CDA** (equivalent read fidelity) and are labeled as such in [research.md](./research.md); the CSforAll-space schema is **code-inferred** and must be cross-checked by Dee in the CSforAll space before the new type is created. Writes: all Contentful changes (new type, tags, entries) are presented as exact definitions in `contracts/`, applied by Dee (schema) or Dee-approved batch (entries), then re-read via CDA/MCP to confirm. SEO/sitemap changes documented (FR-016, contracts/activity-catalog-route.md).

**Post-Phase-1 re-check**: PASS — design added no new violations; the single justified item (new content type) is recorded in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/011-activity-catalog-codeorg-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── activity-catalog-route.md            # Route/URL/caching/SEO contract (new Code.org URL structure)
│   └── contentful-activity-content-type.md  # Exact Contentful changes for Dee to apply
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/marketing/src/
├── app/[brand]/[locale]/
│   ├── hour-of-ai/activities/page.tsx    # NEW — Code.org brand, activityType = hour-of-ai
│   ├── hour-of-code/activities/page.tsx  # NEW — Code.org brand, activityType = hour-of-code
│   └── activities/[activityType]/
│       └── page.tsx                      # CSFORALL-COMPAT — stays CSforAll-gated on the old URL
├── app/sitemap.xml/route.ts              # Emit new paths for Code.org brand; CSforAll emission unchanged
├── modules/activityCatalog/
│   ├── page/ (or equivalent)             # Extracted shared page implementation used by all three routes
│   ├── contentful/getContentfulActivities.ts   # Brand-aware content-type id ('activity' vs CSFORALL-COMPAT 'curriculum')
│   ├── orama/createDatabase.ts           # Unchanged (field ids match by design)
│   └── types/Activity.ts                 # Unchanged
├── components/contentful/activityCatalog/
│   └── activitiesFooter.tsx              # Cross-catalog links become brand-aware (hardcoded /activities/* today)
├── components/csforall/activityCollection/      # Unchanged for now (relocation = optional cleanup task)
└── config/{brand,host,metadata/icons}.ts        # Unchanged — existing switchboards consumed by the page
```

**Structure Decision**: All changes stay inside `apps/marketing` at the app layer. The Code.org URLs are **static route segments** (`hour-of-ai/activities`, `hour-of-code/activities`) rather than a dynamic `[activityType]/activities` route: static segments beat the `[[...paths]]` Experience catch-all only for these two exact paths, whereas a dynamic segment would capture every `/x/activities` URL and 404 Experience pages with such slugs. The three thin `page.tsx` files delegate to one extracted implementation (route entry + brand gate + activityType constant each). No shared-package or design-system changes; no new UI components. Contentful changes live entirely in the Code.org space `sandbox` environment and are specified in `contracts/` for human application.

## Complexity Tracking

| Violation                                                                                                                 | Why Needed                                                                                                                                                                                                                                                                                                                                                  | Simpler Alternative Rejected Because                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Contentful content type `activity` (constitution prefers reuse/extension of existing types)                           | The Code.org space has no activity model at all (CDA-confirmed: 40 types, none activity-shaped; 0 tagged entries). The catalog code contract needs 12+ fields (`ages`, `length`, `topic`, `activityType`, `technologyClassroom`, `supportedLanguages`, `tutorialID`, `featuredPosition`, …) that exist only in the CSforAll space's old-model `curriculum`. | **Extend Code.org `curriculum`**: its new-model vocabulary conflicts near-field-by-field (`grade` vs `ages`, `duration` vs `length`, `topics` vs `topic`, `accessibility` vs `accessibilitys`, `languages` vs `supportedLanguages`), and its required fields (`actionBlockOverline`, `experienceLevel`, `duration`, `devices`) would force junk values onto every activity entry while cluttering the unit-card authoring UX. **Cross-space read of CSforAll**: needs a second client + credentials in the aiday deployment and hard-wires a dependency on a space that is being retired. |
| Coded route without a Contentful Experience entry (outside the standard Experience page flow, incl. its sitemap coverage) | Explicit product requirement: kept for performance (skips Experience resolution for a search-heavy page); pre-existing architecture being preserved, not introduced.                                                                                                                                                                                        | Converting to an Experience page was ruled out by the feature owner; sitemap coverage is handled by the existing coded-route emission in `sitemap.xml/route.ts`, extended to the Code.org brand.                                                                                                                                                                                                                                                                                                                                                                                          |
