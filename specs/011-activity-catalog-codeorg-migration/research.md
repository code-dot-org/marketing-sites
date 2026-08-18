# Research: Activity Catalog Migration to Code.org Brand

**Date**: 2026-08-18 | **Feature**: 011-activity-catalog-codeorg-migration

## Evidence sources

- **CDA-confirmed (read-only)**: Code.org space `90t6bu6vlf76`, environments `sandbox` and `master`, queried with the delivery token from `apps/marketing/.env`. The Contentful MCP requires an interactive OAuth login that could not be completed in this session; CDA reads are the same delivery-API data the app consumes, so schema/content facts below marked **[CDA]** are confirmed, not inferred.
- **Code-inferred**: Anything about the **CSforAll space** (no credentials available in this checkout) is inferred from application code and marked **[code]**. Dee must cross-check these against the CSforAll space before applying schema changes.

## Confirmed facts

1. **[CDA]** The Code.org space has **no activity content model**: 40 content types in both `sandbox` and `master`, none activity-shaped. `curriculum` exists but with the new-model unit vocabulary: `title, actionBlockOverline*, shortDescription*, longDescription, primaryLinkRef, secondaryLinkRef, studentLink, image*, video, grade[], experienceLevel*[], duration*[], devices*[], topics[], labs[], professionalLearning[], accessibility[], languages[], associatedCurricula[], schoolSubject[], publishedDate` (`*` = required).
2. **[CDA]** Zero `curriculum` entries tagged `hour-of-ai` or `hour-of-code` in `sandbox`; the only tag defined in `sandbox` is `mentorshipResourceLogos`. The `hour-of-ai`/`hour-of-code` tags do not exist yet.
3. **[CDA]** `carousel.slides` link validation allows `curriculum` (and others) but would not allow a new `activity` type until its validation is updated — only relevant if aiday Experiences later want `ActivityCarousel` slides from activity entries; not needed for the catalog page.
4. **[code]** The catalog queries `content_type=curriculum` with `metadata.tags.sys.id[in]=[activityType]` (`getContentfulActivities.ts:24-28`) against the **single app-wide Contentful client** (`contentful/client/createClient.ts`), whose space/env come from `CONTENTFUL_SPACE_ID`/`CONTENTFUL_ENV_ID`. **Space selection is per deployment, not per brand/request** — csforall.org runs a deployment pointed at the CSforAll space; the aiday.org deployment points at Code.org space + `sandbox`.
5. **[code]** The page is hard-gated: `brand !== Brand.CS_FOR_ALL → notFound()` (`page.tsx:84-90`), and metadata hardcodes CSforAll icons and canonical (`page.tsx:36,56`). `generateStaticParams` returns `[]`; `revalidate = 3600`.
6. **[code]** aiday.org resolves to `Brand.CODE_DOT_ORG` via the default fallback in `getBrandFromHostname` (`config/brand.ts:68-74`); only preview-aiday hosts are special-cased (`config/preview.ts:13-16`). The brand layout already supplies Code.org theme, header, footer, `data-brand` (`app/[brand]/[locale]/layout.tsx`).
7. **[code]** Sitemap emits `/activities/{hour-of-ai,hour-of-code}` only for `Brand.CS_FOR_ALL` (`app/sitemap.xml/route.ts:165-170`).
8. **[code]** CSforAll's old-model `curriculum` carries a dual vocabulary — "curriculum units use grade/duration/topics, activity-catalog entries use ages/length/topic" (comment at `UnitCarousel.tsx:31-33`). The activity vocabulary consumed by the catalog (via `Activity.ts`, `createDatabase.ts`, `ActivityCollection.tsx`, `facets.ts`) is: `title, image, organization, ages[], languageProgramming[], shortDescription, longDescription, primaryLinkRef→link, secondaryLinkRef→link, technologyClassroom[], topic[], activityType[], length[], accessibilitys[], languagesText, supportedLanguages[], standards, tutorialID, featuredPosition`.
9. **[code]** Catalog UI components are already direct MUI and brand-agnostic (no CSforAll styling): `activitiesHero.tsx`, `activitiesFooter.tsx`, `activityCatalog.tsx`, `facetBar`, `facetDrawer`. `ActivityCollection` lives under `components/csforall/` but contains no CSforAll-specific behavior (MUI + shared `Card` + Statsig card events).

## Decisions

### D1 — Content model: create a new `activity` content type in the Code.org space

- **Decision**: Propose a new `activity` content type in Code.org space `sandbox`, with field ids exactly matching the code contract (fact 8; full definition in `contracts/contentful-activity-content-type.md`). Schema creation is applied by Dee (schema changes stay with Dee per standing policy).
- **Rationale**: The Code.org `curriculum` type cannot serve activities: near-total vocabulary conflict and four required unit-card fields that activities can't honestly fill. A dedicated type keeps unit-card authoring clean, needs **zero changes** to `createDatabase`/components (field ids match), and the catalog is fully coded so no Studio/Experience registration is required.
- **Alternatives considered**:
  - _Extend Code.org `curriculum` with the activity vocabulary_ (mirroring CSforAll's dual-vocabulary pattern): rejected — required-field conflicts (`actionBlockOverline`, `experienceLevel`, `duration`, `devices` would demand junk values on every activity), ~12 near-duplicate fields cluttering a heavily used editor type.
  - _Cross-space read of the CSforAll space from the aiday deployment_: rejected — second client + credential plumbing, couples the new site to a retiring space, worse availability story.

### D2 — Routes & brand gates: new static Code.org routes, old route stays CSforAll-only

- **Decision** (updated per 2026-08-18 clarification): The Code.org brand serves the catalogs at `/{locale}/hour-of-ai/activities` and `/{locale}/hour-of-code/activities` via two **new static route directories**, each a thin `page.tsx` (brand gate: `CODE_DOT_ORG` only; hardcoded activityType) delegating to a shared page implementation extracted from the current route. The existing `/activities/[activityType]` route keeps its `CS_FOR_ALL` gate unchanged (CSFORALL-COMPAT) and delegates to the same shared implementation. No redirects on either brand. `getContentfulActivities` selects the content type id by brand: `CS_FOR_ALL → 'curriculum'` (CSFORALL-COMPAT), otherwise `'activity'`; tag-filter query shape stays identical. `ActivitiesFooter`'s cross-catalog links (hardcoded `/activities/{type}` today) become path-aware per brand.
- **Rationale**: Static segments beat the `[[...paths]]` Experience catch-all only for these two exact URLs; a dynamic `[activityType]/activities` route would capture every `/x/activities` path and `notFound()` would swallow Experience pages with such slugs. Keeping csforall.org's URLs untouched avoids redirect work and re-verification on a retiring brand; the compat pieces (old route, `'curriculum'` branch, CSforAll sitemap emission) are removable together at retirement.
- **Alternatives considered**: single dynamic `[activityType]/activities` route (catch-all shadowing risk above); moving CSforAll to the new URLs with redirects (churn on a retiring brand); hard-switch to Code.org only (breaks live csforall.org catalog); env-var-driven content type (hides a brand decision in deployment config).

### D3 — Metadata: derive from the route brand via existing helpers

- **Decision**: `generateMetadata` uses the `brand` param: `getIcons(brand)`, canonical `https://${getProductionCanonicalRootDomain(brand)}` + the brand's own path shape (`/{locale}/{activityType}/activities` on Code.org → e.g. `https://code.org/en-US/hour-of-ai/activities`; CSforAll keeps `/{locale}/activities/{activityType}`), OG data otherwise unchanged (copy is already Hour-of-AI-centric).
- **Rationale**: Matches how the rest of the app brands metadata; aiday.org is not a canonical host anywhere in the app today, so pointing canonicals at `code.org` is consistent with existing site-wide behavior during the sandbox phase. Flag for the later production project: revisit canonical strategy if aiday.org should be its own canonical home.
- **Alternatives considered**: hardcode aiday.org canonical (diverges from every other route; aiday isn't modeled as a brand); leave CSforAll canonical (wrong cross-domain canonical, SEO hazard).

### D4 — Sitemap: extend the coded-route emission to the Code.org brand

- **Decision**: Extend `sitemap.xml/route.ts` so the Code.org brand emits `/hour-of-ai/activities` and `/hour-of-code/activities`; the CSforAll emission of `/activities/{activityType}` stays as-is.
- **Rationale**: The route is real and public on the Code.org brand; the sitemap already handles coded (non-Experience) routes this way. Master env has no activity entries, but the production sitemap is a later-project concern (this change ships on the `sandbox` branch only).
- **Alternatives considered**: exclude during aiday phase (hides the page from discovery testing; adds a second change later for no benefit).

### D5 — Tags: reuse the tag-filter mechanism; create `hour-of-ai` and `hour-of-code` tags in `sandbox`

- **Decision**: Keep `metadata.tags.sys.id[in]` filtering unchanged; create the two tags in the Code.org `sandbox` environment and tag every ported activity entry accordingly (Dee-approved writes).
- **Rationale**: Zero code change; tags are how the CSforAll catalog already segments the two catalogs.
- **Alternatives considered**: an `activityCatalogType` field on the new type (code change in the query layer, diverges from proven behavior for no gain).

### D6 — Content porting: CSforAll space → Code.org `sandbox`, batch rules apply

- **Decision**: Port activity entries (and their `link` refs + image assets) from the CSforAll space into Code.org `sandbox` as `activity` entries. Follow the established batch rules: pilot entry first, Dee approves the batch, machine-verify writes by re-reading, entries land as drafts for Dee to review/publish. Requires CSforAll-space read access (Dee to provide export or credentials) — the exact source field mapping must be confirmed against the CSforAll space before the batch, since the source schema is currently code-inferred.
- **Rationale**: Matches the standing Contentful write policy and the proven prod→sandbox porting workflow. Note the existing prod↔sandbox ID remap table does not cover CSforAll-space sources; ported entries get new IDs and any cross-references must be remapped within the batch.
- **Alternatives considered**: author entries manually in Studio (error-prone at catalog scale); no porting (empty catalog can't be tested on aiday.org).

### D7 — Component relocation: leave `ActivityCollection` in place for this feature

- **Decision**: Do not move `components/csforall/activityCollection/` in this feature; record an optional cleanup task (move under `components/contentful/activityCatalog/`) for when CSforAll compat is removed.
- **Rationale**: The component is brand-agnostic; moving it now churns imports/tests/storybook without behavior value and widens the diff of a change that must not destabilize csforall.org.

### D8 — Out-of-scope notes for the later production project

- `carousel.slides` validation needs `activity` added if Experience-authored activity carousels are wanted (fact 3).
- Production rollout needs: content sync `sandbox → master`, tags in `master`, merge to `main`, and the canonical-host decision from D3.
- CSFORALL-COMPAT branch in `getContentfulActivities` + the CS_FOR_ALL brand gate + sitemap CSforAll emission are removable together at CSforAll retirement.

## Resolved clarifications

| Unknown                                                | Resolution                                                                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Does the Code.org space already hold activity content? | No — model, tags, and entries all absent **[CDA]**; must be created (D1, D5, D6).                                                            |
| How does the app pick the Contentful space per brand?  | It doesn't — one space per deployment via env vars; aiday.org deployment already points at Code.org `sandbox` **[code]**.                    |
| Does aiday.org need brand/middleware changes?          | No — it already resolves to `Brand.CODE_DOT_ORG` by default fallback **[code]**.                                                             |
| Must CSforAll keep working?                            | Yes until retirement — D2 keeps both brands served, compat labeled.                                                                          |
| Exact CSforAll source schema                           | Code-inferred only; Dee cross-checks in the CSforAll space before schema creation and porting (D6).                                          |
| Sitemap/SEO handling for a coded route on Code.org     | Extend existing coded-route emission + brand-aware canonical/icons (D3, D4).                                                                 |
| URL structure on Code.org                              | Clarified 2026-08-18: `/{locale}/hour-of-ai/activities` and `/{locale}/hour-of-code/activities`; CSforAll keeps old URLs; no redirects (D2). |
