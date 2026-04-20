# Codebase Architecture And Engineering Governance

## Purpose

This document explains how the `marketing-sites` monorepo is organized, how
requests and content move through it, which systems it depends on, and which
engineering conventions already govern safe changes. It intentionally indexes on
availability, performance, security, and contributor guardrails because this is
a high-traffic public website.

Related conventions:

- [Performance Convention](./performance-convention.md)
- [Contentful Component Convention](./contentful-component-convention.md)
- [Security And Privacy Guardrails](./security-and-privacy-guardrails.md)
- [SEO Convention](./seo-convention.md)
- [Project Constitution](../.specify/memory/constitution.md)

## Availability First

Availability is the primary engineering constraint for this repository.

- public routes should remain cacheable and resilient by default
- SWR/SIE behavior is part of the runtime contract, not an optimization detail
- preview and draft must stay isolated from public-cache behavior
- cache, redirect, and revalidation changes must be reviewed like production
  changes because they affect user-visible uptime

Everything else in this document should be read through that lens.

## SSR First

The runtime architecture is server-rendered by default and should stay that
way.

- route resolution, Contentful fetches, brand selection, and initial page
  composition belong on the server
- client-side code is reserved for unavoidable browser-only concerns such as
  consent SDKs, analytics SDKs, or isolated interactive islands
- `use client` boundaries should be narrow and should not absorb whole pages,
  layouts, or Contentful composition unless a documented exception exists
- hydration cost is part of the performance budget on this site

## Monorepo Topology

### Top-level toolchain

- Yarn workspaces and Turborepo coordinate builds, linting, tests, and dev
  servers across `apps/*` and `packages/*`.
- TypeScript is the primary implementation language.
- Shared linting, formatting, and type-checking live in `packages/lint-config`.
- CI is split by concern:
  - `Frontend-CI` orchestrates shared setup and teardown.
  - `Marketing-CI` validates the marketing app and marketing Storybook.
  - `Component-Library-CI` validates the design system package and its
    Storybook.

### Applications

- `apps/marketing`
  - Multi-tenant Next.js 15 marketing app using the App Router.
  - Main runtime surface for branded marketing experiences.
  - Owns middleware, cache configuration, telemetry, localization, privacy,
    and end-to-end coverage.
- `apps/marketing-storybook`
  - Storybook for higher-level marketing components and Contentful-authored page
    building blocks.
  - This layer is composed from design-system components and realistic CMS
    payloads.
- `apps/design-system-storybook`
  - Storybook for atomic and molecular `@code-dot-org/component-library`
    components.
  - Doubles as design review, accessibility validation, and visual regression
    surface.

### Packages

- `packages/component-library`
  - Shared React component library with per-component folders, colocated tests,
    and Storybook stories.
  - Built with `tsup`, CSS modules, and generated type declarations.
  - This design system is intentionally forked for marketing autonomy so the
    team can iterate without waiting on other Code.org frontend constraints.
  - Parts of this legacy design system remain in use, but new marketing-facing
    component work should prefer direct MUI implementations and only keep
    legacy usage where migration has not yet happened.
- `packages/component-library-styles`
  - Shared SCSS variables, semantic tokens, typography, and mixins.
- `packages/fonts`
  - Font packaging, locale-sensitive font loading, and Font Awesome injection.
- `packages/lint-config`
  - Shared ESLint, Prettier, Stylelint, lint-staged, and TypeScript configs.
- `packages/changelogs`
  - Release-it support for changelogs and publishing.

## Multi-Tenant Runtime Model

The marketing app is multi-tenant and brand-aware.

### Local development hostnames

- Branded local URLs use:
  - `http://[brand].marketing-sites.localhost:3001`
- Preview URLs use:
  - `http://preview-[brand].marketing-sites.localhost:3001`

Examples:

- `http://code.marketing-sites.localhost:3001`
- `http://preview-code.marketing-sites.localhost:3001`
- `http://csforall.marketing-sites.localhost:3001`
- `http://preview-csforall.marketing-sites.localhost:3001`

The E2E page object confirms this host pattern and treats preview as a first-
class runtime path rather than an ad hoc flag.

### Brand switching

Brand affects:

- theme selection
- header/footer implementation
- critical fonts
- favicon and SEO metadata
- Contentful component registration
- consent configuration
- analytics behavior

### Preview and draft

- Preview traffic uses the `preview-[brand]...` hostname pattern.
- Draft content is enabled through draft-mode routes and cookies.
- Cache behavior changes in preview and draft flows, so these modes are part of
  the runtime contract and are covered by E2E tests.

## Runtime Architecture

### Marketing app request lifecycle

The main request path in `apps/marketing` is:

1. Request enters Next middleware in `apps/marketing/src/middleware.ts`.
2. Middleware composes three runtime concerns in order:
   - `withRedirects`: check brand-aware redirects, including Contentful-backed
     redirect data.
   - `withLocale`: normalize paths to locale-prefixed routes using cookies and
     `Accept-Language`.
   - `withBrand`: detect the active brand from hostname and inject it into the
     route space.
3. The App Router resolves the request to
   `src/app/[brand]/[locale]/[[...paths]]/page.tsx`.
4. Page code derives the Contentful slug, checks preview and draft state, and
   fetches the page experience through `getExperience`.
5. The brand-specific component registry is loaded via
   `registerContentfulComponents`.
6. The per-brand, per-locale layout injects theme, fonts, telemetry, consent,
   analytics, localization, header, footer, and JSON-LD metadata.
7. The client-side `ExperiencePageLoader` mounts Contentful's
   `ExperienceRoot` with the serialized experience JSON.

### Major runtime layers inside `apps/marketing`

- Routing and layout
  - `src/app/layout.tsx` provides the global shell.
  - `src/app/[brand]/[locale]/layout.tsx` is the runtime boundary for brand,
    locale, theme, and providers.
  - `src/app/[brand]/[locale]/[[...paths]]/page.tsx` is the CMS page renderer.
  - These surfaces should remain server-rendered entry points rather than
    broad client boundaries.
- Middleware
  - `src/middleware/*.ts` manages redirects, localization, and brand routing.
  - The middleware chain is explicit and composable.
- Contentful integration
  - `src/contentful/client/*` creates delivery and preview clients with
    Next.js fetch caching and tag-based revalidation.
  - `src/contentful/get-experience.ts` is the main page fetch boundary.
  - `src/contentful/registration/*` maps brand-specific React components to
    Contentful component definitions.
  - `src/contentful/components/ExperiencePageLoader.tsx` is the narrow client
    bridge that registers components and mounts Contentful's `ExperienceRoot`.
  - The Contentful MCP is now an approved source-of-truth path for inspecting
    content types, entries, assets, and editor-side schema outside the app
    runtime.
- Providers
  - `src/providers/localize/*` loads LocalizeJS.
  - `src/providers/onetrust/*` loads OneTrust scripts and exposes consent state.
  - `src/providers/statsig/*` initializes experimentation and analytics.
  - `src/providers/newrelic/*` initializes browser monitoring.
  - `src/providers/environment/*` exposes environment values to the client.
  - These are the main places where browser-only concerns legitimately cross
    into the client runtime.
- Telemetry and logging
  - `src/logger/*` provides namespaced `pino` loggers.
  - `src/otel/*` defines OpenTelemetry helpers and sampling.
- Theming and branding
  - `src/themes/*`, `src/components/header/*`, and `src/components/footer/*`
    swap implementations by brand.
- SEO and search surfaces
  - `src/metadata/seo.ts` derives page metadata for Contentful Experience
    pages.
  - `src/app/sitemap.xml/route.ts` emits runtime sitemap entries from
    Contentful Experience pages and selected programmatic routes.
  - `src/app/robots.txt/route.ts` controls crawl behavior by environment and
    hostname.
  - `src/config/jsonLd/*` and selected components emit structured data for
    supported page types.
- Cache and revalidation
  - `cache-handler.mjs` composes local LRU and Redis caching.
  - `src/cache/constants.ts` defines CDN-facing cache policies.
  - `src/app/api/revalidate/route.ts` triggers tag and path revalidation from
    Contentful webhooks.

## Key Data Flows

### 1. CMS page delivery

1. Brand and locale are derived from host and path.
2. Slug is normalized from the catch-all route.
3. `getExperience` requests the Studio Experience by slug using delivery or
   preview clients.
4. Client requests are cached with explicit revalidation tags derived from
   Contentful entry ids and content types.
5. Contentful component definitions are registered by brand.
6. `ExperienceRoot` renders a CMS-authored tree using those mapped React
   components.

Implication:
CMS work is not isolated to a single file. A feature may require changes to
route handling, component definitions, registration, mocks, Storybook, and
revalidation. It should still keep data fetching and first render on the server
unless an isolated interactive island is truly required. Planning should prefer
MCP-confirmed content shapes over code inference when schema detail matters.
When a touched marketing component still depends on the deprecated design
system, planning should also evaluate whether a contained, low-risk MUI
migration can be completed without broad downstream impact.
Standard Contentful Experience pages already participate in sitemap generation
when they have a slug and are not marked `noindex`, so custom sitemap work is
usually only needed for non-Experience routes or intentionally special cases.

### 2. Localization and branding

1. Locale is sourced from the URL when present.
2. Missing locale is inferred from the `language_` cookie, then from
   `Accept-Language`, then defaulted to `en-US`.
3. Locale values are translated into LocalizeJS locale codes and dashboard
   locale codes.
4. Brand-specific routing and rendering then determine theme, assets, component
   registration, and consent behavior.

Implication:
Any change that looks "visual only" may still be brand-sensitive, locale-
sensitive, SEO-sensitive, and asset-sensitive.

### 3. Privacy, analytics, and monitoring

1. OneTrust scripts load before interactivity and expose consent state through
   context.
2. Statsig initialization depends on environment, brand, and stable ID rules.
3. New Relic initializes client-side.
4. Google Analytics is loaded when a measurement id exists.
5. OpenTelemetry and `pino` support server-side traces and logs.

Implication:
Third-party integrations are intentionally layered. New telemetry or analytics
must define consent expectations, failure behavior, data egress, and
availability impact.

### 4. Redirects, cache, and revalidation

1. Requests first consult redirect APIs and brand-specific redirect tables.
2. Redirect responses are explicitly cacheable at the CDN layer.
3. Marketing pages use ISR-style freshness with 15-minute revalidation.
4. Contentful client calls use fetch caching plus tag-based invalidation.
5. The Next cache handler prefers LRU and falls back to Redis, then repopulates
   LRU on Redis hits.
6. Contentful webhooks call `/api/revalidate` to invalidate paths and tags.

Implication:
Cache values are not implementation trivia. They are part of the availability
contract and are mirrored in infrastructure templates.

Observed cache policy usage in code:

- canonical public-cache constants in `apps/marketing/src/cache/constants.ts`
  use both:
  - `stale-while-revalidate` (SWR) to keep serving stale content while the next
    version is refreshed in the background
  - `stale-if-error` (SIE) to keep serving stale content when origin or
    dependency failures occur
- `apps/marketing/tests/e2e/cache.spec.ts` verifies public cached pages expose
  both directives
- preview and draft flows disable public caching and switch to private,
  non-cacheable responses
- `apps/marketing/cicd/3-app/template.yml.erb` currently contains a CloudFront
  fallback that injects SWR when Next.js omits `Cache-Control`; that fallback
  does not currently inject SIE, so cache-policy changes must review both the
  app constants and the infrastructure workaround together

### 5. Search and derived data

The activity catalog pulls structured entries from Contentful and converts them
into an Orama search database. This pattern is representative:

- fetch CMS entries
- normalize them into application-owned shapes
- derive optimized search or render structures
- keep fallbacks and defaults explicit

Implication:
Derived data should be built once, cached well, and reused rather than
recomputed on hot paths.

## Integration Points

### Primary external systems

- Contentful
  - delivery API
  - preview API
  - experiences SDK
  - management API for E2E support workflows
- LocalizeJS for translations
- OneTrust for consent
- Statsig for experimentation and web analytics
- Google Analytics
- New Relic browser agent
- OpenTelemetry exporters
- Redis for production cache persistence
- Mapbox for mapping features
- Applitools Eyes for visual regression testing

### Deployment and infrastructure touchpoints

- `apps/marketing/next.config.ts` defines standalone output, external packages,
  image formats, and cache headers.
- `apps/marketing/cache-handler.mjs` is a runtime dependency in production.
- `apps/marketing/cicd/3-app/template.yml.erb` contains infrastructure rules
  that must stay synchronized with app cache behavior.
- GitHub workflows enforce different validation suites by workspace.

## Existing Patterns And Conventions

### Shared-first composition

- Shared UI logic tends to live in `packages/component-library`,
  `packages/component-library-styles`, or `packages/fonts`.
- Brand-specific behavior is usually implemented as switchboards rather than
  forks:
  - `getHeader`
  - `getFooter`
  - `getMuiTheme`
  - Contentful registration selection

### Design system and marketing component layering

- `apps/design-system-storybook` is the review surface for atomic and molecular
  components.
- `apps/marketing-storybook` is the review surface for higher-level marketing
  components built from design-system primitives and Contentful payloads.
- Marketing components should prefer composition over ad hoc local primitives.
- All new React components should be built with MUI as the base UI layer.

### SSR-first rendering

- Server Components, server data fetching, and server composition are the
  default architecture for new work.
- Client Components are exceptions for browser APIs, local interaction state,
  consent, analytics, or third-party SDK integration that cannot execute on the
  server.
- Broad `use client` wrappers around layouts, routes, or Contentful trees are a
  regression unless there is a documented and reviewed reason.
- If interactivity is needed, prefer a server-rendered shell with a small
  hydrated island instead of client-rendering the full feature.

### Contentful component pattern

Marketing CMS components usually follow a repeatable structure:

1. React component implementation in `apps/marketing/src/components/contentful/...`
2. Contentful Studio component definition alongside it
3. Brand-specific registration entry under
   `apps/marketing/src/contentful/registration/...`
4. Server fetch through `apps/marketing/src/contentful/get-experience.ts`
5. Narrow client bridge through
   `apps/marketing/src/contentful/components/ExperiencePageLoader.tsx`
6. Storybook coverage in `apps/marketing-storybook`
7. Mock CMS payloads in `stories/__mocks__` or in-memory entities
8. Optional inclusion in the "All The Things" E2E surface

Official Contentful docs describe these as Studio Experiences custom
components. The important practical implication for this repo is:

- the page shell and fetch path stay SSR-first
- the Studio component map is still registered through the client SDK
- `ExperienceRoot` remains a small, explicit client boundary
- preview URL and iframe/CSP compatibility are part of the authoring contract
- the "All The Things" page is a lightweight smoke test for the Contentful
  Studio Experiences integration, not the main place to validate component
  detail

### Contentful MCP usage

- The Contentful MCP can inspect live content types, entries, and assets in the
  configured space/environment and should be treated as the source of truth for
  schema-heavy planning.
- App code still matters because runtime assumptions, fallbacks, and brand
  registration live here, but code alone is no longer sufficient for claiming a
  full content-model shape when MCP is available.
- Research and planning should note which details were confirmed via MCP and
  which are still inferred from the application layer.

### Test colocation

- Unit and integration-style tests are colocated under `__tests__` near source.
- Component-library stories live near the components they document.
- Marketing Storybook centralizes CMS-oriented stories because those components
  depend on content payloads, decorators, and in-memory entities.

### Guardrails-first contributor model

This repo is structured to reduce risk from hurried or vibe-coded changes:

- shared lint config instead of per-feature style drift
- Storybook as a required review surface
- CI split by product surface
- explicit cache and redirect tests
- explicit consent and security checks
- infrastructure-linked comments around cache contracts

These are not optional niceties. They are operational safeguards.

## Testing Standards Observed In The Repo

### Design system package

- Unit tests use Jest, Testing Library, and `user-event`.
- Accessibility is exercised in Storybook test-runner via `axe-playwright`.
- Visual regression is enforced through Applitools Eyes.
- All React components should meet or exceed WCAG AA standards.

### Marketing app

- Jest covers route handlers, config utilities, middleware, selectors,
  providers, and Contentful integration helpers.
- Playwright covers cross-system concerns:
  - cache headers
  - redirects
  - sitemap and robots
  - OneTrust behavior
  - Statsig readiness
  - security headers and HTTPS redirects
  - major page journeys
- The "All The Things" UI flow is best understood as a lightweight smoke test
  for the integration between Contentful and the marketing app. It helps catch
  broken registrations or rendering wiring, but it does not replace Storybook,
  focused Jest coverage, or targeted E2E flows.
- E2E docs explicitly say the suite should be used sparingly and only for
  behaviors that cannot be adequately covered by lower-level tests.

### Marketing component workflow

1. If the change requires a design-system update, change
   `packages/component-library` first and ensure design-system Storybook CI
   checks pass.
2. If the change is at the marketing component layer, update
   `apps/marketing` and `apps/marketing-storybook` and ensure marketing
   Storybook CI checks pass.
3. If the change introduces a new Contentful building block, complete the full
   registration workflow before treating the work as done.

## Availability And Performance Requirements

Availability and performance are primary engineering constraints for this
repository.

### Requirements already visible in code

- marketing pages are configured for standalone deployment
- cache headers use `stale-while-revalidate` (SWR) and
  `stale-if-error` (SIE)
- Contentful requests use force-cache with tag-based revalidation
- Redis is optional but first-class for production cache persistence
- redirect responses are cacheable and verified by tests
- image optimization prefers `avif` and `webp`
- infrastructure templates explicitly optimize for global performance and
  availability
- E2E tests verify cache and security behavior on deployed-like paths

Operational meaning of the cache strategy:

- SWR is the default freshness strategy for public marketing pages
- SIE is the availability backstop when origin or dependency failures occur
- draft and preview intentionally bypass that public SWR/SIE contract
- infrastructure fallbacks must not silently diverge from the app-level policy

### Operational interpretation

- prefer availability-preserving fallbacks over hard failures
- do not move uncached external work onto hot request paths without strong
  justification
- preserve cacheability unless a feature truly requires personalized or draft
  behavior
- treat cache header changes as deployment changes, not local implementation
  details
- minimize client-side script cost on the critical path

Detailed rules live in [Performance Convention](./performance-convention.md).

## Security And Contributor Guardrails

### Security posture visible in code

- strict transport security is tested
- HTTP to HTTPS redirects are tested
- draft and revalidation routes are token-protected
- consent is handled through OneTrust before analytics activation
- logs and telemetry are namespaced and structured
- secrets are expected via environment variables, not source control

### Privacy-policy baseline

The official [Code.org Privacy Policy](https://code.org/en-US/privacy)
establishes engineering-relevant constraints for this repo and takes precedence
over local guidance when privacy handling is in doubt:

- minimize personal-data collection
- do not sell personal information or use it for ads
- apply physical, administrative, and technical safeguards
- treat School-provided Student Records as subject to school direction
- hold partners to privacy and security standards no less stringent than
  Code.org's own

The policy also states that School-directed student data may be covered by
FERPA or similar student privacy laws. Inference: contributors should treat any
school-linked data flow as a product and compliance concern, not just an
implementation detail.

### Guardrails for contributors

- preserve token and secret boundaries on any admin, preview, draft, or
  revalidation route
- do not add new third-party scripts or SDKs without consent, ownership, and
  failure-mode documentation
- do not introduce new personal-data collection, user-input fields, or
  third-party data egress without documenting the policy purpose, downstream
  recipients, retention/deletion path, and consent expectations
- do not use real student, teacher, donor, or support-request data in Storybook,
  Contentful entries, tests, screenshots, or docs
- escalate when a change may touch Student Records, school-directed data, or
  under-13 flows and the privacy-policy impact is not obvious
- do not weaken cache, security-header, or redirect behavior without matching
  test updates
- prefer small, reviewable changes that pass the relevant Storybook and CI
  gates before broader rollout

These rules matter most when contributors are moving quickly or relying heavily
on generated code.

## Code Quality Assessment

### Strengths

- Clear separation between shared packages and app-specific code.
- Strong use of colocated tests for units, routes, and utilities.
- Storybook is treated as an engineering surface, not side documentation.
- Cache, telemetry, privacy, and consent concerns are explicit in code
  structure.
- Brand and locale differences are centralized in switchboards instead of
  scattered conditionals.
- External integrations generally degrade safely instead of breaking page
  rendering.

### Risks And Maintenance Pressure Points

- Contentful registration is highly manual. Forgetting one of component,
  definition, registration, mocks, or follow-up coverage is an easy regression
  path.
- Schema knowledge can drift if contributors rely only on TypeScript types and
  not the actual Contentful space configuration.
- Cache policy values are duplicated across application code and infrastructure
  templates; drift would be costly under real traffic.
- Third-party providers are layered throughout the runtime shell, so ownership,
  consent classification, and failure behavior must stay explicit.
- Some runtime behavior intentionally fails open, such as missing analytics or
  CMS configuration. That reduces downtime risk, but it can also hide broken
  environments unless logs and tests catch it.
- Shared lint-config documentation has some drift relative to current usage,
  which is a reminder to keep contributor guidance current.

## Governance: How These Findings Should Guide Technical Decisions

### 1. Choose the correct layer first

- If a change affects reusable UI, tokens, fonts, or linting, default to the
  shared package.
- If a change is a higher-level marketing composition, keep it in the marketing
  layer and validate it in marketing Storybook.
- All new React components should compose from MUI and the shared design-system
  layer rather than introducing a parallel UI foundation.

### 2. Treat CMS work as cross-cutting

- A Contentful feature is complete only when data fetch, registration, preview
  behavior, stories, mocks, and revalidation impact are all addressed.
- Changes to Contentful payload shape should include explicit fallback behavior
  for partially populated content.
- Use Contentful MCP during planning to confirm the real content type shape,
  field validations, reference constraints, and relevant entries/assets before
  locking the spec.

### 3. Match validation depth to the change

- Design-system changes should usually require unit tests, Storybook stories,
  accessibility validation, and visual review.
- Marketing runtime changes should usually require focused Jest coverage first.
- E2E should be reserved for true cross-system behavior: caching, redirects,
  consent, analytics, security, or CMS/runtime integration.

### 4. Optimize for availability first

- Avoid introducing synchronous external dependencies on hot request paths.
- Preserve CDN and ISR cacheability wherever possible.
- Keep preview, draft, and personalized behaviors isolated from public-cache
  flows.
- Treat cache/revalidation changes as production-impacting work.

### 5. Make security and failure modes explicit

- Every new integration should document owner, data sent externally, consent
  category, failure mode, and required tests.
- Every feature that touches personal data should document data minimization,
  downstream recipients, deletion/retention expectations, and whether FERPA or
  other student privacy obligations may apply.
- Silent degradation is acceptable only when logs, docs, and tests make the
  degraded state discoverable.

### 6. Preserve runtime contracts

- If cache lifetimes, revalidation behavior, or redirect semantics change,
  application code, tests, and infrastructure templates must all be updated in
  the same work.
- If locale or brand routing changes, middleware, layouts, SEO metadata, and
  review surfaces must be checked together.

## Constitution Alignment

This analysis directly supports the current constitution:

- **Shared System First**
  - confirmed by the heavy use of shared packages and brand switchboards
- **Storybook-Backed Accessible UX**
  - confirmed by the two distinct Storybooks and required accessibility review
    surfaces
- **Quality Gates Are Release Gates**
  - confirmed by colocated tests, CI workflows, and the explicit E2E policy
- **Observable, Cached, and Privacy-Safe Operations**
  - confirmed by OneTrust, Statsig, New Relic, OpenTelemetry, `pino`, cache
    instrumentation, and infra-linked cache contracts
- **Spec-Driven Incremental Delivery**
  - reinforced by the need to inventory affected brands, runtime flows,
    registrations, and availability impact before implementation
