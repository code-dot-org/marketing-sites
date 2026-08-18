# Quickstart: Activity Catalog on the Code.org Brand

## Prerequisites

- `apps/marketing/.env` pointed at the Code.org space, sandbox env (already the checked-out default):
  `CONTENTFUL_SPACE_ID=90t6bu6vlf76`, `CONTENTFUL_ENV_ID=sandbox`, delivery/preview tokens set.
- Dependencies installed (`yarn` at repo root).

## Run locally

```bash
yarn dev   # from apps/marketing (or the repo's turbo dev task)
```

Open:

- Code.org brand (new): `http://code.marketing-sites.localhost:3001/en-US/hour-of-ai/activities`
  and `.../en-US/hour-of-code/activities`
- Any unknown subdomain also resolves to the Code.org brand (default fallback) — aiday.org behaves the same way in deployment.

Expected before content exists in sandbox: page renders with Code.org header/footer/theme, hero, an empty results grid, and footer — no error. After the `activity` type + tagged entries exist (per `contracts/contentful-activity-content-type.md`): cards render, all nine facets populate, filtering and `?term=` search work, and selections round-trip through the URL.

CSforAll regression check (compat path only — content requires the CSforAll space deployment env): the CS_FOR_ALL brand still queries `curriculum` and csforall.org behavior is unchanged; covered by Jest rather than local rendering.

## Verify

```bash
# from apps/marketing
yarn test src/app/\[brand\]/\[locale\] src/modules/activityCatalog src/components/contentful/activityCatalog src/app/sitemap.xml
yarn tsc --noEmit   # or the workspace typecheck task
yarn prettier --check .   # ALWAYS before committing (husky hook is non-executable)
```

- Sitemap: `http://code.marketing-sites.localhost:3001/sitemap.xml` includes `/hour-of-ai/activities` and `/hour-of-code/activities`.
- Metadata: page `<head>` shows the Code.org favicon set and a `https://code.org/{locale}/{activityType}/activities` canonical.
- Footer cross-link: the Hour of AI page links to `/hour-of-code/activities` (and vice versa).
- Locale: `http://code.marketing-sites.localhost:3001/es-ES/hour-of-ai/activities` renders and its canonical carries the locale.
- Cache headers: `curl -sI` a new catalog route and an existing public Code.org route — `Cache-Control`/freshness headers must match the SWR/SIE pattern; in draft mode the response must not be publicly cacheable.
- Draft preview: with draft mode enabled (preview host), unpublished sandbox activities appear.

## aiday.org test phase

1. Merge to the `sandbox` branch (never `main` — production is a later project).
2. After deploy, verify `https://aiday.org/en-US/hour-of-ai/activities` (and `/en-US/hour-of-code/activities`): content, facets, search, empty states, sitemap entries, canonical → `code.org`, cache headers match other public routes.
3. Content sign-off: entry count on aiday matches the approved batch; Dee publishes drafts as they're reviewed.
