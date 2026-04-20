# Performance Convention

## Purpose

This repository serves high-traffic public websites. Availability and
performance are product requirements, not cleanup tasks.

## Core Rules

- Default to cache-friendly designs.
- Default to SSR and server-side data fetching on hot paths.
- Prefer stale-but-available over fresh-but-down when the user experience can
  tolerate it.
- Use `stale-while-revalidate` (SWR) as the default public freshness strategy
  for cacheable marketing pages.
- Use `stale-if-error` (SIE) as the default availability backstop for cacheable
  marketing pages unless a route has a documented reason not to.
- Do not add uncached third-party or CMS work to hot request paths without
  explicit justification.
- Keep preview, draft, and personalized behavior off the public-cache path.
- Treat cache and revalidation changes as runtime-contract changes.

## SWR And SIE In This Repo

The current codebase uses these concepts concretely:

- `apps/marketing/src/cache/constants.ts` defines canonical cache strings with
  both SWR and SIE for fifteen-minute, one-hour, and one-day freshness windows.
- `apps/marketing/next.config.ts` applies the fifteen-minute SWR/SIE policy to
  locale and branded page paths.
- `apps/marketing/tests/e2e/cache.spec.ts` verifies cached public pages return
  both directives.
- draft mode and preview mode intentionally disable public caching.
- `apps/marketing/cicd/3-app/template.yml.erb` contains a CloudFront fallback
  that currently injects SWR when the origin omits `Cache-Control`; this
  fallback must be reviewed whenever canonical cache behavior changes because it
  is not the same thing as the app-level SIE-enabled policy.

## Request-Path Rules

- Public marketing pages SHOULD remain compatible with CDN caching and ISR.
- New server-side work MUST justify its latency and failure profile.
- New client-side execution on the critical path MUST justify why server
  rendering or a smaller hydrated island is insufficient.
- Expensive derived data SHOULD be built once, cached, and reused.
- Client-side boot code MUST avoid blocking first render unless the feature is
  essential for correctness, security, or consent.

## Cache Rules

- If a feature changes cache headers, revalidation windows, redirect caching, or
  tag invalidation, update:
  - app code
  - tests
  - infrastructure templates
- If a public route is cacheable, prefer explicit SWR and SIE semantics over ad
  hoc cache strings.
- If a route cannot safely use SIE, document why serving stale-on-error would be
  incorrect.
- Draft and preview behavior MUST not accidentally bleed into publicly cached
  responses.
- Redirects SHOULD remain cacheable unless a concrete business rule requires
  otherwise.

## Contentful Rules

- Use the existing cached client and tag-based invalidation patterns.
- New Contentful fetches MUST define:
  - cache strategy
  - invalidation strategy
  - fallback behavior
- Do not add duplicate CMS fetches in both server and client layers when one is
  sufficient.

## Frontend Rules

- All new React components MUST use MUI as the base UI layer.
- New React features MUST be server-rendered by default and keep client
  boundaries narrow.
- Higher-level marketing components SHOULD compose from the shared design system
  rather than recreate primitives.
- Asset choices SHOULD prefer modern formats and responsive delivery.
- Accessibility work is part of performance work: unstable layouts, hidden
  loading states, and script-heavy interactions are quality regressions.

## Validation Rules

- Performance-sensitive changes SHOULD add or update the smallest meaningful
  validation surface:
  - Jest for cache or route helpers
  - Storybook for render and interaction review
  - Playwright for cache, redirect, security, or deployed runtime behavior
- If a change alters hot-path behavior, document the expected latency or cache
  effect in the spec or plan.

## Contributor Guardrails

- Do not bypass existing cache helpers with ad hoc `fetch` behavior.
- Do not introduce broad `use client` boundaries around pages, layouts, or CMS
  composition without explicit documented approval.
- Do not replace canonical SWR/SIE cache policies with custom strings unless the
  new policy is documented and tested.
- Do not ship new synchronous third-party scripts without explicit approval.
- Do not lower availability to gain freshness unless the product requirement is
  clear and documented.
