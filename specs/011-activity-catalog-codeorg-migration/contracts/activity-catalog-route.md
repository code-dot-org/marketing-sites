# Contract: Activity Catalog Routes (Code.org brand)

**Routes**:

- NEW `apps/marketing/src/app/[brand]/[locale]/hour-of-ai/activities/page.tsx`
- NEW `apps/marketing/src/app/[brand]/[locale]/hour-of-code/activities/page.tsx`
- EXISTING `apps/marketing/src/app/[brand]/[locale]/activities/[activityType]/page.tsx` (CSFORALL-COMPAT — unchanged URL, stays CSforAll-gated)

All three are thin route entries over one shared page implementation (extracted from the current `page.tsx`).

## URL surface

| Element          | Value                                                                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code.org paths   | `/{locale}/hour-of-ai/activities` and `/{locale}/hour-of-code/activities` (brand segment injected by `withBrand` middleware from hostname)                                             |
| CSforAll paths   | `/{locale}/activities/{hour-of-ai\|hour-of-code}` — unchanged until retirement                                                                                                         |
| Redirects        | None on either brand (new paths never existed on Code.org; CSforAll paths don't move)                                                                                                  |
| Brand gates      | New routes: `Code.org` only, others → 404. Old route: `CSForAll` only (as today), others → 404                                                                                         |
| Route precedence | Static segments — they win over the `[[...paths]]` Experience catch-all for these exact paths only; `/hour-of-ai` alone still resolves through the catch-all (Experience page, if any) |
| Hosts            | aiday.org and any Code.org-brand host (default-brand fallback); `code.marketing-sites.localhost:3001` locally; csforall.org unchanged                                                  |
| Query params     | `term` (search text) + serialized facet selections; server render ignores them (client hydrates state from URL) — unchanged                                                            |

## Rendering & caching

- Server-rendered page; ISR `revalidate = 3600`; no build-time params — both unchanged, carried into the new routes.
- Contentful fetches: `force-cache`, `next.revalidate = 900`, cache tags = entry sys ids + content type id (`activity` on Code.org brand; `curriculum` on CSforAll) — publish webhooks invalidate by those tags with no additional wiring.
- Draft mode uses the preview client and stays outside the public cache (existing behavior, must not change).
- Zero published activities → page renders hero + empty results + footer (no error, no 404).
- Missing content type (environment where `activity` doesn't exist yet) → the CDA rejects the query with 400 `unknownContentType`; `getContentfulActivities` catches that specific error and renders the empty catalog instead of a 500 (verified against live sandbox before the type exists).

## Metadata (changes)

| Item                          | Contract                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `icons`                       | `getIcons(brand)` — Code.org favicon set on the new routes (currently hardcoded CSforAll)                                                              |
| `canonical`                   | Code.org routes: `https://code.org/{locale}/{activityType}/activities`; CSforAll route keeps `https://csforall.org/{locale}/activities/{activityType}` |
| title/description/keywords/OG | Unchanged (Hour-of-AI copy, OG image asset)                                                                                                            |

## In-page links (changes)

- `ActivitiesFooter` cross-catalog buttons (today hardcoded `/activities/hour-of-code` / `/activities/hour-of-ai`) must emit the brand's path shape: `/{activityType}/activities` on Code.org, `/activities/{activityType}` on CSforAll.

## Sitemap (changes)

- `apps/marketing/src/app/sitemap.xml/route.ts`: Code.org brand emits `/hour-of-ai/activities` and `/hour-of-code/activities`; CSforAll emission unchanged (`/activities/{activityType}`). Headers unchanged (`STALE_WHILE_REVALIDATE_ONE_DAY`, ETag).

## Data fetch (changes)

- `getContentfulActivities(activityType, brand)`: query `content_type = 'activity'` for the Code.org brand; `'curriculum'` retained for CSforAll behind a `CSFORALL-COMPAT` comment. Tag filter `metadata.tags.sys.id[in] = [activityType]` unchanged. Pagination via `getAllEntriesForContentType` unchanged.

## Test contract (Jest)

1. Brand gates: new routes render for CODE_DOT_ORG and 404 for CS_FOR_ALL/HOC; old route renders for CS_FOR_ALL and 404 for CODE_DOT_ORG/HOC (unchanged behavior).
2. Metadata: canonical path shape + icons follow the brand.
3. Footer links: cross-catalog href matches the brand's path shape.
4. Data layer: content type id chosen by brand; tag filter passthrough.
5. Sitemap: new paths present in Code.org output; old paths present in CSforAll output; neither for HOC.
6. Existing component suites (`activityCatalog`, `facetBar`, `facetDrawer`, `activitiesHero`, `activitiesFooter`) stay green (footer suite extended for brand-aware links).
